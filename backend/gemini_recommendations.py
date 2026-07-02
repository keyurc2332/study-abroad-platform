"""
gemini_recommendations.py — Production-ready, bulletproof implementation
Handles truncation, errors, and edge cases gracefully
"""

import json, sys, os, time, argparse
from pathlib import Path

import warnings
warnings.filterwarnings("ignore", category=FutureWarning)

# Auto-load .env
_env = Path(__file__).parent / ".env"
if _env.exists():
    for _line in _env.read_text().splitlines():
        _line = _line.strip()
        if _line and not _line.startswith("#") and "=" in _line:
            _k, _, _v = _line.partition("=")
            os.environ.setdefault(_k.strip(), _v.strip().strip('"'))


def get_vertex_client():
    """Initialize Vertex AI client."""
    project_id = os.environ.get("VERTEX_PROJECT_ID", "")
    location = os.environ.get("VERTEX_LOCATION", "us-central1")

    if not project_id:
        print("ERROR: VERTEX_PROJECT_ID not set", file=sys.stderr)
        return None

    try:
        import vertexai
        from vertexai.preview.generative_models import GenerativeModel

        vertexai.init(project=project_id, location=location)
        model = GenerativeModel("gemini-2.5-flash")
        print("OK: Vertex AI initialized", file=sys.stderr)
        return model
    except Exception as e:
        print("ERROR: Vertex AI - " + str(e), file=sys.stderr)
        return None


def build_prompt(profile: dict, attempt: int = 1) -> str:
    """Build optimized prompt for Gemini.
    
    attempt 1: Full format with all fields
    attempt 2: Simplified format (shorter output)
    """
    
    level = profile.get("level", "MS")
    gpa = profile.get("gpa", 3.5)
    fields = profile.get("targetFields", ["Computer Science"])
    countries = profile.get("preferredCountries", ["USA"])
    budget = profile.get("budgetUSD", 60000)
    
    field_str = fields[0] if fields else "Computer Science"
    country_str = ", ".join(countries[:3])  # Limit to 3 countries
    
    if attempt == 1:
        # Full format
        prompt = "Generate exactly 30 universities for " + level + " in " + field_str + ".\n"
        prompt += "Countries: " + country_str + "\n"
        prompt += "Budget: $" + str(budget) + "\n\n"
        prompt += "Return EXACTLY as JSON array:\n"
        prompt += '[{"name":"University","country":"USA","program":"MS Field","category":"safe"}]\n\n'
        prompt += "10 safe (70%+ admit), 10 match (40-70%), 10 ambitious (<40%)\n"
        prompt += "No markdown, no explanation."
    else:
        # Simplified format (shorter output for retry)
        prompt = "30 universities: " + level + " " + field_str + "\n"
        prompt += "Return ONLY: [{n,c,p,cat}] (n=name,c=country,p=program,cat=safe|match|ambitious)\n"
        prompt += "10 safe, 10 match, 10 ambitious"
    
    return prompt


def fix_truncated_json(text: str) -> str:
    """Attempt to fix truncated JSON by closing it properly."""
    
    # Count opening and closing braces
    open_braces = text.count("{")
    close_braces = text.count("}")
    open_brackets = text.count("[")
    close_brackets = text.count("]")
    
    print("INFO: Braces - open: " + str(open_braces) + ", close: " + str(close_braces), file=sys.stderr)
    print("INFO: Brackets - open: " + str(open_brackets) + ", close: " + str(close_brackets), file=sys.stderr)
    
    # If we're missing closing brackets/braces, try to add them
    missing_braces = open_braces - close_braces
    missing_brackets = open_brackets - close_brackets
    
    if missing_braces > 0 or missing_brackets > 0:
        print("INFO: Attempting to fix truncated JSON...", file=sys.stderr)
        text = text.rstrip()
        text += "}" * missing_braces
        text += "]" * missing_brackets
        print("INFO: Added " + str(missing_braces) + " braces and " + str(missing_brackets) + " brackets", file=sys.stderr)
    
    return text


def extract_json_from_response(text: str) -> list:
    """Extract JSON array from Gemini response with comprehensive error handling."""
    
    if not text:
        print("ERROR: Empty response", file=sys.stderr)
        return []
    
    original_text = text
    text = text.strip()
    
    print("INFO: Response length: " + str(len(text)) + " chars", file=sys.stderr)
    
    # Step 1: Remove markdown code blocks
    if "```json" in text:
        try:
            idx = text.find("```json")
            text = text[idx+7:]
            idx = text.find("```")
            if idx != -1:
                text = text[:idx]
            text = text.strip()
        except:
            pass
    elif "```" in text:
        try:
            idx = text.find("```")
            text = text[idx+3:]
            idx = text.find("```")
            if idx != -1:
                text = text[:idx]
            text = text.strip()
        except:
            pass
    
    # Step 2: Find array boundaries
    start = text.find("[")
    end = text.rfind("]")
    
    print("INFO: Array start position: " + str(start), file=sys.stderr)
    print("INFO: Array end position: " + str(end), file=sys.stderr)
    
    if start == -1:
        print("ERROR: No opening [ found", file=sys.stderr)
        return []
    
    json_str = text[start:]
    
    # If no closing bracket found, try to fix it
    if end == -1:
        print("WARNING: No closing ] found - attempting repair", file=sys.stderr)
        json_str = fix_truncated_json(json_str)
    else:
        json_str = json_str[:end+1]
    
    # Step 3: Clean JSON
    import re
    json_str = re.sub(r',\s*}', '}', json_str)
    json_str = re.sub(r',\s*]', ']', json_str)
    json_str = re.sub(r"'", '"', json_str)
    
    # Step 4: Parse
    try:
        parsed = json.loads(json_str)
        
        if not isinstance(parsed, list):
            print("ERROR: Not a JSON array", file=sys.stderr)
            return []
        
        print("OK: Parsed " + str(len(parsed)) + " items", file=sys.stderr)
        return parsed
        
    except json.JSONDecodeError as e:
        print("ERROR: JSON parse failed - " + str(e), file=sys.stderr)
        print("INFO: First 200 chars: " + json_str[:200], file=sys.stderr)
        return []
    except Exception as e:
        print("ERROR: " + str(type(e).__name__) + " - " + str(e), file=sys.stderr)
        return []


