"""
Bank statement parser for Indian banks (HDFC, ICICI, SBI, Axis, Kotak).
Supports PDF (via pdfplumber) and Excel/CSV.
"""
import re
import logging
from pathlib import Path
import pandas as pd

logger = logging.getLogger(__name__)

_RULES = {
    "income":      [r"salary", r"credit.*sal", r"payroll", r"dividend", r"interest credited"],
    "investment":  [r"\bsip\b", r"mutual fund", r"groww", r"zerodha", r"kite", r"neft.*mf"],
    "committed":   [r"\bemi\b", r"loan.*debit", r"insurance", r"\brent\b", r"electricity",
                    r"gas bill", r"broadband", r"school fee", r"neft.*loan"],
    "discretionary": [],
}


def classify_transaction(description: str) -> str:
    """Return transaction type: income | investment | committed | discretionary."""
    desc = description.lower()
    for tx_type, patterns in _RULES.items():
        if any(re.search(p, desc) for p in patterns):
            return tx_type
    return "discretionary"


def parse_description(raw: str) -> str:
    """Clean UPI/NEFT noise from description."""
    raw = re.sub(r"UPI/\d+/", "", raw)
    raw = re.sub(r"/[A-Z0-9@.]+$", "", raw)
    raw = re.sub(r"\s+", " ", raw).strip()
    return raw or raw


def _detect_columns(df: pd.DataFrame) -> dict:
    """Heuristically map DataFrame columns to: date, description, debit, credit, amount."""
    cols = {c.lower().strip(): c for c in df.columns}
    mapping = {}
    for key, aliases in {
        "date": ["date", "txn date", "transaction date", "value date"],
        "description": ["description", "particulars", "narration", "details", "remarks"],
        "debit": ["debit", "withdrawal", "dr", "debit amount"],
        "credit": ["credit", "deposit", "cr", "credit amount"],
        "amount": ["amount"],
    }.items():
        for alias in aliases:
            if alias in cols:
                mapping[key] = cols[alias]
                break
        else:
            mapping[key] = None
    return mapping


def parse_excel_statement(file_bytes: bytes, filename: str) -> list[dict]:
    """Parse Excel or CSV bank statement. Returns list of transaction dicts."""
    try:
        if filename.lower().endswith(".csv"):
            df = pd.read_csv(pd.io.common.BytesIO(file_bytes), on_bad_lines="skip")
        else:
            df = pd.read_excel(pd.io.common.BytesIO(file_bytes), engine="openpyxl")

        df.columns = [str(c).strip() for c in df.columns]
        m = _detect_columns(df)
        if not m.get("date") or not m.get("description"):
            logger.warning("Could not detect required columns in statement")
            return []

        transactions = []
        for _, row in df.iterrows():
            raw_desc = str(row.get(m["description"], ""))
            if not raw_desc or raw_desc == "nan":
                continue

            amount = 0.0
            if m.get("debit") and m.get("credit"):
                debit = _to_float(row.get(m["debit"]))
                credit = _to_float(row.get(m["credit"]))
                amount = credit - debit
            elif m.get("amount"):
                amount = _to_float(row.get(m["amount"]))

            if amount == 0:
                continue

            desc = parse_description(raw_desc)
            transactions.append({
                "date": str(row.get(m["date"], ""))[:10],
                "description": desc,
                "amount": round(amount, 2),
                "transaction_type": classify_transaction(raw_desc),
                "confidence": "high",
                "raw_text": raw_desc,
            })
        return transactions
    except Exception as e:
        logger.error(f"Excel parse error: {e}")
        return []


def parse_pdf_statement(file_bytes: bytes) -> list[dict]:
    """Parse PDF bank statement using pdfplumber."""
    try:
        import pdfplumber
        import io
        transactions = []
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                tables = page.extract_tables()
                for table in tables:
                    if not table or len(table) < 2:
                        continue
                    headers = [str(c).lower().strip() if c else "" for c in table[0]]
                    m = _detect_columns_from_list(headers)
                    for row in table[1:]:
                        if not row or len(row) < 3:
                            continue
                        desc_idx = m.get("description")
                        date_idx = m.get("date")
                        if desc_idx is None or date_idx is None:
                            continue
                        raw_desc = str(row[desc_idx] or "").strip()
                        if not raw_desc:
                            continue
                        debit = _to_float(row[m["debit"]] if m.get("debit") is not None else 0)
                        credit = _to_float(row[m["credit"]] if m.get("credit") is not None else 0)
                        amount = credit - debit
                        if amount == 0:
                            continue
                        transactions.append({
                            "date": str(row[date_idx] or "")[:10],
                            "description": parse_description(raw_desc),
                            "amount": round(amount, 2),
                            "transaction_type": classify_transaction(raw_desc),
                            "confidence": "medium",
                            "raw_text": raw_desc,
                        })
        return transactions
    except Exception as e:
        logger.error(f"PDF parse error: {e}")
        return []


def _detect_columns_from_list(headers: list) -> dict:
    aliases = {
        "date": ["date", "txn date", "transaction date", "value date"],
        "description": ["description", "particulars", "narration", "details"],
        "debit": ["debit", "withdrawal", "dr"],
        "credit": ["credit", "deposit", "cr"],
    }
    result = {}
    for key, names in aliases.items():
        result[key] = next((i for i, h in enumerate(headers) if any(n in h for n in names)), None)
    return result


def _to_float(val) -> float:
    if val is None:
        return 0.0
    try:
        return float(str(val).replace(",", "").replace("₹", "").strip() or 0)
    except (ValueError, TypeError):
        return 0.0
