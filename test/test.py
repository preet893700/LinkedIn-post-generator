# test.py
import os
import base64
from dotenv import load_dotenv
from google import genai
from PIL import Image
from io import BytesIO

load_dotenv()
API_KEY = os.getenv("GOOGLE_API_KEY")
if not API_KEY:
    raise ValueError("GOOGLE_API_KEY missing in .env")

# Initialize client with api key
client = genai.Client(api_key=API_KEY)

# Use a clear, safe, literal prompt to avoid safety refusals
prompt = "A beautifully plated miniature banana dessert in a fine dining restaurant with a Gemini constellation theme, photo-realistic"

# Call the image model (per Google docs)
response = client.models.generate_content(
    model="gemini-2.5-flash-image",
    contents=[prompt],
)

def try_save_image_from_bytes(bytes_data, output_path="generated_image.png"):
    img = Image.open(BytesIO(bytes_data))
    img.save(output_path)
    return output_path

found_image = False

# The response may contain multiple candidates/parts (docs show this structure)
for candidate in getattr(response, "candidates", []) or []:
    for part in getattr(candidate.content, "parts", []) or []:
        # 1) If model returned text (explanation or refusal), print it
        if getattr(part, "text", None):
            print("📝 Model text output:")
            print(part.text)
        # 2) inline_data could be bytes OR base64-encoded string (SDKs differ)
        elif getattr(part, "inline_data", None):
            inline = part.inline_data
            # common attribute names: .data (bytes) or .data (base64 str)
            data = getattr(inline, "data", None)
            if data is None:
                # some SDK shapes have .binary or .b64 — try common fallbacks
                data = getattr(inline, "binary", None) or getattr(inline, "b64", None)
            if isinstance(data, (bytes, bytearray)):
                out = try_save_image_from_bytes(data, "generated_image.png")
                print(f"✅ Image saved as {out}")
                found_image = True
            elif isinstance(data, str):
                # assume base64 string
                try:
                    decoded = base64.b64decode(data)
                    out = try_save_image_from_bytes(decoded, "generated_image.png")
                    print(f"✅ Image saved as {out}")
                    found_image = True
                except Exception as e:
                    print("⚠️ Failed to decode base64 inline data:", e)
            else:
                print("⚠️ Received inline_data in an unknown format:", type(data))
        else:
            # Unexpected part structure
            print("⚠️ Unknown part returned. Raw part repr:")
            print(part)

if not found_image:
    print("⚠️ No image bytes returned. If the model printed a refusal above, try rewording the prompt to be more literal and non-suggestive.")
    print("⚡Tip: If you see safety text, adjust wording (avoid ambiguous/sexual/political terms) and try again.")
