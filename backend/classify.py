# classify.py
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from torchvision import models, transforms
import torch.nn as nn
import torch
from PIL import Image
import io

app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Device setup
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load model
model = models.resnet18(pretrained=True)
model.fc = nn.Linear(model.fc.in_features, 5)
model.load_state_dict(torch.load("model-24.pth", map_location="cpu"))
model = model.to(device)
model.eval()

# Image transform
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

# class_names = ["Birth Certificate", "Blank", "Citizenship", "NID", "Pan"]
class_names = ["Citizenship", "Blank", "Pan", "Birth Certificate", "NID"]

@app.post("/api/classify-image")
async def classify_image(file: UploadFile = File(...)):
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    input_tensor = transform(image).unsqueeze(0).to(device)
    with torch.no_grad():
        outputs = model(input_tensor)
        probs = torch.nn.functional.softmax(outputs[0], dim=0)
        predicted_idx = probs.argmax().item()
        predicted_class = class_names[predicted_idx]
        confidence = round(probs[predicted_idx].item(), 2)

    return {
        "predicted_class": predicted_class,
        "confidence": confidence
    }
