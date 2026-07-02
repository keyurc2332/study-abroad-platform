"""
enrich_with_gemini.py
Fixes bad university data using Gemini API (new google-genai SDK).

Usage:
  pip install google-genai
  python enrich_with_gemini.py --known-only          # free, no API key
  python enrich_with_gemini.py --api-key YOUR_KEY    # Gemini for unknowns

Place in: backend/
Reads + writes: backend/data/
Then re-run: npx prisma db seed
"""

import os
import json, time, argparse, sys, shutil
from pathlib import Path

DATA_DIR   = Path(__file__).parent / "data"
BACKUP_DIR = Path(__file__).parent / "data_backup"
os.environ.setdefault("GEMINI_API_KEY", "AIzaSyD9XRTTOVGDIWh8GPkVb-8OCvWQnipyuJY")
KNOWN = {
    # USA — wrong cities + placeholder URLs
    "University of Arizona":               {"city": "Tucson",          "website": "https://www.arizona.edu",       "acceptanceRate": 85.0},
    "University of Cincinnati":            {"city": "Cincinnati",      "website": "https://www.uc.edu",            "acceptanceRate": 78.0},
    "University of Colorado Boulder":      {"city": "Boulder",         "website": "https://www.colorado.edu",      "acceptanceRate": 80.0},
    "University of Minnesota Twin Cities": {"city": "Minneapolis",     "website": "https://www.umn.edu",           "acceptanceRate": 57.0},
    "University of Utah":                  {"city": "Salt Lake City",  "website": "https://www.utah.edu",          "acceptanceRate": 79.0},
    "University of Maryland":              {"city": "College Park",    "website": "https://www.umd.edu",           "acceptanceRate": 44.0},
    "University of Washington":            {"city": "Seattle",         "website": "https://www.washington.edu",    "acceptanceRate": 52.0},
    "University of California Los Angeles":{"city": "Los Angeles",     "website": "https://www.ucla.edu",          "acceptanceRate": 14.0},
    "University of California Irvine":     {"city": "Irvine",          "website": "https://www.uci.edu",           "acceptanceRate": 29.0},
    "University of California Davis":      {"city": "Davis",           "website": "https://www.ucdavis.edu",       "acceptanceRate": 39.0},
    "University of California Santa Barbara":{"city": "Santa Barbara", "website": "https://www.ucsb.edu",          "acceptanceRate": 26.0},
    "University of California San Diego":  {"city": "La Jolla",        "website": "https://www.ucsd.edu",          "acceptanceRate": 24.0},
    "University of Virginia":              {"city": "Charlottesville", "website": "https://www.virginia.edu",      "acceptanceRate": 19.0},
    "University of Rochester":             {"city": "Rochester",       "website": "https://www.rochester.edu",     "acceptanceRate": 29.0},
    "University of Delaware":              {"city": "Newark",          "website": "https://www.udel.edu",          "acceptanceRate": 67.0},
    "University of Houston":               {"city": "Houston",         "website": "https://www.uh.edu",            "acceptanceRate": 66.0},
    "University of Nebraska Lincoln":      {"city": "Lincoln",         "website": "https://www.unl.edu",           "acceptanceRate": 80.0},
    "University of North Texas":           {"city": "Denton",          "website": "https://www.unt.edu",           "acceptanceRate": 72.0},
    "University of Alabama Birmingham":    {"city": "Birmingham",      "website": "https://www.uab.edu",           "acceptanceRate": 73.0},
    "University of Pittsburgh":            {"city": "Pittsburgh",      "website": "https://www.pitt.edu",          "acceptanceRate": 52.0},
    "University of South Florida":         {"city": "Tampa",           "website": "https://www.usf.edu",           "acceptanceRate": 44.0},
    "University of Central Florida":       {"city": "Orlando",         "website": "https://www.ucf.edu",           "acceptanceRate": 43.0},
    "University of Tennessee Knoxville":   {"city": "Knoxville",       "website": "https://www.utk.edu",           "acceptanceRate": 71.0},
    "University of Connecticut":           {"city": "Storrs",          "website": "https://www.uconn.edu",         "acceptanceRate": 54.0},
    "University of Iowa":                  {"city": "Iowa City",       "website": "https://www.uiowa.edu",         "acceptanceRate": 84.0},
    "University of Kansas":                {"city": "Lawrence",        "website": "https://www.ku.edu",            "acceptanceRate": 93.0},
    "University of Nevada Reno":           {"city": "Reno",            "website": "https://www.unr.edu",           "acceptanceRate": 83.0},
    "University of New Mexico":            {"city": "Albuquerque",     "website": "https://www.unm.edu",           "acceptanceRate": 92.0},
    "University of Oregon":                {"city": "Eugene",          "website": "https://www.uoregon.edu",       "acceptanceRate": 83.0},
    "University of Vermont":               {"city": "Burlington",      "website": "https://www.uvm.edu",           "acceptanceRate": 67.0},
    "University of Arkansas":              {"city": "Fayetteville",    "website": "https://www.uark.edu",          "acceptanceRate": 79.0},
    "University of Kentucky":              {"city": "Lexington",       "website": "https://www.uky.edu",           "acceptanceRate": 95.0},
    "University of Mississippi":           {"city": "Oxford",          "website": "https://www.olemiss.edu",       "acceptanceRate": 98.0},
    "University of Idaho":                 {"city": "Moscow",          "website": "https://www.uidaho.edu",        "acceptanceRate": 76.0},
    "University of Montana":               {"city": "Missoula",        "website": "https://www.umt.edu",           "acceptanceRate": 95.0},
    "University of Wyoming":               {"city": "Laramie",         "website": "https://www.uwyo.edu",          "acceptanceRate": 96.0},
    "University of South Carolina":        {"city": "Columbia",        "website": "https://www.sc.edu",            "acceptanceRate": 67.0},
    "University of Missouri Columbia":     {"city": "Columbia",        "website": "https://www.missouri.edu",      "acceptanceRate": 81.0},
    "University at Buffalo SUNY":          {"city": "Buffalo",         "website": "https://www.buffalo.edu",       "acceptanceRate": 63.0},
    "University of Texas Dallas":          {"city": "Richardson",      "website": "https://www.utdallas.edu",      "acceptanceRate": 80.0},
    "University of Southern California":   {"city": "Los Angeles",     "website": "https://www.usc.edu",           "acceptanceRate": 13.0},
    "University of Wisconsin Madison":     {"city": "Madison",         "website": "https://www.wisc.edu",          "acceptanceRate": 49.0},
    "University of Florida":               {"city": "Gainesville",     "website": "https://www.ufl.edu",           "acceptanceRate": 30.0},
    "Louisiana State University":          {"city": "Baton Rouge",     "website": "https://www.lsu.edu",           "acceptanceRate": 75.0},
    # Canada — missing websites
    "Ontario Tech University":             {"website": "https://ontariotechu.ca"},
    "Trent University":                    {"website": "https://www.trentu.ca"},
    "Algoma University":                   {"website": "https://www.algomau.ca"},
    "Lakehead University":                 {"website": "https://www.lakeheadu.ca"},
    "Nipissing University":                {"website": "https://www.nipissingu.ca"},
    "Thompson Rivers University":          {"website": "https://www.tru.ca"},
    "Cape Breton University":              {"website": "https://www.cbu.ca"},
    "University of Northern British Columbia": {"website": "https://www.unbc.ca"},
    "Brandon University":                  {"website": "https://www.brandonu.ca"},
    "Mount Allison University":            {"website": "https://www.mta.ca"},
    "Acadia University":                   {"website": "https://www2.acadiau.ca"},
    "University of Prince Edward Island":  {"website": "https://www.upei.ca"},
    "Memorial University of Newfoundland": {"website": "https://www.mun.ca"},
    "Concordia University":                {"website": "https://www.concordia.ca"},
    "University of Manitoba":              {"website": "https://www.umanitoba.ca"},
    # UK — missing websites
    "Heriot-Watt University":              {"website": "https://www.hw.ac.uk"},
    "Northumbria University":              {"website": "https://www.northumbria.ac.uk"},
    "Robert Gordon University":            {"website": "https://www.rgu.ac.uk"},
    "Coventry University":                 {"website": "https://www.coventry.ac.uk"},
    "De Montfort University":              {"website": "https://www.dmu.ac.uk"},
    "Brunel University London":            {"website": "https://www.brunel.ac.uk"},
    "Swansea University":                  {"website": "https://www.swansea.ac.uk"},
    "Ulster University":                   {"website": "https://www.ulster.ac.uk"},
    "University of Hertfordshire":         {"website": "https://www.herts.ac.uk"},
    "University of Plymouth":              {"website": "https://www.plymouth.ac.uk"},
    "Aberystwyth University":              {"website": "https://www.aber.ac.uk"},
    "Teesside University":                 {"website": "https://www.tees.ac.uk"},
    "Middlesex University":                {"website": "https://www.mdx.ac.uk"},
    "City, University of London":          {"website": "https://www.city.ac.uk"},
    "University of Lincoln":               {"website": "https://www.lincoln.ac.uk"},
    "University of the West of England":   {"website": "https://www.uwe.ac.uk"},
}

