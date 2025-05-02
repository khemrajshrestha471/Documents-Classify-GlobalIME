# from fastapi import FastAPI, File, UploadFile
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# from typing import List
# from azure.ai.vision.imageanalysis import ImageAnalysisClient
# from azure.ai.vision.imageanalysis.models import VisualFeatures
# from azure.core.credentials import AzureKeyCredential
# import os
# from dotenv import load_dotenv

# load_dotenv()

# app = FastAPI()

# # Enable CORS
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Azure credentials
# endpoint = os.getenv("VISION_ENDPOINT")
# key = os.getenv("VISION_KEY")
# client = ImageAnalysisClient(endpoint=endpoint, credential=AzureKeyCredential(key))

# class LineData(BaseModel):
#     text: str
#     mean_confidence: float
#     coordinates: str

# class LineResponse(BaseModel):
#     lines: List[LineData]

# @app.post("/api/coordinates", response_model=LineResponse)
# async def get_coordinates(file: UploadFile = File(...)):
#     image_data = await file.read()

#     result = client.analyze(
#         image_data=image_data,
#         visual_features=[VisualFeatures.READ]
#     )

#     response_lines = []

#     if result.read:
#         for block in result.read.blocks:
#             for line in block.lines:
#                 word_confidences = [word.confidence for word in line.words if word.confidence is not None]
#                 mean_conf = sum(word_confidences) / len(word_confidences) if word_confidences else 0.0

#                 # Bounding box calculation
#                 points = line.bounding_polygon
#                 if len(points) == 4:
#                     x_coords = [pt["x"] for pt in points]
#                     y_coords = [pt["y"] for pt in points]

#                     top_left = (min(x_coords), min(y_coords))
#                     bottom_right = (max(x_coords), max(y_coords))

#                     coord_str = f"({top_left[0]}, {top_left[1]}), ({bottom_right[0]}, {bottom_right[1]})"
#                 else:
#                     coord_str = "N/A"

#                 response_lines.append(LineData(
#                     text=line.text,
#                     mean_confidence=round(mean_conf, 4),
#                     coordinates=coord_str
#                 ))
#     # print(response_lines)
#     return {"lines": response_lines}




from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Union
from azure.core.credentials import AzureKeyCredential
from azure.ai.vision.imageanalysis import ImageAnalysisClient
from azure.ai.vision.imageanalysis.models import VisualFeatures
from azure.ai.formrecognizer import DocumentAnalysisClient
import os
from dotenv import load_dotenv
import tempfile

# Load environment variables
load_dotenv()

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Azure credentials
VISION_ENDPOINT = os.getenv("VISION_ENDPOINT")
VISION_KEY = os.getenv("VISION_KEY")
FORM_RECOGNIZER_ENDPOINT = os.getenv("FORM_RECOGNIZER_ENDPOINT")
FORM_RECOGNIZER_KEY = os.getenv("FORM_RECOGNIZER_KEY")

# Azure clients
vision_client = ImageAnalysisClient(endpoint=VISION_ENDPOINT, credential=AzureKeyCredential(VISION_KEY))
form_client = DocumentAnalysisClient(endpoint=FORM_RECOGNIZER_ENDPOINT, credential=AzureKeyCredential(FORM_RECOGNIZER_KEY))


# Pydantic models
class LineData(BaseModel):
    text: str
    mean_confidence: float
    coordinates: str

class CombinedResponse(BaseModel):
    key_value_pairs: Dict[str, str]
    lines: List[LineData]


@app.post("/api/coordinates", response_model=CombinedResponse)
async def analyze_image(file: UploadFile = File(...)):
    image_data = await file.read()

    # --- Azure Form Recognizer ---
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
        temp_file.write(image_data)
        temp_file_path = temp_file.name

    with open(temp_file_path, "rb") as f:
        poller = form_client.begin_analyze_document("prebuilt-document", f)
        result = poller.result()

    kv_data = {}
    for kv_pair in result.key_value_pairs:
        key_text = kv_pair.key.content if kv_pair.key else "N/A"
        value_text = kv_pair.value.content if kv_pair.value else "N/A"
        kv_data[key_text] = value_text

    # --- Azure Image Analysis ---
    result = vision_client.analyze(
        image_data=image_data,
        visual_features=[VisualFeatures.READ]
    )

    response_lines = []
    if result.read:
        for block in result.read.blocks:
            for line in block.lines:
                word_confidences = [word.confidence for word in line.words if word.confidence is not None]
                mean_conf = sum(word_confidences) / len(word_confidences) if word_confidences else 0.0

                points = line.bounding_polygon
                if len(points) == 4:
                    x_coords = [pt["x"] for pt in points]
                    y_coords = [pt["y"] for pt in points]
                    top_left = (min(x_coords), min(y_coords))
                    bottom_right = (max(x_coords), max(y_coords))
                    coord_str = f"({top_left[0]}, {top_left[1]}), ({bottom_right[0]}, {bottom_right[1]})"
                else:
                    coord_str = "N/A"

                response_lines.append(LineData(
                    text=line.text,
                    mean_confidence=round(mean_conf, 4),
                    coordinates=coord_str
                ))
    print(response_lines)
    print("..............................")
    print(kv_data)
    return {
        "key_value_pairs": kv_data,
        "lines": response_lines
    }