def generate_recommendations(profile: dict, model) -> list:
    """Generate recommendations with retry logic."""
    
    for attempt in range(1, 3):
        prompt = build_prompt(profile, attempt)
        
        print("INFO: Attempt " + str(attempt) + " - Sending prompt", file=sys.stderr)
        start_time = time.time()

        try:
            response = model.generate_content(
                prompt,
                generation_config={
                    "temperature": 0.5,
                    "max_output_tokens": 12000,  # INCREASED from 5000
                    "top_p": 0.95,
                }
            )
            
            elapsed = time.time() - start_time
            print("OK: Response in " + str(round(elapsed, 1)) + "s", file=sys.stderr)
            
            text = response.text.strip() if response.text else ""
            
            if not text:
                print("WARNING: Empty response on attempt " + str(attempt), file=sys.stderr)
                continue

            # Try to extract JSON
            recommendations = extract_json_from_response(text)
            
            if recommendations and len(recommendations) >= 20:
                print("OK: Got " + str(len(recommendations)) + " recommendations on attempt " + str(attempt), file=sys.stderr)
                return recommendations
            else:
                print("WARNING: Got " + str(len(recommendations)) + " items (need 20+), retrying...", file=sys.stderr)
                continue

        except Exception as e:
            print("ERROR: Attempt " + str(attempt) + " failed - " + str(e), file=sys.stderr)
            continue
    
    print("ERROR: All attempts failed", file=sys.stderr)
    return []


def validate_recommendations(recommendations: list) -> list:
    """Validate and clean recommendations."""
    
    if not recommendations:
        return []
    
    valid = []
    for i, rec in enumerate(recommendations):
        # Ensure all required fields exist
        if not isinstance(rec, dict):
            continue
        
        name = rec.get("name") or rec.get("universityName") or "Unknown"
        country = rec.get("country") or "USA"
        program = rec.get("program") or rec.get("programName") or "Master's Program"
        category = rec.get("category") or rec.get("cat") or "match"
        
        # Ensure category is valid
        if category not in ["safe", "match", "ambitious"]:
            # Auto-assign based on position if invalid
            if i < 10:
                category = "safe"
            elif i < 20:
                category = "match"
            else:
                category = "ambitious"
        
        valid.append({
            "name": str(name),
            "country": str(country),
            "program": str(program),
            "category": category,
            "universityName": str(name),
            "programName": str(program)
        })
    
    print("INFO: Validated " + str(len(valid)) + " recommendations", file=sys.stderr)
    return valid


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    try:
        data = json.loads(Path(args.input).read_text(encoding="utf-8"))
        profile = data.get("profile", {})

        level = profile.get("level", "?")
        field = profile.get("targetFields", ["Unknown"])[0]
        print("INFO: Generating for " + level + " in " + field, file=sys.stderr)

        model = get_vertex_client()
        if not model:
            print("FATAL: Could not initialize Vertex AI", file=sys.stderr)
            Path(args.output).write_text(
                json.dumps({"recommendations": [], "success": False, "error": "Model init failed"}),
                encoding="utf-8"
            )
            sys.exit(1)

        # Generate recommendations with retry logic
        recommendations = generate_recommendations(profile, model)
        
        # Validate and clean
        recommendations = validate_recommendations(recommendations)

        # Count by category
        safe = len([r for r in recommendations if r.get("category") == "safe"])
        match = len([r for r in recommendations if r.get("category") == "match"])
        ambitious = len([r for r in recommendations if r.get("category") == "ambitious"])

        output = {
            "recommendations": recommendations,
            "success": len(recommendations) > 0,
            "count": len(recommendations),
            "safe_count": safe,
            "match_count": match,
            "ambitious_count": ambitious,
        }

        Path(args.output).write_text(json.dumps(output, indent=2), encoding="utf-8")
        print("OK: Generated " + str(len(recommendations)) + " (" + str(safe) + " safe, " + str(match) + " match, " + str(ambitious) + " ambitious)", file=sys.stderr)

    except Exception as e:
        print("FATAL: " + str(e), file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        Path(args.output).write_text(json.dumps({"recommendations": [], "success": False}), encoding="utf-8")
        sys.exit(1)


if __name__ == "__main__":
    main()