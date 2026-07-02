"""
scholarship_ai.py — Gemini API generation for scholarships
Generates personalized scholarships based on student profile and special category
Uses free Gemini API instead of Vertex AI
"""

import json, sys, os, warnings
from pathlib import Path

warnings.filterwarnings("ignore")

# Load .env
_env = Path(__file__).parent / ".env"
if _env.exists():
    for _line in _env.read_text().splitlines():
        _line = _line.strip()
        if _line and not _line.startswith("#") and "=" in _line:
            _k, _, _v = _line.partition("=")
            os.environ.setdefault(_k.strip(), _v.strip().strip('"'))

import argparse

def get_model():
    try:
        import google.generativeai as genai
        api_key = os.environ.get("GEMINI_API_KEY", "")
        if not api_key:
            print("❌ GEMINI_API_KEY not set", file=sys.stderr)
            return None
        genai.configure(api_key=api_key)
        return genai.GenerativeModel("gemini-2.0-flash")
    except Exception as e:
        print(f"❌ Gemini API error: {e}", file=sys.stderr)
        return None

def get_special_category_context(special_category: str) -> str:
    """Get context for each special category"""
    contexts = {
        "SC": "Scheduled Caste - Many universities in India and some international ones offer dedicated scholarships. Student benefits from affirmative action in Indian institutions.",
        "ST": "Scheduled Tribe - Similar to SC, with specific tribal scholarships. Strong eligibility for Indian government scholarships.",
        "OBC": "Other Backward Class - Growing number of scholarships available globally. Some Indian universities reserve seats. Most international universities treat equally.",
        "Minority": "Religious or ethnic minority - Some private scholarships and NGO-funded scholarships available. International universities typically don't discriminate.",
        "PWD": "Person with Disability - Many universities offer accessibility scholarships and support. Significantly improves scholarship eligibility globally.",
        "NRI": "Non-Resident Indian - Some scholarships specifically for NRIs abroad. May have higher fees but also specific NRI scholarships available.",
        "EWS": "Economically Weaker Section - Income-based scholarships. Most international universities have need-based aid programs.",
        "General": "No special category - Standard scholarship eligibility based on merit and academic achievements only.",
    }
    return contexts.get(special_category, "Standard category - Merit-based scholarships available")

def build_prompt(profile: dict) -> str:
    """Build prompt to generate scholarships"""
    special_cat = profile.get("specialCategory", "General")
    special_context = get_special_category_context(special_cat)
    
    return f"""You are an expert scholarship advisor. Generate 30-35 personalized scholarships for this student profile.

STUDENT PROFILE:
- Nationality: {profile.get("nationality", "India")}
- Degree Level: {profile.get("level", "MS")}
- Field of Study: {profile.get("field", "Computer Science")}
- GPA: {profile.get("gpa", 3.7)}/4.0
- GRE Score: {profile.get("greScore", 320)}
- IELTS Score: {profile.get("ieltsScore", 7.5)}
- Budget Preference: ${profile.get("budgetUSD", 50000)}/year
- Special Category: {special_cat}

SPECIAL CATEGORY INFORMATION:
{special_context}

REQUIREMENTS:
Generate scholarships that are:
1. Realistic and currently available
2. Tailored to this student's profile
3. Include scholarships that specifically benefit {special_cat} students where applicable
4. Mix of safe (likely to get), match (good chance), and ambitious (reach) options

For each scholarship provide:
- scholarshipId: unique identifier (e.g., "ai_gen_usa_ms_1")
- name: official scholarship name
- country: where offered
- amount: scholarship amount in USD
- deadline: realistic deadline (YYYY-MM-DD format)
- eligibility: what this student needs to qualify
- matchScore: 0-100 based on how well student fits (higher = better match)
- matchLabel: "Perfect Match" | "Strong Match" | "Good Match" | "Fair Match" | "Possible"
- category: "safe" (matchScore ≥75) | "match" (50-74) | "ambitious" (<50)
- priority: 1-35 (1=highest priority for this student)
- applicationTips: specific action this student should take
- specialCategoryBenefit: how this scholarship benefits {special_cat} students or "No specific benefit"
- aiGenerated: true

Return ONLY a valid JSON array of scholarships (no markdown, no explanation):
[
  {{
    "scholarshipId": "ai_gen_usa_ms_1",
    "name": "Scholarship Name",
    "country": "USA",
    "amount": 50000,
    "deadline": "2025-03-15",
    "eligibility": "What student needs",
    "matchScore": 85,
    "matchLabel": "Strong Match",
    "category": "safe",
    "priority": 1,
    "applicationTips": "Specific tip for this student",
    "specialCategoryBenefit": "How it helps {special_cat} students",
    "aiGenerated": true
  }}
]"""

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("input_file")
    parser.add_argument("output_file")
    args = parser.parse_args()

    try:
        # Handle UTF-8 BOM from Windows PowerShell
        profile = json.loads(Path(args.input_file).read_text(encoding="utf-8-sig"))
    except Exception as e:
        print(f"Error reading input: {e}", file=sys.stderr)
        sys.exit(1)

    level = profile.get("level", "MS")
    field = profile.get("field", "Computer Science")
    special_cat = profile.get("specialCategory", "General")
    
    print(f"Generating scholarships for {level} {field} ({special_cat}) student", file=sys.stderr)

    model = get_model()
    scholarships = []

    if model:
        try:
            prompt = build_prompt(profile)
            print("Calling Gemini API...", file=sys.stderr)
            response = model.generate_content(prompt)
            text = response.text.strip()

            # Clean up markdown if present
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                text = text.split("```")[1].split("```")[0].strip()

            # Fix trailing commas
            import re
            text = re.sub(r',\s*}', '}', text)
            text = re.sub(r',\s*]', ']', text)

            parsed = json.loads(text)
            
            # Ensure it's a list
            if isinstance(parsed, dict):
                parsed = [parsed]
            elif not isinstance(parsed, list):
                parsed = []

            scholarships = parsed
            print(f"✅ Generated {len(scholarships)} scholarships", file=sys.stderr)
            
            # Show summary by category
            categories = {"safe": 0, "match": 0, "ambitious": 0}
            for s in scholarships:
                cat = s.get("category", "match")
                if cat in categories:
                    categories[cat] += 1
            print(f"   Safe: {categories['safe']}, Match: {categories['match']}, Ambitious: {categories['ambitious']}", file=sys.stderr)

        except json.JSONDecodeError as e:
            print(f"❌ JSON parse error: {e}", file=sys.stderr)
            print(f"   Response text: {text[:200]}", file=sys.stderr)
        except Exception as e:
            print(f"❌ Generation error: {e}", file=sys.stderr)

    # Write output
    output = {
        "success": len(scholarships) > 0,
        "scholarships": scholarships,
        "count": len(scholarships),
        "generatedAt": __import__("datetime").datetime.now().isoformat(),
    }
    
    Path(args.output_file).write_text(
        json.dumps(output, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )
    
    if scholarships:
        print(f"✅ Written {len(scholarships)} scholarships to output", file=sys.stderr)
    else:
        print(f"⚠️  No scholarships generated - controller will use fallback", file=sys.stderr)

if __name__ == "__main__":
    main()