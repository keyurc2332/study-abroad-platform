"""
enrich_intelligence.py

Adds intelligence fields to every university using Gemini API.
Fields added:
  - competitivenessScore  (1-10, how hard is admission really)
  - typicalGPAMin/Max     (realistic admitted student GPA range)
  - typicalGREMin         (typical GRE for admitted students)
  - researchIntensity     (High/Medium/Low - if missing)
  - prPathwayScore        (1-10, PR pathway strength)
  - jobMarketScore        (1-10, local job market for CS grads)
  - tier                  (normalized: ELITE/TOP/STRONG/GOOD/ACCESSIBLE)
  - careerOutcomesSummary (avg salary + employment rate)

Run once, saves permanently to data/ files.
Usage:
  python enrich_intelligence.py --api-key YOUR_GEMINI_KEY
  python enrich_intelligence.py --api-key YOUR_KEY --file universities_usa_ms.json
"""

import json, os, time, argparse, sys, shutil
from pathlib import Path

DATA_DIR   = Path(__file__).parent / "data"
BACKUP_DIR = Path(__file__).parent / "data_backup_intelligence"

# ── Tier normalization map ─────────────────────────────────────────────────────
TIER_NORMALIZE = {
    "TIER_1_ELITE": "ELITE", "TIER_1_TOP": "ELITE", "TIER_1_GLOBAL": "ELITE",
    "TIER_1_STEM": "ELITE", "TIER_1_RESEARCH": "ELITE", "TIER_1_STEM_RESEARCH": "ELITE",
    "TIER_1_BUSINESS": "ELITE", "TIER_1_SOCIAL_SCIENCE": "ELITE",
    "PHD_ELITE": "ELITE",
    "TIER_2_STRONG": "TOP", "TIER_2_ELITE": "TOP", "TIER_2_TOP": "TOP",
    "PHD_TOP": "TOP",
    "TIER_3_GOOD": "STRONG", "TIER_3_RESEARCH": "STRONG", "TIER_3_STRONG": "STRONG",
    "PHD_STRONG": "STRONG",
    "TIER_3_MODERATE": "GOOD",
    "TIER_4_ACCESSIBLE": "ACCESSIBLE", "TIER_5_SAFE": "ACCESSIBLE",
}

