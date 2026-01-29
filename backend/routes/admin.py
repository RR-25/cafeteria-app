from fastapi import APIRouter, UploadFile, File, HTTPException
import os
from utils.excel_parser import excel_to_json

router = APIRouter(prefix="/admin", tags=["Admin"])

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")

EXCEL_PATH = os.path.join(DATA_DIR, "menu.xlsx")
JSON_PATH = os.path.join(DATA_DIR, "menu_data.json")


@router.post("/upload-menu")
async def upload_menu_excel(file: UploadFile = File(...)):
    if not file.filename.endswith(".xlsx"):
        raise HTTPException(status_code=400, detail="Only Excel (.xlsx) files allowed")

    os.makedirs(DATA_DIR, exist_ok=True)

    # Save Excel
    with open(EXCEL_PATH, "wb") as f:
        f.write(await file.read())

    # Convert to JSON
    excel_to_json(EXCEL_PATH, JSON_PATH)

    return {
        "message": "Menu updated successfully",
        "file": file.filename
    }
