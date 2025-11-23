"""
Quick test script to verify amount extraction fixes.
"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from src.nlu.entity_extractor import extract_amounts_regex, normalize_amount, combined_nlu
from src.dialogue_manager.dialogue_manager import DialogueManager

print("=" * 60)
print("Testing Amount Extraction Fixes")
print("=" * 60)

# Test cases from user's issues
test_cases = [
    "Transfer 5k to savings",
    "Send 5k to rahul@patym",
    "Transfer Rs5000 to friend@paytm",
    "Transfer \u20B95000 to friend@paytm",
    "I want to transfer 1000 to suresh@ybl UPI ID",
    "500",
    "1000",
    "500 rupees",
    "Rs5,000",
    "\u20B95000"
]

print("\n1. Testing Amount Extraction:")
print("-" * 60)
for text in test_cases:
    amounts = extract_amounts_regex(text)
    print(f"\nInput: '{text}'")
    if amounts:
        for amt in amounts:
            print(f"  Found: '{amt['value']}' -> normalized: '{amt['normalized']}'")
    else:
        print(f"  No amount found")

print("\n" + "=" * 60)
print("2. Testing Full NLU + Dialogue Manager:")
print("-" * 60)

dm = DialogueManager()

# Test problematic scenarios
scenarios = [
    ("Transfer 5k to savings", "Should extract 5000"),
    ("Send 5k to rahul@paytm", "Should extract 5000 and rahul@paytm"),
    ("Transfer ₹5000 to friend@paytm", "Should extract 5000 and friend@paytm"),
    ("I want to transfer 1000 to suresh@ybl UPI ID", "Should extract 1000 and suresh@ybl"),
    ("500", "Should extract 500"),
    ("I want to transfer money", "Should ask for amount"),
    ("500", "Should ask for UPI ID"),
    ("rahul@ybl", "Should complete transfer"),
]

print("\nScenario 1: Transfer 5k")
print("-" * 40)
dm.reset()
nlu1 = combined_nlu("Transfer 5k to savings")
print(f"Input: 'Transfer 5k to savings'")
print(f"Intent: {nlu1.get('intents', [])}")
print(f"Entities: {nlu1.get('entities', [])}")
response1 = dm.handle_turn("Transfer 5k to savings", nlu1)
print(f"Response: {response1}")

print("\nScenario 2: Send 5k to UPI")
print("-" * 40)
dm.reset()
nlu2 = combined_nlu("Send 5k to rahul@paytm")
print(f"Input: 'Send 5k to rahul@paytm'")
print(f"Intent: {nlu2.get('intents', [])}")
print(f"Entities: {nlu2.get('entities', [])}")
response2 = dm.handle_turn("Send 5k to rahul@paytm", nlu2)
print(f"Response: {response2}")

print("\nScenario 3: Transfer ₹5000")
print("-" * 40)
dm.reset()
nlu3 = combined_nlu("Transfer ₹5000 to friend@paytm")
print(f"Input: 'Transfer ₹5000 to friend@paytm'")
print(f"Intent: {nlu3.get('intents', [])}")
print(f"Entities: {nlu3.get('entities', [])}")
response3 = dm.handle_turn("Transfer ₹5000 to friend@paytm", nlu3)
print(f"Response: {response3}")

print("\n" + "=" * 60)
print("Test complete!")
print("=" * 60)

