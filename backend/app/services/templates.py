"""
LinkedIn Post Templates
"""

TEMPLATES = {
    "story": {
        "name": "Story",
        "system": "You are an expert LinkedIn content creator who writes engaging story-based posts.",
        "template": """Create a LinkedIn post based on: {topic}

Use this story structure:

Flashback to [Year] when I [Experience].
↳ I learned:
[Lesson]

Sometimes, looking back is the best way to move forward.

Guidelines:
- Start with a personal flashback
- Keep it authentic and relatable
- End with a lesson learned
- Use line breaks for readability
- 2-3 short paragraphs max
- No hashtags unless specifically requested"""
    },
    
    "unpopular_opinion": {
        "name": "Unpopular Opinion",
        "system": "You are an expert LinkedIn content creator who writes thought-provoking posts.",
        "template": """Create a LinkedIn post based on: {topic}

Use this structure:

Unpopular opinion: [Your controversial opinion].

→ Here's why I think differently:
[Explanation]

Let's debate.

Guidelines:
- Start with a bold, contrarian take
- Provide 2-3 reasons why
- Invite discussion
- Keep it professional but edgy
- Use emojis sparingly
- 3-4 short paragraphs"""
    },
    
    "learnings": {
        "name": "Learnings",
        "system": "You are an expert LinkedIn content creator who shares valuable insights.",
        "template": """Create a LinkedIn post based on: {topic}

Use this structure:

After [X] years in [field], here's what I've learned:

• [Key learning 1]
• [Key learning 2]
• [Key learning 3]

This experience has taught me [key takeaway].

Guidelines:
- Share 3-5 specific learnings
- Use bullet points with arrows (→) or dots (•)
- Make it actionable
- End with a synthesis
- Keep each point to 1 line
- Professional tone"""
    },
    
    "tips": {
        "name": "Tips",
        "system": "You are an expert LinkedIn content creator who provides actionable advice.",
        "template": """Create a LinkedIn post based on: {topic}

Use this structure:

Top [X] Tips for [Topic] Success: 🏆

1️⃣ [Tip 1]: [Brief Explanation]
2️⃣ [Tip 2]: [Brief Explanation]
3️⃣ [Tip 3]: [Brief Explanation]

Got a tip to add? Drop it below! 👇

Guidelines:
- Provide 3-5 actionable tips
- Number them with emojis (1️⃣, 2️⃣, etc.)
- Each tip: one sentence explanation
- Conversational and helpful
- End with engagement question"""
    },
    
    "case_study": {
        "name": "Case Study",
        "system": "You are an expert LinkedIn content creator who writes detailed case studies.",
        "template": """Create a LinkedIn post based on: {topic}

Use this structure:

Case Study: Transforming [Problem] into [Solution] 🔄

• Challenge: [Brief Challenge]
• Action: [Brief Action Taken]  
• Result: [Brief Result]

Insight? [Key Insight].

Ever faced a similar situation? How did you handle it?

Guidelines:
- Clear problem-solution format
- Use bullet points with arrows
- Quantify results if possible
- Short and scannable
- End with engagement question
- Keep it under 100 words"""
    },
    
    "celebration": {
        "name": "Celebration",
        "system": "You are an expert LinkedIn content creator who writes celebratory posts.",
        "template": """Create a LinkedIn post based on: {topic}

Use this structure:

🎉 Milestone Alert 🎉

Just hit [Milestone]! Here's what it took:

→ [Effort 1]
→ [Effort 2]
→ [Effort 3]

Beyond excited for what's next! 🚀

Guidelines:
- Start with celebration
- Share the journey (2-4 points)
- Show gratitude
- Look forward
- Use relevant emojis
- Keep it genuine and humble"""
    },
    
    "guide": {
        "name": "Guide/How-To",
        "system": "You are an expert LinkedIn content creator who writes comprehensive guides.",
        "template": """Create a LinkedIn post based on: {topic}

Use this structure:

After spending [Time] [researching/working on] [Topic], here's your complete guide:

📌 Introduction:
[Brief intro]

✅ Step-by-Step:
1. [Step 1]
2. [Step 2]  
3. [Step 3]

💡 Pro Tips:
• [Tip 1]
• [Tip 2]

Guidelines:
- Clear step-by-step format
- Use emojis for sections
- Actionable and specific
- Include pro tips
- Under 150 words total
- Scannable format"""
    },
    
    "motivation": {
        "name": "Motivation",
        "system": "You are an expert LinkedIn content creator who writes inspiring posts.",
        "template": """Create a LinkedIn post based on: {topic}

Use this structure:

[Opening hook about challenge/obstacle]

Here's the twist that changed everything:
→ [Pivotal realization]

Every setback was just a setup for a comeback. 💪

[Brief lesson or call to action]

Guidelines:
- Start with a relatable struggle
- Show the transformation
- Keep it uplifting
- Personal but universal
- 3-4 short paragraphs
- Use 1-2 emojis max"""
    },
    
    "list": {
        "name": "List",
        "system": "You are an expert LinkedIn content creator who writes scannable list posts.",
        "template": """Create a LinkedIn post based on: {topic}

Use this structure:

[Number] things about [Topic] that changed my perspective:

1. [Point 1]
2. [Point 2]
3. [Point 3]
4. [Point 4]
5. [Point 5]

Which one resonates with you most? 

Guidelines:
- 3-7 items in list
- Each item: 1-2 sentences max
- Numbered format
- Clear and specific
- End with engagement
- No bullet sub-points"""
    },
    
    "failure": {
        "name": "Failure",
        "system": "You are an expert LinkedIn content creator who shares authentic failure stories.",
        "template": """Create a LinkedIn post based on: {topic}

Use this structure:

Oops, I did it again... 🙈

🔻 Blunder: [Specific Failure]
🔺 Recovery: How I [Correction Action]
🔄 Reflection: Why this was a disguised blessing

Your turn – spill your 'oops' moment!

Guidelines:
- Be vulnerable and authentic
- Show the lesson learned
- Use emojis for structure
- Keep it light but real
- Encourage others to share
- 3-4 short paragraphs"""
    }
}

def get_template(template_key: str) -> dict:
    """Get template by key, return default if not found"""
    return TEMPLATES.get(template_key, TEMPLATES["story"])

def get_all_template_names() -> dict:
    """Get all template names and keys"""
    return {key: value["name"] for key, value in TEMPLATES.items()}