# ── Known competitiveness scores (saves API calls for well-known schools) ──────
KNOWN_COMPETITIVENESS = {
    # USA ELITE
    "Massachusetts Institute of Technology": {"competitivenessScore": 10, "typicalGPAMin": 3.85, "typicalGPAMax": 4.0,  "typicalGREMin": 330, "tier": "ELITE"},
    "Stanford University":                   {"competitivenessScore": 10, "typicalGPAMin": 3.85, "typicalGPAMax": 4.0,  "typicalGREMin": 329, "tier": "ELITE"},
    "Harvard University":                    {"competitivenessScore": 10, "typicalGPAMin": 3.80, "typicalGPAMax": 4.0,  "typicalGREMin": 328, "tier": "ELITE"},
    "Carnegie Mellon University":            {"competitivenessScore": 10, "typicalGPAMin": 3.75, "typicalGPAMax": 4.0,  "typicalGREMin": 325, "tier": "ELITE"},
    "University of California Berkeley":     {"competitivenessScore": 9,  "typicalGPAMin": 3.70, "typicalGPAMax": 3.95, "typicalGREMin": 325, "tier": "ELITE"},
    "California Institute of Technology":    {"competitivenessScore": 10, "typicalGPAMin": 3.85, "typicalGPAMax": 4.0,  "typicalGREMin": 330, "tier": "ELITE"},
    # USA TOP
    "Georgia Institute of Technology":       {"competitivenessScore": 8,  "typicalGPAMin": 3.60, "typicalGPAMax": 3.90, "typicalGREMin": 320, "tier": "TOP"},
    "University of Illinois Urbana-Champaign":{"competitivenessScore": 8, "typicalGPAMin": 3.60, "typicalGPAMax": 3.90, "typicalGREMin": 320, "tier": "TOP"},
    "University of Michigan":                {"competitivenessScore": 8,  "typicalGPAMin": 3.60, "typicalGPAMax": 3.90, "typicalGREMin": 320, "tier": "TOP"},
    "Cornell University":                    {"competitivenessScore": 9,  "typicalGPAMin": 3.70, "typicalGPAMax": 3.95, "typicalGREMin": 325, "tier": "ELITE"},
    "Columbia University":                   {"competitivenessScore": 9,  "typicalGPAMin": 3.65, "typicalGPAMax": 3.95, "typicalGREMin": 323, "tier": "ELITE"},
    "University of California Los Angeles":  {"competitivenessScore": 8,  "typicalGPAMin": 3.60, "typicalGPAMax": 3.90, "typicalGREMin": 320, "tier": "TOP"},
    "University of California San Diego":    {"competitivenessScore": 8,  "typicalGPAMin": 3.55, "typicalGPAMax": 3.85, "typicalGREMin": 318, "tier": "TOP"},
    "Purdue University":                     {"competitivenessScore": 7,  "typicalGPAMin": 3.40, "typicalGPAMax": 3.75, "typicalGREMin": 315, "tier": "STRONG"},
    "Texas A&M University":                  {"competitivenessScore": 7,  "typicalGPAMin": 3.40, "typicalGPAMax": 3.75, "typicalGREMin": 314, "tier": "STRONG"},
    "University of Southern California":     {"competitivenessScore": 7,  "typicalGPAMin": 3.40, "typicalGPAMax": 3.80, "typicalGREMin": 315, "tier": "STRONG"},
    "University of Wisconsin Madison":       {"competitivenessScore": 7,  "typicalGPAMin": 3.40, "typicalGPAMax": 3.80, "typicalGREMin": 315, "tier": "STRONG"},
    # Canada
    "University of Toronto":                 {"competitivenessScore": 8,  "typicalGPAMin": 3.60, "typicalGPAMax": 3.90, "typicalGREMin": None, "tier": "ELITE", "prPathwayScore": 9},
    "University of British Columbia":        {"competitivenessScore": 8,  "typicalGPAMin": 3.55, "typicalGPAMax": 3.85, "typicalGREMin": None, "tier": "ELITE", "prPathwayScore": 9},
    "McGill University":                     {"competitivenessScore": 7,  "typicalGPAMin": 3.50, "typicalGPAMax": 3.80, "typicalGREMin": None, "tier": "TOP",   "prPathwayScore": 8},
    "University of Alberta":                 {"competitivenessScore": 6,  "typicalGPAMin": 3.20, "typicalGPAMax": 3.60, "typicalGREMin": None, "tier": "STRONG", "prPathwayScore": 9},
    "University of Waterloo":                {"competitivenessScore": 7,  "typicalGPAMin": 3.40, "typicalGPAMax": 3.75, "typicalGREMin": None, "tier": "TOP",   "prPathwayScore": 9},
    "McMaster University":                   {"competitivenessScore": 6,  "typicalGPAMin": 3.20, "typicalGPAMax": 3.60, "typicalGREMin": None, "tier": "STRONG", "prPathwayScore": 9},
    "University of Calgary":                 {"competitivenessScore": 5,  "typicalGPAMin": 3.00, "typicalGPAMax": 3.50, "typicalGREMin": None, "tier": "GOOD",   "prPathwayScore": 9},
    "Dalhousie University":                  {"competitivenessScore": 4,  "typicalGPAMin": 2.80, "typicalGPAMax": 3.30, "typicalGREMin": None, "tier": "GOOD",   "prPathwayScore": 8},
    "University of Ottawa":                  {"competitivenessScore": 5,  "typicalGPAMin": 3.00, "typicalGPAMax": 3.50, "typicalGREMin": None, "tier": "GOOD",   "prPathwayScore": 9},
    "University of Manitoba":                {"competitivenessScore": 3,  "typicalGPAMin": 2.70, "typicalGPAMax": 3.20, "typicalGREMin": None, "tier": "ACCESSIBLE", "prPathwayScore": 8},
    "Concordia University":                  {"competitivenessScore": 4,  "typicalGPAMin": 2.80, "typicalGPAMax": 3.30, "typicalGREMin": None, "tier": "GOOD",   "prPathwayScore": 8},
    # UK
    "University of Oxford":                  {"competitivenessScore": 10, "typicalGPAMin": 3.85, "typicalGPAMax": 4.0,  "typicalGREMin": None, "tier": "ELITE"},
    "University of Cambridge":               {"competitivenessScore": 10, "typicalGPAMin": 3.85, "typicalGPAMax": 4.0,  "typicalGREMin": None, "tier": "ELITE"},
    "Imperial College London":               {"competitivenessScore": 9,  "typicalGPAMin": 3.70, "typicalGPAMax": 3.95, "typicalGREMin": None, "tier": "ELITE"},
    "University College London":             {"competitivenessScore": 8,  "typicalGPAMin": 3.50, "typicalGPAMax": 3.85, "typicalGREMin": None, "tier": "TOP"},
    "University of Edinburgh":               {"competitivenessScore": 7,  "typicalGPAMin": 3.40, "typicalGPAMax": 3.75, "typicalGREMin": None, "tier": "TOP"},
    "King's College London":                 {"competitivenessScore": 7,  "typicalGPAMin": 3.30, "typicalGPAMax": 3.70, "typicalGREMin": None, "tier": "TOP"},
    # Australia
    "University of Melbourne":               {"competitivenessScore": 7,  "typicalGPAMin": 3.30, "typicalGPAMax": 3.70, "typicalGREMin": None, "tier": "TOP",   "prPathwayScore": 7},
    "Australian National University":        {"competitivenessScore": 7,  "typicalGPAMin": 3.30, "typicalGPAMax": 3.70, "typicalGREMin": None, "tier": "TOP",   "prPathwayScore": 7},
    "University of Sydney":                  {"competitivenessScore": 7,  "typicalGPAMin": 3.30, "typicalGPAMax": 3.70, "typicalGREMin": None, "tier": "TOP",   "prPathwayScore": 7},
    "University of New South Wales":         {"competitivenessScore": 7,  "typicalGPAMin": 3.30, "typicalGPAMax": 3.70, "typicalGREMin": None, "tier": "TOP",   "prPathwayScore": 7},
    # Germany
    "Technical University of Munich":        {"competitivenessScore": 8,  "typicalGPAMin": 3.50, "typicalGPAMax": 3.85, "typicalGREMin": None, "tier": "ELITE"},
    "RWTH Aachen University":                {"competitivenessScore": 7,  "typicalGPAMin": 3.30, "typicalGPAMax": 3.70, "typicalGREMin": None, "tier": "TOP"},
    "Heidelberg University":                 {"competitivenessScore": 7,  "typicalGPAMin": 3.30, "typicalGPAMax": 3.70, "typicalGREMin": None, "tier": "TOP"},
}

