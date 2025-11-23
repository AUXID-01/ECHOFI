"""
Quick test script for common scenarios.
Run: python quick_test.py
"""
import sys
import io

# Ensure consistent UTF-8 output on Windows terminals
if hasattr(sys.stdout, "buffer"):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

from src.nlu.entity_extractor import combined_nlu
from src.dialogue_manager.dialogue_manager import DialogueManager

dm = DialogueManager()

print("=" * 60)
print("Quick Test - Common Scenarios")
print("=" * 60)

# Test 1: Normal flow
print("\n[1] Normal Money Transfer:")
print("User: I want to transfer money")
r1 = dm.handle_turn("I want to transfer money", combined_nlu("I want to transfer money"))
print(f"Assistant: {r1}")

print("\nUser: 500 rupees")
r2 = dm.handle_turn("500 rupees", combined_nlu("500 rupees"))
print(f"Assistant: {r2}")

print("\nUser: rahul@ybl")
r3 = dm.handle_turn("rahul@ybl", combined_nlu("rahul@ybl"))
print(f"Assistant: {r3}")

# Test 2: Fallback
print("\n\n[2] Fallback Test:")
dm.reset()
print("User: asdfghjkl")
r4 = dm.handle_turn("asdfghjkl", combined_nlu("asdfghjkl"))
print(f"Assistant: {r4}")

# Test 3: Complete in one turn
print("\n\n[3] Complete in One Turn:")
dm.reset()
print("User: Transfer 1000 rupees to priya@paytm")
r5 = dm.handle_turn("Transfer 1000 rupees to priya@paytm", combined_nlu("Transfer 1000 rupees to priya@paytm"))
print(f"Assistant: {r5}")

# Test 4: Balance inquiry
print("\n\n[4] Balance Inquiry:")
dm.reset()
print("User: What is my account balance?")
r6 = dm.handle_turn("What is my account balance?", combined_nlu("What is my account balance?"))
print(f"Assistant: {r6}")

print("\nUser: savings")
r7 = dm.handle_turn("savings", combined_nlu("savings"))
print(f"Assistant: {r7}")

print("\n" + "=" * 60)
print("Quick test complete!")
print("=" * 60)

