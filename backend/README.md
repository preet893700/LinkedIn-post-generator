# LinkedIn Post Generator - Backend

FastAPI backend for AI-powered LinkedIn post generation with human approval workflow.

## 🚀 Features

- **AI Content Generation**: Uses Google Gemini Free API for text and image generation
- **Human Approval Workflow**: Review and approve posts before publishing
- **Post Logging**: Saves all approved posts in JSON format
- **RESTful API**: Clean, async endpoints for frontend integration
- **Error Handling**: Comprehensive error handling and logging

## 📁 Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app and endpoints
│   ├── gemini_client.py     # Gemini API integration
│   ├── linkedin_stub.py     # LinkedIn publishing simulation
│   ├── models.py            # Pydantic models
│   └── utils.py             # Helper functions
├── posts_log.json           # Approved posts storage
├── requirements.txt         # Python dependencies
├── .env.example            # Environment variables template
└── README.md               # This file
```

## 🛠️ Setup Instructions

### 1. Prerequisites

- Python 3.9 or higher
- Google Gemini API key (free tier)

### 2. Get Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 3. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 4. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env and add your Gemini API key
nano .env
```

Add your API key to `.env`:
```
GOOGLE_API_KEY=your_actual_gemini_api_key_here
PORT=8000
```

### 5. Run the Server

```bash
# Development mode with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## 📡 API Endpoints

### Health Check
```
GET /
```
Returns API status and version.

### Generate Post
```
POST /generate
Content-Type: application/json

{
  "topic": "AI in Healthcare"
}
```

**Response:**
```json
{
  "text": "Generated LinkedIn post content...",
  "image": "base64_encoded_image_string"
}
```

### Approve Post
```
POST /approve
Content-Type: application/json

{
  "topic": "AI in Healthcare",
  "text": "Post content...",
  "image": "base64_image..."
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Post successfully published!"
}
```

### Get All Posts
```
GET /posts
```

**Response:**
```json
{
  "posts": [
    {
      "topic": "AI in Healthcare",
      "text": "Post content...",
      "image": "base64_image...",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "status": "published"
    }
  ]
}
```

## 🧪 Testing the API

### Using curl

```bash
# Generate a post
curl -X POST http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -d '{"topic": "Future of AI"}'

# Get all posts
curl http://localhost:8000/posts
```

### Using Python

```python
import requests

# Generate post
response = requests.post(
    "http://localhost:8000/generate",
    json={"topic": "AI in Healthcare"}
)
print(response.json())

# Approve post
requests.post(
    "http://localhost:8000/approve",
    json={
        "topic": "AI in Healthcare",
        "text": "Post content...",
        "image": "base64_image..."
    }
)

# Get all posts
posts = requests.get("http://localhost:8000/posts").json()
print(f"Total posts: {len(posts['posts'])}")
```

## 📝 Data Storage

Posts are stored in `posts_log.json`:

```json
{
  "posts": [
    {
      "topic": "AI in Healthcare",
      "text": "Post content...",
      "image": "base64_encoded_image",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "status": "published"
    }
  ]
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_API_KEY` | Gemini API key | Yes |
| `PORT` | Server port | No (default: 8000) |
| `HOST` | Server host | No (default: 0.0.0.0) |

### Gemini Model Configuration

Current model: `gemini-2.0-flash-exp`

To change the model, edit `gemini_client.py`:
```python
model = genai.GenerativeModel("your-preferred-model")
```

## 🚨 Error Handling

The API includes comprehensive error handling:

- **400**: Bad request (invalid input)
- **500**: Internal server error (API failures)

All errors return JSON:
```json
{
  "detail": "Error description"
}
```

## 📊 Logging

Logs are output to console with timestamps:

```
INFO:     Application startup complete
INFO:     Generating post for topic: AI in Healthcare
INFO:     Calling Gemini API for text generation...
INFO:     Content generated successfully
```

## 🔐 Security Notes

1. **Never commit `.env`** - It contains your API key
2. **Use environment variables** in production
3. **Implement rate limiting** for production use
4. **Add authentication** before deploying publicly

## 🚀 Deployment

### Deploy to Render

1. Create `render.yaml`:
```yaml
services:
  - type: web
    name: linkedin-post-generator
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: GOOGLE_API_KEY
        sync: false
```

2. Add environment variables in Render dashboard
3. Deploy from GitHub repository

### Deploy to Heroku

```bash
# Create Procfile
echo "web: uvicorn app.main:app --host 0.0.0.0 --port \$PORT" > Procfile

# Deploy
heroku create your-app-name
heroku config:set GOOGLE_API_KEY=your_key
git push heroku main
```

## 🆘 Troubleshooting

### API Key Issues
```
ValueError: GOOGLE_API_KEY environment variable not set
```
**Solution**: Ensure `.env` file exists with valid API key

### Import Errors
```
ModuleNotFoundError: No module named 'google.generativeai'
```
**Solution**: Run `pip install -r requirements.txt`

### CORS Issues
```
Access to fetch at 'http://localhost:8000' has been blocked by CORS policy
```
**Solution**: CORS is already configured in `main.py`. Ensure frontend URL is correct.

## 📚 Additional Resources

- [Gemini API Documentation](https://ai.google.dev/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [LinkedIn API Documentation](https://docs.microsoft.com/en-us/linkedin/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - Feel free to use this project for your needs!