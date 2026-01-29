from fastapi import APIRouter
import json
import os

router = APIRouter(prefix="/menu")

# Absolute path to your menu JSON file
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MENU_JSON_PATH = os.path.join(BASE_DIR, "data", "menu_data.json")

@router.get("/daily")
def get_daily_menu():
    with open(MENU_JSON_PATH, "r", encoding="utf-8") as f:
        menu_data = json.load(f)
    return menu_data