# PR pathway score by country (default if not specifically known)
PR_DEFAULTS = {
    "Canada":    {"prPathwayScore": 9, "jobMarketScore": 8},
    "Australia": {"prPathwayScore": 7, "jobMarketScore": 7},
    "UK":        {"prPathwayScore": 4, "jobMarketScore": 7},
    "USA":       {"prPathwayScore": 3, "jobMarketScore": 9},
    "Germany":   {"prPathwayScore": 6, "jobMarketScore": 7},
}

def ask_gemini(client, name, country, ranking, acceptance_rate):
    prompt = f"""You are a graduate admissions expert. Provide data for this university.

University: {name}
Country: {country}
QS Ranking: {ranking}
Overall acceptance rate: {acceptance_rate}%

Return ONLY a raw JSON object (no markdown):
{{
  "competitivenessScore": <1-10, how hard is graduate CS/engineering admission. 10=MIT/Stanford, 1=very accessible>,
  "typicalGPAMin": <minimum GPA of typically admitted MS CS students on 4.0 scale>,
  "typicalGPAMax": <maximum GPA range for admitted MS CS students>,
  "typicalGREMin": <typical minimum GRE total score for admitted students, null if GRE not required>,
  "researchIntensity": <"Very High"|"High"|"Medium"|"Low">,
  "tier": <"ELITE"|"TOP"|"STRONG"|"GOOD"|"ACCESSIBLE">,
  "jobMarketScore": <1-10, quality of local job market for CS graduates>,
  "avgSalaryUSD": <estimated average starting salary USD for CS graduates>
}}

Be realistic based on ranking and location. Lower-ranked universities should have lower competitiveness scores and lower GPA requirements."""

    try:
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt
        )
        text = response.text.strip()
        if "```" in text:
            parts = text.split("```")
            text = parts[1].strip()
            if text.startswith("json"):
                text = text[4:].strip()
        if not text or text.lower() == "null":
            return {}
        result = json.loads(text)
        return result if isinstance(result, dict) else {}
    except Exception as e:
        print(f"    ⚠️  Gemini error: {e}")
        return {}

