from fastapi import FastAPI
from routes.admin import router as admin_router
from routes.menu import router as menu_router

app = FastAPI(title="Cafeteria App")

app.include_router(admin_router)
app.include_router(menu_router)

@app.get("/")
def health_check():
    return {"status": "Backend running"}
