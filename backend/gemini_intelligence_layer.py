"""
gemini_intelligence_layer.py — Vertex AI version

Uses Google Cloud Vertex AI instead of Gemini API key.
No quota issues. Uses your Google Cloud project credentials.

Setup:
  pip install google-cloud-aiplatform
  Set GOOGLE_APPLICATION_CREDENTIALS=path/to/vertex_key.json
  Set VERTEX_PROJECT_ID=your-project-id
  Set VERTEX_LOCATION=us-central1

Usage:
  python gemini_intelligence_layer.py --input in.json --output out.json
  python gemini_intelligence_layer.py --test
"""

import json, sys, os, time, argparse
from pathlib import Path

import warnings
warnings.filterwarnings("ignore", category=FutureWarning)


# Auto-load .env
from pathlib import Path as _Path
_env = _Path(__file__).parent / ".env"
if _env.exists():
    for _line in _env.read_text().splitlines():
        _line = _line.strip()
        if _line and not _line.startswith("#") and "=" in _line:
            _k, _, _v = _line.partition("=")
            os.environ.setdefault(_k.strip(), _v.strip().strip('"'))


os.environ.setdefault("GEMINI_API_KEY", "")


def get_vertex_client():
    """Initialize Vertex AI client using service account credentials."""
    project_id = os.environ.get("VERTEX_PROJECT_ID", "")
    location   = os.environ.get("VERTEX_LOCATION", "us-central1")
    creds_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS", "")

    if not project_id:
        print("❌ VERTEX_PROJECT_ID not set in .env", file=sys.stderr)
        return None, None, None

    try:
        import vertexai
        from vertexai.preview.generative_models import GenerativeModel

        if creds_path:
            print(f"✅ Using credentials: {creds_path}", file=sys.stderr)
        
        vertexai.init(project=project_id, location=location)
        model = GenerativeModel("gemini-2.5-flash")
        print(f"✅ Vertex AI ready (project={project_id}, location={location})", file=sys.stderr)
        return model, project_id, location

    except ImportError:
        print("❌ Run: pip install google-cloud-aiplatform", file=sys.stderr)
        return None, None, None
    except Exception as e:
        print(f"❌ Vertex AI init error: {e}", file=sys.stderr)
        return None, None, None


def build_student_text(profile: dict) -> str:
    level   = profile.get("level", "MS")
    gpa     = profile.get("gpa", "unknown")
    gs      = profile.get("gradeSystem", "4.0")
    gre     = profile.get("greScore")
    ielts   = profile.get("ieltsScore")
    toefl   = profile.get("toeflScore")
    nation  = profile.get("nationality", "India")
    fields  = profile.get("targetFields", ["Computer Science"])
    budget  = profile.get("budgetUSD", 0)

    gpa_ctx = f"{gpa}/4.0"
    if gs == "percentage":  gpa_ctx = f"{gpa}% (Indian percentage)"
    elif gs == "10.0":      gpa_ctx = f"{gpa}/10.0 (Indian 10-point scale)"

    if gs == "4.0" and gpa:
        try:
            if float(gpa) < 3.5:
                gpa_ctx += " — likely average Indian engineering college, not IIT/NIT"
            elif float(gpa) >= 3.7:
                gpa_ctx += " — competitive profile"
        except: pass

    lang = f"IELTS {ielts}" if ielts else (f"TOEFL {toefl}" if toefl else "not provided")
    goals = [k.replace("want", "") for k, v in profile.items() if k.startswith("want") and v]

    return f"""Student Profile:
- Nationality: {nation}
- Target: {level} in {', '.join(fields)}
- GPA: {gpa_ctx}
- GRE: {f'{gre}/340' if gre else 'not provided'}
- Language: {lang}
- Budget: ${budget:,}/year
- Goals: {', '.join(goals) if goals else 'general'}
- Publications: none assumed
- Work experience: 0 years assumed"""


def build_prompt(student_text: str, candidates: list, level: str) -> str:
    slim = [{
        "universityName":       c.get("universityName", c.get("name", "")),
        "country":              c.get("country"),
        "program":              c.get("name", f"{level} CS"),
        "tier":                 c.get("tier"),
        "competitivenessScore": c.get("competitivenessScore"),
        "typicalGPARange":      c.get("typicalGPARange"),
        "researchIntensity":    c.get("researchIntensity"),
        "staticScore":          c.get("score"),
    } for c in candidates]

    return f"""You are an expert graduate admissions counselor with 15+ years experience advising Indian students.

{student_text}

Evaluate each university with REALISTIC admission probability for this SPECIFIC Indian student profile.

IMPORTANT CONTEXT:
- Top US MS CS (MIT/Stanford/CMU/Cornell) receive 10,000+ apps; median admitted GPA is 3.8+ from IIT/NIT
- A 3.4 GPA from average Indian college is NOT competitive at ELITE tier US programs — admit chance <5%
- A 3.9 GPA from average Indian college is still below median for MIT/Stanford but competitive for CMU/Cornell
- Canadian programs (UofT, Waterloo, UBC) are selective; McGill is more accessible
- German programs have low selectivity but require APS documentation
- UK 1-year MSc programs are more accessible than US equivalents
- "Safe" means genuinely >60% admit probability for THIS profile

Universities:
{json.dumps(slim, indent=2)}

Return ONLY a valid JSON array (no markdown, no extra text):
[
  {{
    "universityName": "exact name from input",
    "geminiAdmitProbability": {{
      "label": "Very Low|Low|Fair|Moderate|High",
      "range": "< 5%|5-15%|15-30%|30-50%|50-70%|70-85%",
      "category": "reach|match|safe"
    }},
    "keyInsight": "1 specific sentence about fit for this student",
    "riskFactors": ["risk1", "risk2"],
    "strengthFactors": ["strength1"],
    "recommendationNote": "1 actionable tip for this student"
  }}
]"""


