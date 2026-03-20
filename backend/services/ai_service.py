import os
from openai import OpenAI
from fastapi import HTTPException

client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY', 'demo-key'))
MODEL = 'gpt-4o-mini'

def generate_email_draft(recipient_name: str, context: str):
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": "You are a professional CRM assistant. Generate professional, concise email drafts."},
                {"role": "user", "content": f"Generate a professional email for {recipient_name}. Context: {context}"}
            ],
            temperature=0.7,
            max_tokens=300
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Email draft: Dear {recipient_name}, {context}"

def analyze_sentiment(text: str):
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": "Analyze sentiment. Respond only: positive, negative, or neutral."},
                {"role": "user", "content": f"Message: {text}"}
            ],
            temperature=0,
            max_tokens=10
        )
        return response.choices[0].message.content.strip().lower()
    except Exception as e:
        return "neutral"

def score_lead(lead_data: dict):
    try:
        prompt = f"""Score this lead from 0-100 based on potential value:
        Name: {lead_data.get('name')}
        Company: {lead_data.get('company', 'Unknown')}
        Value: ${lead_data.get('value', 0)}
        Stage: {lead_data.get('stage')}
        
        Respond with only a number 0-100."""
        
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": "You are a lead scoring expert."},
                {"role": "user", "content": prompt}
            ],
            temperature=0,
            max_tokens=10
        )
        score = response.choices[0].message.content.strip()
        return min(100, max(0, int(score)))
    except:
        value = lead_data.get('value', 0)
        stage_scores = {'new': 20, 'contacted': 40, 'qualified': 60, 'proposal': 75, 'negotiation': 85, 'closed': 95}
        return min(100, (value // 100) + stage_scores.get(lead_data.get('stage', 'new'), 20))

def summarize_interaction(text: str):
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": "Summarize customer interactions in 2-3 sentences."},
                {"role": "user", "content": f"Interaction: {text}"}
            ],
            temperature=0.5,
            max_tokens=150
        )
        return response.choices[0].message.content
    except Exception as e:
        return text[:200] + "..." if len(text) > 200 else text