from typing import Literal

from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()

# Must match the local fallback in the Node server so both give the same score.
STOCK_WEIGHT = 0.65
STAFF_WEIGHT = 0.35
RISK_PER_DAY_LEFT = 8  # each day of stock remaining lowers stock risk by this much
CRITICAL_THRESHOLD = 65
ELEVATED_THRESHOLD = 35

Level = Literal["critical", "elevated", "stable"]


class RiskInput(BaseModel):
    minDaysRemaining: float
    attendanceRate: float = Field(ge=0, le=1)


class RiskOutput(BaseModel):
    score: int
    level: Level


def compute_score(min_days_remaining: float, attendance_rate: float) -> RiskOutput:
    if min_days_remaining <= 0:
        stock_risk = 100
    else:
        stock_risk = max(0, 100 - min_days_remaining * RISK_PER_DAY_LEFT)

    staff_risk = 100 - attendance_rate * 100

    score = round(stock_risk * STOCK_WEIGHT + staff_risk * STAFF_WEIGHT)

    if score >= CRITICAL_THRESHOLD:
        level = "critical"
    elif score >= ELEVATED_THRESHOLD:
        level = "elevated"
    else:
        level = "stable"

    return RiskOutput(score=score, level=level)


@app.get("/health")
def health():
    return {"status": "ok", "service": "risk-score-python"}


@app.post("/risk-score", response_model=RiskOutput)
def risk_score(payload: RiskInput):
    return compute_score(payload.minDaysRemaining, payload.attendanceRate)