BAD_URLS = {"https://www.university.edu", "https://university.edu", "", None}

def needs_fixing(uni):
    return (uni.get("website") in BAD_URLS or
            not uni.get("website") or
            not uni.get("city"))

def ask_gemini(client, name, country, city, website, accept):
    prompt = f"""You are a university data verifier. Fix any wrong fields for this university.

University: {name}
Country: {country}
Current city: {city}
Current website: {website}
Current acceptance rate: {accept}%

Return ONLY a raw JSON object with corrections (no markdown, no explanation):
{{"city": "...", "website": "https://...", "acceptanceRate": 65.0}}

Rules:
- city = main campus city only
- website = official homepage
- acceptanceRate = overall undergraduate rate (0-100), NOT graduate CS rate
- Only include fields that are wrong or missing
- If everything is correct return: null"""

    try:
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt
        )
        text = response.text.strip()

        # Strip markdown if present
        if "```" in text:
            parts = text.split("```")
            text = parts[1].strip()
            if text.startswith("json"):
                text = text[4:].strip()

        if text.lower() == "null" or not text:
            return {}

        result = json.loads(text)
        return result if isinstance(result, dict) else {}

    except Exception as e:
        print(f"    ⚠️  Gemini error: {e}")
        return {}

def apply_fixes(uni, corrections):
    changed = False
    for field, value in corrections.items():
        if field in ["city", "website", "acceptanceRate"] and value is not None:
            if uni.get(field) != value:
                uni[field] = value
                # Fix officialURL on programs when website changes
                if field == "website":
                    for p in uni.get("programs", []):
                        if p.get("officialURL") in BAD_URLS or not p.get("officialURL"):
                            p["officialURL"] = value
                changed = True
    return changed

