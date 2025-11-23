from src.dialogue_manager.dialogue_manager import DialogueManager


def test_money_transfer_flow():
    dm = DialogueManager()

    # Step 1 — user triggers intent but without slots
    output1 = dm.handle_nlu_output(
        intent="money_transfer",
        entities={},
        confidence=0.98
    )
    assert output1 == "How much do you want to transfer?"

    # Step 2 — user provides amount only
    output2 = dm.handle_nlu_output(
        intent="money_transfer",
        entities={"amount": "500"},
        confidence=0.99
    )
    assert output2 == "Please share the UPI ID."

    # Step 3 — user provides UPI ID
    output3 = dm.handle_nlu_output(
        intent="money_transfer",
        entities={"upi_id": "rahul@ybl"},
        confidence=0.99
    )

    assert "Transferring" in output3
    assert "rahul@ybl" in output3
    assert "500" in output3
