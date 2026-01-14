import os
from typing import Dict
import logging
from dotenv import load_dotenv
import base64
from io import BytesIO

# Load .env file
load_dotenv(dotenv_path=".env")

logger = logging.getLogger(__name__)

# Configure API Key
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY environment variable not set")

# LinkedIn Post Prompt
LINKEDIN_PROMPT_TEMPLATE = """Create a professional LinkedIn post about: "{topic}"

Requirements:
- Start with an attention-grabbing hook
- Provide valuable insights or actionable tips
- Use a professional, clear, and concise tone
- End with a call to action (CTA) encouraging engagement
- Include 3-5 relevant hashtags for LinkedIn visibility
- Keep it between 150-300 words

Only return the LinkedIn post text — no explanations or metadata."""

# Image Generation Prompt
IMAGE_PROMPT_TEMPLATE = """Create a high-quality, professional photograph or digital illustration for a LinkedIn post about: {topic}

VISUAL REQUIREMENTS - IMPORTANT:
- Generate an actual photographic or illustrated scene, NOT text on a background
- Show relevant imagery: people, technology, workplace environments, objects, or concepts related to {topic}
- Style: Photorealistic business photography or high-quality digital illustration
- Setting: Professional corporate environment or relevant context
- Quality: High-resolution, well-lit, contemporary aesthetic
- Composition: Landscape orientation (16:9), balanced and visually appealing
- Colors: Professional color grading, corporate-appropriate palette
- Content: Rich visual storytelling through imagery alone

STRICTLY NO TEXT OR WORDS in the image - pure visual content only

Visual examples based on topic:
- AI/Technology: Modern office with computers, futuristic tech, people using AI tools, digital interfaces
- Healthcare: Medical professionals in hospital, health technology equipment, caring interactions
- Remote Work: Home office setups, video conference screens, modern workspaces, diverse professionals
- Leadership: Business meeting, team collaboration, professional presenting, office environment
- Finance: Trading floor, financial charts on screens, professional analysis, corporate office

Make it visually compelling, engaging, and suitable for LinkedIn professionals!"""


async def generate_linkedin_content(topic: str) -> Dict[str, str]:
    """
    Generate LinkedIn post text and image using Gemini API.
    Uses NEW Gemini API with gemini-2.5-flash-image model.
    
    Args:
        topic: The topic for the LinkedIn post
        
    Returns:
        Dict with 'text' and 'image' (base64 encoded) keys
    """
    try:
        # Import the NEW Gemini API
        from google import genai
        from google.genai import types
        
        # Initialize client with API key
        client = genai.Client(api_key=GOOGLE_API_KEY)
        
        # Step 1: Generate text content
        logger.info("📝 Generating LinkedIn post text...")
        text_prompt = LINKEDIN_PROMPT_TEMPLATE.format(topic=topic)
        
        text_response = client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=[text_prompt]
        )
        
        post_text = text_response.text.strip()
        logger.info("✅ Text generation successful")
        
        # Step 2: Generate image using NEW image generation model
        logger.info("🎨 Generating image with Gemini (nano banana)...")
        image_base64 = await generate_image_with_new_gemini(topic, client)
        
        logger.info("✅ LinkedIn content generated successfully")
        
        return {
            "text": post_text,
            "image": image_base64
        }
    
    except Exception as e:
        logger.error(f"❌ Error in generate_linkedin_content: {str(e)}")
        raise Exception(f"Gemini API error: {str(e)}")