def process_file(fpath, client, use_gemini, delay):
    data = json.load(open(fpath, encoding="utf-8"))
    fixed = 0

    for uni in data:
        name    = uni.get("name", "")
        country = uni.get("country", "")
        city    = uni.get("city", "")
        website = uni.get("website") or ""
        accept  = uni.get("acceptanceRate") or 0

        corrections = {}

        # Step 1: known corrections (instant, free)
        if name in KNOWN:
            corrections = KNOWN[name].copy()

        # Step 2: Gemini for anything still broken
        elif use_gemini and needs_fixing(uni):
            print(f"    Gemini → {name}")
            corrections = ask_gemini(client, name, country, city, website, accept)
            time.sleep(delay)

        if corrections and apply_fixes(uni, corrections):
            fixed += 1
            print(f"  ✅ {name}: {uni.get('city')} | {(uni.get('website') or '')[:50]}")

    with open(fpath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    return len(data), fixed

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--api-key",    help="Gemini API key (or set GEMINI_API_KEY env var)")
    p.add_argument("--known-only", action="store_true", help="Apply known fixes only, no Gemini")
    p.add_argument("--delay",      type=float, default=0.5)
    p.add_argument("--file",       help="Process one file only")
    args = p.parse_args()

    api_key    = args.api_key or os.environ.get("GEMINI_API_KEY", "")
    use_gemini = not args.known_only

    client = None
    if use_gemini:
        if not api_key:
            print("Provide --api-key or set GEMINI_API_KEY, or run with --known-only")
            sys.exit(1)
        try:
            from google import genai
            client = genai.Client(api_key=api_key)
            print("✅ Gemini (google-genai) ready\n")
        except ImportError:
            print("Run: pip install google-genai")
            sys.exit(1)
    else:
        print("Running known-fixes only (no Gemini)\n")

    # Backup data folder
    if not BACKUP_DIR.exists():
        shutil.copytree(DATA_DIR, BACKUP_DIR)
        print(f"✅ Backed up data/ → data_backup/\n")

    files = [DATA_DIR / args.file] if args.file else sorted(DATA_DIR.glob("universities_*.json"))
    print(f"Processing {len(files)} file(s)...\n")

    total_unis = total_fixed = 0
    for fp in files:
        print(f"━━ {fp.name}")
        u, f = process_file(fp, client, use_gemini, args.delay)
        total_unis += u
        total_fixed += f
        print(f"   {f}/{u} fixed\n")

    print(f"✅ Complete — {total_fixed}/{total_unis} records corrected")
    print(f"\nNext: npx prisma db seed")

if __name__ == "__main__":
    main()