def enrich_with_vertex(candidates: list, profile: dict, model) -> dict:
    """Send candidates to Vertex AI Gemini and return dict keyed by universityName."""
    if not model or not candidates:
        return {}

    student_text = build_student_text(profile)
    level        = profile.get("level", "MS")
    results      = {}
    batches      = [candidates[i:i+12] for i in range(0, len(candidates), 12)]

    for i, batch in enumerate(batches):
        print(f"  Batch {i+1}/{len(batches)} ({len(batch)} universities)...", file=sys.stderr)
        prompt = build_prompt(student_text, batch, level)

        try:
            response = model.generate_content(prompt)
            text = response.text.strip()

            # Strip markdown if present
            if "```json" in text: text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:   text = text.split("```")[1].split("```")[0].strip()

            import re
            text = re.sub(r',\s*}', '}', text)   # trailing commas in objects
            text = re.sub(r',\s*]', ']', text)   # trailing commas in arrays
            text = re.sub(r'//.*?\n', '\n', text) # remove comments
            
            parsed = json.loads(text)
            for item in parsed:
                name = item.get("universityName", "")
                if name:
                    results[name] = item
                    prob = item.get("geminiAdmitProbability", {})
                    print(f"    ✅ {name}: {prob.get('range', '?')}", file=sys.stderr)

            if i < len(batches) - 1:
                time.sleep(1)

        except json.JSONDecodeError as e:
            print(f"  JSON parse error batch {i+1}: {e}", file=sys.stderr)
        except Exception as e:
            print(f"  Error batch {i+1}: {e}", file=sys.stderr)

    return results


def merge(static_results: list, gemini_map: dict) -> list:
    merged = []
    for item in static_results:
        name   = item.get("universityName", "")
        gemini = gemini_map.get(name, {})
        enhanced = dict(item)

        if gemini:
            enhanced["admitProbability"]   = gemini.get("geminiAdmitProbability", item.get("admitProbability"))
            enhanced["category"]           = (gemini.get("geminiAdmitProbability") or {}).get("category", item.get("category"))
            enhanced["keyInsight"]         = gemini.get("keyInsight")
            enhanced["riskFactors"]        = gemini.get("riskFactors", [])
            enhanced["strengthFactors"]    = gemini.get("strengthFactors", [])
            enhanced["recommendationNote"] = gemini.get("recommendationNote")
            enhanced["geminiEnhanced"]     = True
        else:
            enhanced["geminiEnhanced"]     = False

        merged.append(enhanced)

    cat_order = {"safe": 0, "match": 1, "reach": 2}
    merged.sort(key=lambda x: (cat_order.get(x.get("category", "reach"), 2), -x.get("score", 0)))
    return merged


def run_test():
    print(json.dumps({
        "enriched": [{"universityName": "Carnegie Mellon University", "score": 55}],
        "geminiUsed": False,
        "enrichedCount": 0
    }))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input",  help="Path to input JSON file")
    parser.add_argument("--output", help="Path to write output JSON file")
    parser.add_argument("--test",   action="store_true")
    args = parser.parse_args()

    if args.test:
        run_test()
        return

    if not args.input or not args.output:
        print("Usage: python gemini_intelligence_layer.py --input in.json --output out.json", file=sys.stderr)
        sys.exit(1)

    data     = json.loads(Path(args.input).read_text(encoding="utf-8"))
    profile  = data.get("profile", {})
    results  = data.get("results", [])
    top_n    = data.get("topN", 30)

    print(f"Processing {min(top_n, len(results))} universities for {profile.get('nationality','?')} "
          f"{profile.get('level','?')} student (GPA={profile.get('gpa','?')})", file=sys.stderr)

    model, _, _ = get_vertex_client()

    if model:
        gemini_map     = enrich_with_vertex(results[:top_n], profile, model)
        enriched       = merge(results[:top_n], gemini_map)
        enriched_count = sum(1 for r in enriched if r.get("geminiEnhanced"))
    else:
        enriched       = results[:top_n]
        enriched_count = 0

    output = {
        "enriched":      enriched,
        "geminiUsed":    model is not None,
        "enrichedCount": enriched_count,
    }

    Path(args.output).write_text(
        json.dumps(output, indent=2, ensure_ascii=False),
        encoding="utf-8"
    )
    print(f"✅ Written {enriched_count} enriched results to {args.output}", file=sys.stderr)


if __name__ == "__main__":
    main()