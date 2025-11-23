"""
Manual conversation tester for your NLP + Dialogue Manager pipeline.

Place this file at:
tests/manual/test_conversation.py

Run:
(venv) > python tests/manual/test_conversation.py
"""

from src.nlu.entity_extractor import combined_nlu
from src.dialogue_manager.dialogue_manager import DialogueManager

# Initialize your dialogue manager
dm = DialogueManager()

print("=== Welcome to NLP Conversation Tester ===")
print("Type 'exit' to quit anytime.\n")

while True:
    user_input = input("User: ").strip()
    if user_input.lower() in ("exit", "quit"):
        print("Exiting conversation tester.")
        break

    # Get NLU output (intent + entities)
    nlu_result = combined_nlu(user_input)
    print("\n[NLU Output]")
    print("Intents:", nlu_result.get("intents", []))
    print("Entities:", nlu_result.get("entities", []))

    # Feed NLU output into dialogue manager to get response
    response = dm.handle_turn(user_input, nlu_result)
    print("\n[Dialogue Manager Response]")
    print(response)
    print("\n" + "="*50 + "\n")
