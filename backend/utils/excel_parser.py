import pandas as pd
import json
from datetime import datetime


def excel_to_json(excel_path, json_path):
    # Read raw sheet (NO headers)
    df = pd.read_excel(excel_path, header=None)

    # Row 0 → Dates
    date_row = df.iloc[0]

    # Row 1 → Day names
    day_row = df.iloc[1]

    menu_json = {}

    # Start from column 1 (column 0 = meal names)
    for col in range(1, len(date_row)):
        raw_date = date_row[col]

        if pd.isna(raw_date):
            continue

        date_key = (
            raw_date.strftime("%Y-%m-%d")
            if isinstance(raw_date, datetime)
            else str(raw_date)
        )

        menu_json[date_key] = {
            "day": str(day_row[col]),
            "meals": {}
        }

        # Rows 2+ contain meals
        for row in range(2, len(df)):
            meal_name = df.iloc[row, 0]

            if pd.isna(meal_name):
                continue

            meal_name_clean = (
                str(meal_name)
                .split("(")[0]
                .strip()
                .upper()
            )

            menu_item = df.iloc[row, col]

            if pd.isna(menu_item):
                continue

            menu_json[date_key]["meals"][meal_name_clean] = str(menu_item)

    # Save JSON
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(menu_json, f, indent=4, ensure_ascii=False)

    return menu_json
if __name__ == "__main__":
    data = excel_to_json(
        "data/menu.xlsx",
        "data/menu_data.json"
    )
    print(json.dumps(data, indent=4, ensure_ascii=False))
