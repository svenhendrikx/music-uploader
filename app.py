from rich import print
import json

from fastapi import FastAPI, File, Form, UploadFile
from typing import List
import eyed3  # For ID3 tag editing

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,  # Allow cookies and credentials
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)


@app.post("/upload")
async def upload(files: List[UploadFile] = File(...),
                 metadata: List[str] = Form(...),
                 ):
    for i, file in enumerate(files):
        metadata_dict = json.loads(metadata[i])
        metadata_dict['genre'] = metadata_dict['genre'][0]
        content = await file.read()
        with open(file.filename, "wb") as f:
            f.write(content)
        # # Edit ID3 tags
        audiofile = eyed3.load(file.filename)
        for key, value in metadata_dict.items():
            setattr(audiofile.tag, key, value)
        audiofile.tag.save()

    return {"message": "Files uploaded successfully"}