async def generate_image_with_new_gemini(topic: str, client) -> str:
    """
    Generate image using NEW Gemini API with gemini-2.5-flash-image model.
    This is the "nano banana" approach from Google's official documentation.
    
    Args:
        topic: Topic for image generation
        client: Gemini client instance
        
    Returns:
        Base64 encoded image string
    """
    try:
        from PIL import Image
        
        # Create detailed image prompt
        image_prompt = IMAGE_PROMPT_TEMPLATE.format(topic=topic)
        
        logger.info(f"🎨 Requesting image with gemini-2.5-flash-image model...")
        logger.info(f"Topic: {topic}")
        
        # Generate image using the NEW model
        response = client.models.generate_content(
            model="gemini-2.5-flash-image",
            contents=[image_prompt]
        )
        
        logger.info("✅ Response received from Gemini")
        
        # Extract image from response (following Google's example)
        image_base64 = None
        
        for part in response.candidates[0].content.parts:
            # Check for text response (error case)
            if part.text is not None:
                logger.warning(f"⚠️ Received text instead of image: {part.text[:100]}...")
                continue
            
            # Check for image data
            elif part.inline_data is not None:
                logger.info("✅ Found inline_data with image!")
                
                # Get the binary image data
                image_data = part.inline_data.data
                
                # Convert to PIL Image to verify it's valid
                try:
                    image = Image.open(BytesIO(image_data))
                    logger.info(f"Image details: {image.format}, {image.size}, {image.mode}")
                    
                    # Convert to base64 for transmission
                    image_base64 = base64.b64encode(image_data).decode('utf-8')
                    logger.info(f"✅ Image converted to base64 (length: {len(image_base64)})")
                    
                    break
                    
                except Exception as img_error:
                    logger.error(f"Error processing image: {img_error}")
                    continue
        
        # If image was successfully generated
        if image_base64:
            logger.info("🎉 Gemini image generation successful!")
            return image_base64
        
        # If no image found, use fallback
        logger.warning("⚠️ No image data found in Gemini response")
        logger.info("🔄 Using visual fallback image...")
        return await generate_fallback_image(topic)
        
    except ImportError as e:
        logger.error(f"❌ Import error (missing google-genai package?): {e}")
        logger.info("Install with: pip install google-genai")
        return await generate_fallback_image(topic)
        
    except Exception as e:
        logger.error(f"❌ Gemini image generation error: {str(e)}")
        logger.error(f"Error type: {type(e).__name__}")
        logger.info("🔄 Using visual fallback image...")
        return await generate_fallback_image(topic)


