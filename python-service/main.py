from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class RiskInput(BaseModel):
    minDaysRemaining: float
    attendanceRate: float


class RiskOutput(BaseModel):
    score: int
    level: str


@app.get("/health")
def health():
    return {"status": "ok", "service": "risk-score-python"}


@app.post("/risk-score", response_model=RiskOutput)
def risk_score(payload: RiskInput):
    stock_risk = 100 if payload.minDaysRemaining <= 0 else max(
        0, 100 - payload.minDaysRemaining * 8
    )
    staff_risk = max(0, 100 - payload.attendanceRate * 100)

    score = round(stock_risk * 0.65 + staff_risk * 0.35)

    if score >= 65:
        level = "critical"
    elif score >= 35:
        level = "elevated"
    else:
        level = "stable"

    return RiskOutput(score=score, level=level)