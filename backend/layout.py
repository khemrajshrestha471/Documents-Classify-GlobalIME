from azure.ai.formrecognizer import DocumentAnalysisClient
from azure.core.credentials import AzureKeyCredential
from dotenv import load_dotenv
import os
import json

load_dotenv()

endpoint = os.getenv("FORM_RECOGNIZER_ENDPOINT")
key = os.getenv("FORM_RECOGNIZER_KEY")

document_analysis_client = DocumentAnalysisClient(
    endpoint=endpoint,
    credential=AzureKeyCredential(key)
)

# Load image (e.g. JPG, PNG, PDF)
with open("qq.jpg", "rb") as f:
    poller = document_analysis_client.begin_analyze_document("prebuilt-document", f)

result = poller.result()

# Collect key-value pairs in a dictionary
kv_data = {}

for kv_pair in result.key_value_pairs:
    key_text = kv_pair.key.content if kv_pair.key else "N/A"
    value_text = kv_pair.value.content if kv_pair.value else "N/A"
    kv_data[key_text] = value_text

# Print as formatted JSON
print(json.dumps(kv_data, indent=2, ensure_ascii=False))