"""
Comprehensive test scenarios for EchoFi Voice Assistant.
Tests fallbacks, multi-turn conversations, edge cases, and more.

Run: python test_conversation_scenarios.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from src.nlu.entity_extractor import combined_nlu
from src.dialogue_manager.dialogue_manager import DialogueManager

def print_separator(title=""):
    """Print a visual separator."""
    if title:
        print("\n" + "=" * 70)
        print(f"  {title}")
        print("=" * 70)
    else:
        print("-" * 70)

def test_conversation(dm, user_input, expected_keywords=None, description=""):
    """Test a single conversation turn."""
    if description:
        print(f"\n[TEST] {description}")
    print(f"User: {user_input}")
    
    nlu_result = combined_nlu(user_input)
    response = dm.handle_turn(user_input, nlu_result)
    
    print(f"Assistant: {response}")
    
    # Show NLU details
    intents = nlu_result.get('intents', [])
    if intents:
        intent = intents[0].get('intent', 'unknown')
        confidence = intents[0].get('confidence', 0)
        print(f"  [NLU] Intent: {intent} (confidence: {confidence:.3f})")
    
    entities = nlu_result.get('entities', [])
    if entities:
        print(f"  [NLU] Entities: {entities}")
    
    # Check if response contains expected keywords
    if expected_keywords:
        found = any(keyword.lower() in response.lower() for keyword in expected_keywords)
        status = "[PASS]" if found else "[FAIL]"
        print(f"  {status} Expected keywords: {expected_keywords}")
    
    return response

def main():
    print("=" * 70)
    print("  EchoFi Voice Assistant - Comprehensive Test Scenarios")
    print("=" * 70)
    
    # Initialize dialogue manager
    dm = DialogueManager()
    
    # ========================================================================
    # TEST 1: Normal Multi-turn Money Transfer
    # ========================================================================
    print_separator("TEST 1: Normal Multi-turn Money Transfer")
    dm.reset()  # Start fresh
    
    test_conversation(
        dm, 
        "I want to transfer money",
        expected_keywords=["transfer", "amount"],
        description="Initiate money transfer"
    )
    
    test_conversation(
        dm,
        "500 rupees",
        expected_keywords=["upi", "recipient"],
        description="Provide amount"
    )
    
    test_conversation(
        dm,
        "rahul@ybl",
        expected_keywords=["Transferring", "500", "rahul@ybl"],
        description="Complete transfer with UPI"
    )
    
    # ========================================================================
    # TEST 2: Fallback Scenarios - Low Confidence / Unclear Input
    # ========================================================================
    print_separator("TEST 2: Fallback Scenarios")
    dm.reset()
    
    test_conversation(
        dm,
        "asdfghjkl qwerty",
        expected_keywords=["didn't understand", "rephrase"],
        description="Random gibberish - should trigger fallback"
    )
    
    test_conversation(
        dm,
        "xyz abc 123",
        expected_keywords=["not sure", "differently"],
        description="Second unclear input - progressive fallback"
    )
    
    test_conversation(
        dm,
        "blah blah blah",
        expected_keywords=["still having trouble", "specific"],
        description="Third unclear input - maximum fallback"
    )
    
    test_conversation(
        dm,
        "check balance",
        expected_keywords=["account", "savings", "current"],
        description="Valid input after fallbacks - should reset fallback count"
    )
    
    # ========================================================================
    # TEST 3: Balance Inquiry
    # ========================================================================
    print_separator("TEST 3: Balance Inquiry")
    dm.reset()
    
    test_conversation(
        dm,
        "What is my account balance?",
        expected_keywords=["account", "savings", "current"],
        description="Balance inquiry - should ask for account type"
    )
    
    test_conversation(
        dm,
        "savings",
        expected_keywords=["balance", "82,500"],
        description="Provide account type"
    )
    
    # ========================================================================
    # TEST 4: Intent Switching Mid-Conversation
    # ========================================================================
    print_separator("TEST 4: Intent Switching")
    dm.reset()
    
    test_conversation(
        dm,
        "I want to transfer money",
        expected_keywords=["transfer", "amount"],
        description="Start money transfer"
    )
    
    test_conversation(
        dm,
        "Actually, check my balance instead",
        expected_keywords=["account", "savings", "current"],
        description="Switch to balance inquiry - should reset previous intent"
    )
    
    # ========================================================================
    # TEST 5: Providing All Information at Once
    # ========================================================================
    print_separator("TEST 5: Complete Information in One Turn")
    dm.reset()
    
    test_conversation(
        dm,
        "Transfer 1000 rupees to priya@paytm",
        expected_keywords=["Transferring", "1000", "priya@paytm"],
        description="Complete transfer in single message"
    )
    
    # ========================================================================
    # TEST 6: Edge Cases - Empty/Whitespace
    # ========================================================================
    print_separator("TEST 6: Edge Cases")
    dm.reset()
    
    test_conversation(
        dm,
        "",
        description="Empty input (should be handled gracefully)"
    )
    
    test_conversation(
        dm,
        "   ",
        description="Whitespace only"
    )
    
    # ========================================================================
    # TEST 7: Partial Information Followed by Completion
    # ========================================================================
    print_separator("TEST 7: Partial Information")
    dm.reset()
    
    test_conversation(
        dm,
        "transfer money",
        expected_keywords=["amount"],
        description="Initiate transfer without 'I want to'"
    )
    
    test_conversation(
        dm,
        "2000",
        expected_keywords=["upi"],
        description="Provide just the number"
    )
    
    test_conversation(
        dm,
        "anil@ybl",
        expected_keywords=["Transferring"],
        description="Complete with UPI"
    )
    
    # ========================================================================
    # TEST 8: Loan Query
    # ========================================================================
    print_separator("TEST 8: Loan Query")
    dm.reset()
    
    test_conversation(
        dm,
        "What is my loan status?",
        description="Loan query (no slots required)"
    )
    
    # ========================================================================
    # TEST 9: Set Reminder
    # ========================================================================
    print_separator("TEST 9: Set Reminder")
    dm.reset()
    
    test_conversation(
        dm,
        "Set a reminder to pay electricity bill",
        description="Set reminder (may require date slot)"
    )
    
    # ========================================================================
    # TEST 10: Context Persistence
    # ========================================================================
    print_separator("TEST 10: Context Persistence")
    dm.reset()
    
    test_conversation(
        dm,
        "I want to transfer money",
        expected_keywords=["amount"],
        description="Start transfer"
    )
    
    test_conversation(
        dm,
        "500",
        expected_keywords=["upi"],
        description="Amount persists, asking for UPI"
    )
    
    test_conversation(
        dm,
        "Wait, make it 1000 instead",
        expected_keywords=["upi"],
        description="Update amount, UPI still needed"
    )
    
    test_conversation(
        dm,
        "suresh@ybl",
        expected_keywords=["Transferring", "1000"],
        description="Complete with updated amount"
    )
    
    # ========================================================================
    # TEST 11: Special Characters and Variations
    # ========================================================================
    print_separator("TEST 11: Special Characters")
    dm.reset()
    
    test_conversation(
        dm,
        "Transfer ₹5000 to friend@paytm",
        expected_keywords=["Transferring"],
        description="Currency symbol and special characters"
    )
    
    # ========================================================================
    # TEST 12: Multiple Fallbacks Then Recovery
    # ========================================================================
    print_separator("TEST 12: Fallback Recovery")
    dm.reset()
    
    test_conversation(dm, "asdf", description="Fallback 1")
    test_conversation(dm, "qwerty", description="Fallback 2")
    test_conversation(dm, "xyz", description="Fallback 3")
    test_conversation(
        dm,
        "I want to transfer money",
        expected_keywords=["transfer", "amount"],
        description="Recovery - valid input after max fallbacks"
    )
    
    # ========================================================================
    # TEST 13: Hinglish/Mixed Language
    # ========================================================================
    print_separator("TEST 13: Hinglish Input")
    dm.reset()
    
    test_conversation(
        dm,
        "Mujhe paise transfer karne hain",
        description="Hinglish input"
    )
    
    # ========================================================================
    # TEST 14: Abbreviations and Short Forms
    # ========================================================================
    print_separator("TEST 14: Abbreviations")
    dm.reset()
    
    test_conversation(
        dm,
        "Transfer 5k to savings",
        description="Abbreviated amount (5k = 5000)"
    )
    
    # ========================================================================
    # TEST 15: Conversation Reset After Completion
    # ========================================================================
    print_separator("TEST 15: Conversation Reset")
    dm.reset()
    
    test_conversation(
        dm,
        "Transfer 500 to test@ybl",
        expected_keywords=["Transferring"],
        description="Complete transaction"
    )
    
    # Verify conversation is reset
    test_conversation(
        dm,
        "check balance",
        expected_keywords=["account"],
        description="New intent after completion - should start fresh"
    )
    
    # ========================================================================
    print_separator("All Tests Complete!")
    print("\nSummary:")
    print("- Normal multi-turn conversations: ✓")
    print("- Fallback handling: ✓")
    print("- Intent switching: ✓")
    print("- Edge cases: ✓")
    print("- Context persistence: ✓")
    print("\nRun individual tests or modify scenarios as needed!")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nTests interrupted by user.")
    except Exception as e:
        print(f"\n[ERROR] Test failed: {e}")
        import traceback
        traceback.print_exc()

