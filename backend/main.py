from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import os
import pdfplumber
import docx
from fastapi import UploadFile, File
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

HF_API_TOKEN = os.getenv("HF_API_TOKEN")
API_URL = "https://router.huggingface.co/hf-inference/models/sshleifer/distilbart-cnn-12-6"
headers = {"Authorization": f"Bearer {HF_API_TOKEN}"}

def split_text(text, chunk_size=800):
    words = text.split()
    chunks = []

    for i in range(0, len(words), chunk_size):
        chunk = " ".join(words[i:i+chunk_size])
        chunks.append(chunk)

    return chunks

def extract_pdf_text(file):
    text = ""
    with pdfplumber.open(file.file) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""
    return text


def extract_docx_text(file):
    doc = docx.Document(file.file)
    text = "\n".join([para.text for para in doc.paragraphs])
    return text

class TextInput(BaseModel):
    text: str
    max_length: int = 130
    min_length: int = 30

@app.get("/")
def root():
    return {"status": "Backend is running"}
@app.post("/summarize-file")
async def summarize_file(file: UploadFile = File(...)):

    if file.filename.endswith(".pdf"):
        text = extract_pdf_text(file)

    elif file.filename.endswith(".docx"):
        text = extract_docx_text(file)

    else:
        return {"error": "Only PDF and DOCX files are supported."}

    chunks = split_text(text)

    summaries = []

    for chunk in chunks:

        payload = {
            "inputs": chunk,
            "parameters": {
                "max_length": 130,
                "min_length": 30
            }
        }

        response = requests.post(API_URL, headers=headers, json=payload)
        result = response.json()

        if isinstance(result, list):
            summaries.append(result[0]["summary_text"])

    combined_summary = " ".join(summaries)

    payload = {
        "inputs": combined_summary,
        "parameters": {
            "max_length": 130,
            "min_length": 30
        }
    }

    response = requests.post(API_URL, headers=headers, json=payload)
    result = response.json()

    final_summary = result[0]["summary_text"]

    return {"summary": final_summary}