async def generate_fallback_image(topic: str) -> str:
    """
    Generate a professional fallback image using PIL.
    Creates visually appealing abstract art instead of text.
    
    Args:
        topic: Topic text (used for color scheme selection)
        
    Returns:
        Base64 encoded PNG image
    """
    try:
        from PIL import Image, ImageDraw, ImageFilter
        import random
        
        logger.info("🎨 Generating enhanced visual fallback image...")
        
        # Create LinkedIn-optimized image
        width, height = 1200, 630
        
        # Determine color scheme based on topic keywords
        topic_lower = topic.lower()
        
        if any(word in topic_lower for word in ['tech', 'ai', 'digital', 'future', 'innovation', 'data', 'software']):
            # Tech theme: Blue/Cyan/Purple
            colors = [(30, 64, 175), (59, 130, 246), (139, 92, 246), (168, 85, 247)]
            theme = "Tech"
        elif any(word in topic_lower for word in ['health', 'medical', 'care', 'wellness', 'hospital', 'doctor']):
            # Health theme: Green/Teal
            colors = [(16, 185, 129), (5, 150, 105), (6, 182, 212), (20, 184, 166)]
            theme = "Health"
        elif any(word in topic_lower for word in ['business', 'finance', 'market', 'economy', 'invest', 'money']):
            # Business theme: Navy/Gold
            colors = [(30, 58, 138), (37, 99, 235), (251, 191, 36), (245, 158, 11)]
            theme = "Business"
        elif any(word in topic_lower for word in ['creative', 'design', 'art', 'brand', 'marketing', 'content']):
            # Creative theme: Pink/Orange
            colors = [(236, 72, 153), (219, 39, 119), (249, 115, 22), (251, 146, 60)]
            theme = "Creative"
        else:
            # Default: Professional blue gradient
            colors = [(30, 64, 175), (37, 99, 235), (59, 130, 246), (96, 165, 250)]
            theme = "Professional"
        
        logger.info(f"Using {theme} color theme")
        
        # Create base image with gradient
        img = Image.new('RGB', (width, height), colors[0])
        draw = ImageDraw.Draw(img)
        
        # Create smooth multi-color gradient
        for y in range(height):
            progress = y / height
            
            # Interpolate between multiple colors
            if progress < 0.33:
                t = progress * 3
                r = int(colors[0][0] + (colors[1][0] - colors[0][0]) * t)
                g = int(colors[0][1] + (colors[1][1] - colors[0][1]) * t)
                b = int(colors[0][2] + (colors[1][2] - colors[0][2]) * t)
            elif progress < 0.66:
                t = (progress - 0.33) * 3
                r = int(colors[1][0] + (colors[2][0] - colors[1][0]) * t)
                g = int(colors[1][1] + (colors[2][1] - colors[1][1]) * t)
                b = int(colors[1][2] + (colors[2][2] - colors[1][2]) * t)
            else:
                t = (progress - 0.66) * 3
                r = int(colors[2][0] + (colors[3][0] - colors[2][0]) * t)
                g = int(colors[2][1] + (colors[3][1] - colors[2][1]) * t)
                b = int(colors[2][2] + (colors[3][2] - colors[2][2]) * t)
            
            draw.line([(0, y), (width, y)], fill=(r, g, b))
        
        # Add abstract geometric shapes for visual interest
        random.seed(hash(topic) % 1000)  # Consistent randomness per topic
        
        # Create a semi-transparent overlay for shapes
        overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
        overlay_draw = ImageDraw.Draw(overlay)
        
        # Add circles/ellipses
        num_shapes = random.randint(4, 7)
        for _ in range(num_shapes):
            size = random.randint(150, 450)
            x = random.randint(-size//2, width - size//2)
            y = random.randint(-size//2, height - size//2)
            
            # Semi-transparent white
            alpha = random.randint(10, 35)
            color = (255, 255, 255, alpha)
            
            overlay_draw.ellipse([x, y, x + size, y + size], fill=color)
        
        # Add rectangles for variety
        for _ in range(random.randint(2, 5)):
            w = random.randint(120, 350)
            h = random.randint(120, 300)
            x = random.randint(-60, width - w + 60)
            y = random.randint(-60, height - h + 60)
            
            alpha = random.randint(8, 25)
            color = (255, 255, 255, alpha)
            
            overlay_draw.rectangle([x, y, x + w, y + h], fill=color)
        
        # Composite the overlay
        img = img.convert('RGBA')
        img = Image.alpha_composite(img, overlay)
        img = img.convert('RGB')
        
        # Apply subtle blur for smooth effect
        img = img.filter(ImageFilter.GaussianBlur(radius=2))
        
        # Add vignette effect (darker edges)
        vignette = Image.new('RGBA', (width, height), (0, 0, 0, 0))
        vignette_draw = ImageDraw.Draw(vignette)
        
        for i in range(100):
            alpha = int(i * 0.8)
            border = i * 3
            vignette_draw.rectangle(
                [border, border, width - border, height - border],
                outline=(0, 0, 0, alpha)
            )
        
        img = img.convert('RGBA')
        img = Image.alpha_composite(img, vignette)
        img = img.convert('RGB')
        
        # Convert to base64
        buffered = BytesIO()
        img.save(buffered, format="PNG", optimize=True, quality=95)
        img_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
        
        logger.info(f"✅ Visual fallback generated: {len(img_base64)} chars, {theme} theme")
        return img_base64
        
    except ImportError:
        logger.error("PIL not installed, using simple placeholder")
        return create_simple_placeholder()
    except Exception as e:
        logger.error(f"Error generating fallback: {e}")
        return create_simple_placeholder()


def create_simple_placeholder() -> str:
    """
    Create a minimal placeholder if all else fails.
    Returns a small colored rectangle as base64 PNG.
    """
    logger.info("Using simple placeholder image")
    # 1200x630 blue rectangle as base64 PNG (pre-encoded)
    return """
iVBORw0KGgoAAAANSUhEUgAABLAAAAJ2CAYAAABKhVbeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAD
CElEQVR4nO3BMQEAAADCoPVPbQwfoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoAMN
yAABEgjdigAAAABJRU5ErkJggg==
""".strip().replace('\n', '')