def enrich_university(uni, client, use_gemini, delay, country):
    name    = uni.get("name", "")
    ranking = uni.get("ranking")
    accept  = uni.get("acceptanceRate", 50)
    changed = False

    # Step 1: normalize existing tier
    existing_tier = uni.get("tier", "")
    if existing_tier in TIER_NORMALIZE:
        uni["tier"] = TIER_NORMALIZE[existing_tier]

    # Step 2: apply known data
    if name in KNOWN_COMPETITIVENESS:
        known = KNOWN_COMPETITIVENESS[name]
        for field, value in known.items():
            if uni.get(field) != value:
                uni[field] = value
                changed = True

    # Step 3: apply PR/job market defaults by country
    pr_data = PR_DEFAULTS.get(country, {})
    for field, value in pr_data.items():
        if field not in uni or uni.get(field) is None:
            uni[field] = value
            changed = True

    # Step 4: if still missing key fields, ask Gemini
    needs_gemini = (
        use_gemini and (
            "competitivenessScore" not in uni or
            "typicalGPAMin" not in uni or
            "tier" not in uni or uni.get("tier") == ""
        )
    )

    if needs_gemini:
        print(f"    Gemini → {name}")
        gemini_data = ask_gemini(client, name, country, ranking, accept)
        for field, value in gemini_data.items():
            if value is not None and (field not in uni or uni.get(field) is None):
                uni[field] = value
                changed = True
        time.sleep(delay)

    # Step 5: derive researchIntensity from ranking if still missing
    if "researchIntensity" not in uni or not uni.get("researchIntensity"):
        rank = uni.get("ranking") or 999
        if rank <= 50:   uni["researchIntensity"] = "Very High"
        elif rank <= 150: uni["researchIntensity"] = "High"
        elif rank <= 400: uni["researchIntensity"] = "Medium"
        else:             uni["researchIntensity"] = "Low"
        changed = True

    # Step 6: derive tier from ranking if still missing
    if "tier" not in uni or not uni.get("tier"):
        rank = uni.get("ranking") or 999
        if rank <= 20:    uni["tier"] = "ELITE"
        elif rank <= 100: uni["tier"] = "TOP"
        elif rank <= 300: uni["tier"] = "STRONG"
        elif rank <= 600: uni["tier"] = "GOOD"
        else:             uni["tier"] = "ACCESSIBLE"
        changed = True

    # Step 7: derive competitivenessScore from tier if still missing
    if "competitivenessScore" not in uni or not uni.get("competitivenessScore"):
        tier_scores = {"ELITE": 9, "TOP": 7, "STRONG": 6, "GOOD": 4, "ACCESSIBLE": 3}
        uni["competitivenessScore"] = tier_scores.get(uni.get("tier", "GOOD"), 5)
        changed = True

    # Step 8: derive typicalGPA from competitivenessScore if still missing
    if "typicalGPAMin" not in uni or not uni.get("typicalGPAMin"):
        cs = uni.get("competitivenessScore", 5)
        uni["typicalGPAMin"] = round(max(2.5, 2.5 + (cs - 1) * 0.175), 2)
        uni["typicalGPAMax"] = round(min(4.0, uni["typicalGPAMin"] + 0.35), 2)
        changed = True

    return changed

def process_file(fpath, client, use_gemini, delay, country):
    data = json.load(open(fpath, encoding="utf-8"))
    fixed = 0
    for uni in data:
        if enrich_university(uni, client, use_gemini, delay, country):
            fixed += 1
    with open(fpath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    return len(data), fixed

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--api-key",    help="Gemini API key")
    p.add_argument("--known-only", action="store_true")
    p.add_argument("--delay",      type=float, default=0.5)
    p.add_argument("--file",       help="Process one file only")
    args = p.parse_args()

    api_key    = args.api_key or os.environ.get("GEMINI_API_KEY", "")
    use_gemini = not args.known_only

    client = None
    if use_gemini:
        if not api_key:
            print("Provide --api-key or GEMINI_API_KEY, or use --known-only")
            sys.exit(1)
        try:
            from google import genai
            client = genai.Client(api_key=api_key)
            print("✅ Gemini ready\n")
        except ImportError:
            print("Run: pip install google-genai")
            sys.exit(1)

    if not BACKUP_DIR.exists():
        import shutil
        shutil.copytree(DATA_DIR, BACKUP_DIR)
        print(f"✅ Backed up data/ → data_backup_intelligence/\n")

    CM = {"usa":"USA","uk":"UK","canada":"Canada","australia":"Australia","germany":"Germany"}
    if args.file:
        parts = args.file.replace(".json","").split("_")
        files = [(DATA_DIR / args.file, CM.get(parts[1], ""))]
    else:
        files = []
        for fp in sorted(DATA_DIR.glob("universities_*.json")):
            parts = fp.stem.split("_")
            country = CM.get(parts[1], "")
            if country:
                files.append((fp, country))

    print(f"Processing {len(files)} file(s)...\n")
    total_unis = total_fixed = 0

    for fp, country in files:
        print(f"━━ {fp.name} ({country})")
        u, f = process_file(fp, client, use_gemini, args.delay, country)
        total_unis += u; total_fixed += f
        print(f"   {f}/{u} enriched\n")

    print(f"✅ Complete — {total_fixed}/{total_unis} universities enriched")
    print(f"\nNext: npx prisma db seed")

if __name__ == "__main__":
    main()