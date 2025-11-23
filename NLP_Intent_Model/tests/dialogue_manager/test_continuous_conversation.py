"""
Test continuous conversation handling, fallbacks, and multi-turn dialogues.
"""
from src.dialogue_manager.dialogue_manager import DialogueManager


def test_continuous_money_transfer():
    """Test multi-turn money transfer conversation."""
    dm = DialogueManager()
    
    # Turn 1: User initiates transfer without details
    response1 = dm.handle_nlu_output(
        intent="money_transfer",
        entities={},
        confidence=0.95
    )
    assert "transfer" in response1.lower() or "amount" in response1.lower() or "upi" in response1.lower()
    assert dm.conversation_active == True
    assert dm.current_intent == "money_transfer"
    
    # Turn 2: User provides amount
    response2 = dm.handle_nlu_output(
        intent="money_transfer",  # Same intent
        entities={"amount": "500"},
        confidence=0.95
    )
    assert "upi" in response2.lower() or "recipient" in response2.lower()
    assert dm.slots.get_slot("amount") == "500"
    assert dm.conversation_active == True
    
    # Turn 3: User provides UPI ID
    response3 = dm.handle_nlu_output(
        intent="money_transfer",
        entities={"upi_id": "rahul@ybl"},
        confidence=0.95
    )
    assert "Transferring" in response3 or "transfer" in response3.lower()
    assert "500" in response3
    assert "rahul@ybl" in response3
    assert dm.conversation_active == False  # Conversation completed


def test_fallback_handling():
    """Test fallback handling with low confidence."""
    dm = DialogueManager()
    
    # First low confidence
    response1 = dm.handle_nlu_output(
        intent="unknown",
        entities={},
        confidence=0.30
    )
    assert "didn't understand" in response1.lower() or "rephrase" in response1.lower()
    assert dm.fallback.fallback_count == 1
    
    # Second low confidence
    response2 = dm.handle_nlu_output(
        intent="unknown",
        entities={},
        confidence=0.25
    )
    assert dm.fallback.fallback_count == 2
    
    # Successful intent resets fallback count
    response3 = dm.handle_nlu_output(
        intent="check_balance",
        entities={},
        confidence=0.90
    )
    assert dm.fallback.fallback_count == 0


def test_intent_continuity():
    """Test that system maintains intent context across turns."""
    dm = DialogueManager()
    
    # Start money transfer
    dm.handle_nlu_output("money_transfer", {}, 0.95)
    
    # User provides amount in next turn (might be detected as different intent)
    # But entities match required slots, so should continue
    response = dm.handle_nlu_output(
        intent="check_balance",  # Different intent detected
        entities={"amount": "500"},  # But provides amount slot
        confidence=0.85
    )
    # Should continue with money_transfer since amount slot is needed
    assert dm.current_intent == "money_transfer" or "upi" in response.lower()


def test_slot_persistence():
    """Test that slots persist across turns in continuous conversation."""
    dm = DialogueManager()
    
    # Turn 1: Provide amount
    dm.handle_nlu_output("money_transfer", {"amount": "1000"}, 0.95)
    
    # Verify amount is stored
    assert dm.slots.get_slot("amount") == "1000"
    
    # Turn 2: Provide UPI (amount should still be there)
    response = dm.handle_nlu_output(
        "money_transfer",
        {"upi_id": "test@ybl"},
        0.95
    )
    
    # Should have both slots
    assert dm.slots.get_slot("amount") == "1000"
    assert dm.slots.get_slot("upi_id") == "test@ybl"
    
    # Response should include both
    assert "1000" in response or "test@ybl" in response


def test_conversation_reset_after_completion():
    """Test that conversation resets after successful completion."""
    dm = DialogueManager()
    
    # Complete a transaction
    dm.handle_nlu_output("money_transfer", {"amount": "500", "upi_id": "test@ybl"}, 0.95)
    
    # Verify reset
    assert dm.conversation_active == False
    assert dm.current_intent == None
    assert dm.slots.get_slot("amount") == None
    assert dm.slots.get_slot("upi_id") == None


if __name__ == "__main__":
    test_continuous_money_transfer()
    test_fallback_handling()
    test_intent_continuity()
    test_slot_persistence()
    test_conversation_reset_after_completion()
    print("All tests passed!")

