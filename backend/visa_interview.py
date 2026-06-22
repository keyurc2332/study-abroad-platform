"""
visa_interview.py — Vertex AI for visa interview coaching
Uses Gemini 2.5 Flash to conduct realistic visa interview practice
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
        import vertexai
        from vertexai.preview.generative_models import GenerativeModel
        project = os.environ.get("VERTEX_PROJECT_ID", "")
        location = os.environ.get("VERTEX_LOCATION", "us-central1")
        if not project:
            print("❌ VERTEX_PROJECT_ID not set", file=sys.stderr)
            return None
        vertexai.init(project=project, location=location)
        return GenerativeModel("gemini-2.5-flash-preview-04-17")
    except Exception as e:
        print(f"❌ Vertex AI error: {e}", file=sys.stderr)
        return None

def get_interview_prompt(interview_type: str, conversation_count: int) -> str:
    """Get system prompt based on interview type"""
    
    interview_guides = {
        "USA": """You are a US visa officer conducting an F-1 student visa interview.
Ask about:
1. Background and education
2. Why this university/program
3. Financial support and funding
4. Future plans and return intentions
5. English proficiency if needed

Be professional but conversational. Ask one question at a time.""",
        
        "UK": """You are a UK visa officer conducting a Student visa interview.
Focus on:
1. Course details and university choice
2. Financial capacity and funding proof
3. Tier 4/5 sponsor details
4. Previous travel and return plans
5. English language ability

Professional tone, one question per response.""",
        
        "Canada": """You are a Canadian visa officer conducting a study permit interview.
Topics:
1. Study program details
2. Proof of financial support
3. Family ties to home country
4. Work plans during/after studies
5. Knowledge of Canada

Be direct and thorough.""",
        
        "Germany": """You are a German visa officer for student visas.
Cover:
1. University and program choice
2. APS certificate (for Indian students)
3. Financial resources
4. German language level
5. Career goals

Ask critical questions.""",
        
        "Australia": """You are an Australian visa officer for student visas.
Check:
1. Course and university details
2. Genuine Temporary Resident (GTR) intent
3. Financial capacity (CoE holder)
4. English language
5. Health and character

Professional approach.""",
    }
    
    guide = interview_guides.get(interview_type, interview_guides["USA"])
    
    if conversation_count == 0:
        return f"{guide}\n\nThis is the start of the interview. Ask your first question to break the ice."
    else:
        return f"{guide}\n\nContinue the interview based on previous responses. Ask the next logical question to assess their candidacy."

def build_prompt(data: dict) -> str:
    """Build the full prompt for Vertex AI"""
    
    interview_type = data.get("interviewType", "USA")
    conversation = data.get("conversationHistory", [])
    user_message = data.get("userMessage", "")
    
    system_prompt = get_interview_prompt(interview_type, len(conversation))
    
    # Build conversation context
    conversation_text = ""
    for msg in conversation[-6:]:  # Last 6 messages for context
        role = msg.get("role", "").upper()
        content = msg.get("content", "")
        conversation_text += f"{role}: {content}\n\n"
    
    return f"""{system_prompt}

CONVERSATION SO FAR:
{conversation_text}

USER'S LATEST RESPONSE:
{user_message}

INSTRUCTIONS:
1. Evaluate the user's answer (score: 0-100)
2. Provide specific feedback
3. Ask your next question

RESPOND ONLY IN JSON FORMAT:
{{
  "response": "Your next question or follow-up",
  "questionNumber": 1,
  "difficulty": "Easy|Medium|Hard",
  "category": "Background|Motivation|Experience|Plans|Finances",
  "evaluation": {{
    "grade": "Excellent|Good|Partial|Weak",
    "score": 85,
    "feedback": "What was good/bad about the answer",
    "suggestions": "How to improve"
  }}
}}

Only return JSON, no markdown or explanation."""

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("input_file")
    parser.add_argument("output_file")
    args = parser.parse_args()

    try:
        data = json.loads(Path(args.input_file).read_text(encoding="utf-8-sig"))
    except Exception as e:
        print(f"Error reading input: {e}", file=sys.stderr)
        sys.exit(1)

    interview_type = data.get("interviewType", "USA")
    user_message = data.get("userMessage", "")
    
    print(f"Conducting {interview_type} visa interview", file=sys.stderr)

    model = get_model()
    response_data = None

    if model:
        try:
            prompt = build_prompt(data)
            print("Calling Gemini 2.5 Flash...", file=sys.stderr)
            response = model.generate_content(prompt)
            text = response.text.strip()

            # Clean up markdown if present
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                text = text.split("```")[1].split("```")[0].strip()

            response_data = json.loads(text)
            print(f"✅ Generated visa interview response", file=sys.stderr)

        except json.JSONDecodeError as e:
            print(f"❌ JSON parse error: {e}", file=sys.stderr)
        except Exception as e:
            print(f"❌ Generation error: {e}", file=sys.stderr)

    # Fallback if AI fails
    if not response_data:
        response_data = {
            "response": "Can you elaborate more on that? Tell me about your experience.",
            "questionNumber": 1,
            "difficulty": "Medium",
            "category": "Background",
            "evaluation": {
                "grade": "Partial",
                "score": 50,
                "feedback": "Answer was unclear. Try to be more specific.",
                "suggestions": "Provide concrete examples and details."
            }
        }

    # Write output
    output = {
        "success": response_data is not None,
        "response": response_data,
    }
    
    Path(args.output_file).write_text(
        json.dumps(output, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )

if __name__ == "__main__":
    main()