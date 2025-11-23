import pytest
from src.nlu.entity_extractor import extract_amounts_regex, extract_dates_regex, extract_upi_regex, extract_last4_regex, predict_entities, combined_nlu

def test_amount_regex_simple():
    text = "Please transfer ₹1,200 to my savings account."
    res = extract_amounts_regex(text)
    assert any(r["entity"] == "amount" for r in res)
    assert any(r.get("normalized") == "1200" for r in res)

def test_date_regex_simple():
    text = "Pay by 12/09/2024 or on 5 Dec 2024."
    d = extract_dates_regex(text)
    assert len(d) >= 1

def test_upi_and_last4():
    text = "Send to alice@okbank or card ending 4321."
    upi = extract_upi_regex(text)
    last4 = extract_last4_regex(text)
    assert any("alice@okbank" in e["value"] for e in upi)
    assert any(e["entity"] == "last4" for e in last4)

def test_predict_entities_combined():
    text = "Transfer 500 rupees to Rahul via upi alice@okbank before 12/12/2024, card ending 9876."
    ents = predict_entities(text)
    # should find amount, upi, date, and possibly last4
    assert any(e["entity"] == "amount" for e in ents)
    assert any(e["entity"] == "upi_id" for e in ents)
    assert any(e["entity"] == "date" for e in ents)

def test_combined_nlu_stub_intent():
    # This assumes intent classifier exists/loaded; if not it should gracefully empty intents
    text = "How much money do I have?"
    out = combined_nlu(text)
    assert "text" in out and out["text"] == text
    assert "entities" in out and isinstance(out["entities"], list)
    assert "intents" in out and isinstance(out["intents"], list)
