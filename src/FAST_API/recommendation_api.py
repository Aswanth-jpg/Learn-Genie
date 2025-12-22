from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List
import uvicorn

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict this to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = SentenceTransformer('all-MiniLM-L6-v2')  # Open source, fast, good quality

class Profile(BaseModel):
    academic_details: str
    interests: List[str]

class Course(BaseModel):
    id: str
    title: str
    description: str
    category: str

class RecommendationRequest(BaseModel):
    profile: Profile
    courses: List[Course]
    top_n: int = 5

@app.post("/recommend")
async def recommend(data: RecommendationRequest):
    # Combine profile info
    profile_text = f"{data.profile.academic_details} {' '.join(data.profile.interests)}"
    course_texts = [
        f"{c.title} {c.description} {c.category}" for c in data.courses
    ]
    # Embed
    profile_vec = model.encode([profile_text])
    course_vecs = model.encode(course_texts)
    # Similarity
    sims = cosine_similarity(profile_vec, course_vecs)[0]
    # Top N
    top_indices = sims.argsort()[::-1][:data.top_n]
    recommendations = [data.courses[i] for i in top_indices]
    return {"recommendations": recommendations}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 