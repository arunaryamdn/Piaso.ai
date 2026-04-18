import logging
from datetime import date, timedelta
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from pydantic import BaseModel
from typing import Optional
from backend.api.routes_portfolio import get_user_id_from_token
from backend.utils.statement_parser import parse_excel_statement, parse_pdf_statement
from backend.utils.db import fetchall, execute

router = APIRouter(prefix="/api/spend", tags=["spend"])
logger = logging.getLogger(__name__)


class SalaryCycleConfig(BaseModel):
    salary_amount: float
    salary_day: int = 1


class TransactionUpdate(BaseModel):
    category: Optional[str] = None
    transaction_type: Optional[str] = None


@router.post("/upload-statement")
async def upload_statement(
    file: UploadFile = File(...),
    user_id: str = Depends(get_user_id_from_token),
):
    content = await file.read()
    filename = file.filename or ""
    if filename.lower().endswith(".pdf"):
        transactions = parse_pdf_statement(content)
    else:
        transactions = parse_excel_statement(content, filename)

    if not transactions:
        raise HTTPException(status_code=422, detail="Could not parse any transactions from file")

    inserted = 0
    for tx in transactions:
        try:
            execute(
                """INSERT INTO transactions (user_id, date, description, amount, transaction_type, confidence, source, source_file, raw_text)
                   VALUES (?, ?, ?, ?, ?, ?, 'upload', ?, ?)""",
                (user_id, tx["date"], tx["description"], tx["amount"],
                 tx["transaction_type"], tx["confidence"], filename, tx["raw_text"]),
            )
            inserted += 1
        except Exception as e:
            logger.warning(f"Failed to insert transaction: {e}")

    return {"inserted": inserted, "total_parsed": len(transactions)}


@router.get("/transactions")
async def list_transactions(
    limit: int = 50,
    offset: int = 0,
    tx_type: Optional[str] = None,
    user_id: str = Depends(get_user_id_from_token),
):
    where = "user_id = ?"
    params: list = [user_id]
    if tx_type:
        where += " AND transaction_type = ?"
        params.append(tx_type)
    rows = fetchall(
        None,
        f"SELECT * FROM transactions WHERE {where} ORDER BY date DESC LIMIT ? OFFSET ?",
        (*params, limit, offset),
    )
    return {"transactions": rows, "limit": limit, "offset": offset}


@router.get("/summary")
async def spend_summary(user_id: str = Depends(get_user_id_from_token)):
    cycles = fetchall(None, "SELECT * FROM salary_cycles WHERE user_id = ?", (user_id,))
    config = cycles[0] if cycles else {"salary_amount": 0, "salary_day": 1}

    today = date.today()
    salary_day = int(config.get("salary_day", 1))
    salary_amount = float(config.get("salary_amount", 0))

    if today.day >= salary_day:
        cycle_start = today.replace(day=salary_day)
    else:
        prev_month = today.replace(day=1) - timedelta(days=1)
        cycle_start = prev_month.replace(day=min(salary_day, prev_month.day))

    rows = fetchall(
        None,
        "SELECT * FROM transactions WHERE user_id = ? AND date >= ? ORDER BY date DESC",
        (user_id, str(cycle_start)),
    )

    income = sum(float(r["amount"]) for r in rows if float(r["amount"]) > 0)
    spent = abs(sum(float(r["amount"]) for r in rows if float(r["amount"]) < 0))
    committed = abs(sum(float(r["amount"]) for r in rows if r["transaction_type"] == "committed" and float(r["amount"]) < 0))
    discretionary = abs(sum(float(r["amount"]) for r in rows if r["transaction_type"] == "discretionary" and float(r["amount"]) < 0))

    balance = (salary_amount or income) - spent
    days_in_cycle = 30
    days_elapsed = (today - cycle_start).days + 1
    days_remaining = max(0, days_in_cycle - days_elapsed)
    daily_burn = spent / max(days_elapsed, 1)
    runway_days = int(balance / daily_burn) if daily_burn > 0 else days_remaining

    pct_spent = (spent / salary_amount * 100) if salary_amount > 0 else 0
    health = "green" if pct_spent < 70 else "amber" if pct_spent < 90 else "red"

    return {
        "health": health,
        "salary_amount": salary_amount,
        "spent": round(spent, 2),
        "committed": round(committed, 2),
        "discretionary": round(discretionary, 2),
        "balance": round(balance, 2),
        "pct_spent": round(pct_spent, 1),
        "runway_days": runway_days,
        "cycle_start": str(cycle_start),
        "days_elapsed": days_elapsed,
        "days_remaining": days_remaining,
    }


@router.post("/salary-cycle")
async def set_salary_cycle(
    config: SalaryCycleConfig,
    user_id: str = Depends(get_user_id_from_token),
):
    execute(
        """INSERT INTO salary_cycles (user_id, salary_amount, salary_day)
           VALUES (?, ?, ?)
           ON CONFLICT (user_id) DO UPDATE SET salary_amount = excluded.salary_amount, salary_day = excluded.salary_day, updated_at = NOW()""",
        (user_id, config.salary_amount, config.salary_day),
    )
    return {"status": "ok"}
