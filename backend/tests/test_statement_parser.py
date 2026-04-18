import pytest
from backend.utils.statement_parser import classify_transaction, parse_description


def test_classify_emi_as_committed():
    assert classify_transaction("HDFC BANK EMI 5000") == "committed"


def test_classify_sip_as_investment():
    assert classify_transaction("SIP MIRAE ASSET") == "investment"


def test_classify_salary_as_income():
    assert classify_transaction("SALARY CREDIT") == "income"


def test_classify_amazon_as_discretionary():
    assert classify_transaction("Amazon Pay") == "discretionary"


def test_parse_description_extracts_merchant():
    result = parse_description("UPI/123456/Amazon Pay/merchant@okhdfc")
    assert "Amazon" in result


def test_classify_insurance_as_committed():
    assert classify_transaction("HDFC LIFE INSURANCE PREMIUM") == "committed"


def test_classify_zerodha_as_investment():
    assert classify_transaction("NEFT ZERODHA BROKING") == "investment"
