# Recommendation Microservice

This microservice provides course recommendations for learners based on their academic profile and interests using NLP (Sentence Transformers).

## Features
- Exposes a `/recommend` POST endpoint.
- Accepts learner profile and a list of courses.
- Returns top N recommended courses based on semantic similarity.

## Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the service:**
   ```bash
   uvicorn recommendation_api:app --reload --host 0.0.0.0 --port 8000
   ```

## API Usage

### Endpoint
`POST /recommend`

### Request Body Example
```json
{
  "profile": {
    "academic_details": "B.Tech in CSE, Science",
    "interests": ["AI/ML", "Cloud"]
  },
  "courses": [
    {"id": "1", "title": "Intro to Machine Learning", "description": "Learn ML basics", "category": "AI/ML"},
    {"id": "2", "title": "Cloud Computing", "description": "Cloud basics", "category": "Cloud"}
  ],
  "top_n": 5
}
```

### Response Example
```json
{
  "recommendations": [
    {"id": "1", "title": "Intro to Machine Learning", ...},
    ...
  ]
}
```

## Notes
- The model used is `all-MiniLM-L6-v2` from Sentence Transformers (open source, no API key needed).
- You can swap in OpenAI embeddings if desired.

## Integration
- Call this API from your Node.js backend or frontend after a learner updates their profile. 