## Demo Checklist – NLP Brain (Nandani)

Use this single sheet during the presentation to show end-to-end coverage, Hinglish competence, and how Ayush/Utkarsh/Tuhin will hook in.

---

### 1. Commands to Run (in order)
```
# 1) Automated sanity (regex + dialogue)
python test_amount_fixes.py

# 2) Scripted conversations incl. fallbacks
python test_conversation_scenarios.py

# 3) Interactive CLI with debug
python -m src.main --debug
```

---

### 2. Live Demo Script (English + Hinglish)

| # | User Says | Expected Assistant Reply | Notes |
|---|-----------|--------------------------|-------|
| 1 | `I want to transfer money` | `How much do you want to transfer?` | kicks off slot filling |
| 2 | `500 rupees` | `To whom should I transfer? Please provide UPI ID.` | amount captured |
| 3 | `rahul@ybl` | `Transferring 500.0 to rahul@ybl.` | completes money_transfer |
| 4 | `How much money do I have in my account?` | `Which account? Savings or current?` | English balance inquiry |
| 5 | `current` | `Your current account balance is ₹82,500.` | slot completion |
| 6 | `Mera balance check karo` | `Which account? Savings or current?` | Hinglish intent detection (balance) |
| 7 | `savings ka` | `Your savings account balance is ₹82,500.` | Hinglish slot fill |
| 8 | `Move 350 rupees now.` | `To whom should I transfer? Please provide UPI ID.` | handles short imperative |
| 9 | `Actually, check my balance instead.` | `Which account? Savings or current?` | shows intent switch reset |
|10 | `Kitna paisa bacha hai account me?` | `Sorry, I didn't understand that. Could you rephrase?` | highlight current limitation + future multilingual plan |

Show rows 6 & 7 as evidence Hinglish is already supported; row 10 is a known gap you can mention as “next fine-tuning.”

---

### 3. Test Case Snippets (copy/paste during demo)

```
# Hinglish balance check
You: Mera balance check karo
Assistant: Which account? Savings or current?

You: savings ka
Assistant: Your savings account balance is ₹82,500.
```

```
# Multistep transfer
You: Move 350 rupees now.
Assistant: To whom should I transfer? Please provide UPI ID.
```

```
# Intent switch
You: I want to transfer money
Assistant: How much do you want to transfer?
You: Actually, check my balance instead
Assistant: Which account? Savings or current?
```

---

### 4. Folder Structure (what each part does)
```
NLP_Intent_Model/
├─ src/                      # Codebase
│  ├─ nlu/                   # Intent classifier + entity extractor
│  ├─ dialogue_manager/      # State tracker, slots, policies, fallbacks
│  ├─ integration/           # FastAPI wrapper (Ayush/Utkarsh consume)
│  ├─ security/              # OTP / voice-auth stubs for future
│  └─ language_support/      # Accent + multilingual helpers
├─ models/intent_classifier/ # DistilBERT weights & tokenizer
├─ data/                     # Training data (intents + entities + multilingual samples)
├─ tests/                    # Pytest suites for NLU + dialogue flows
├─ quick_test.py             # CLI smoke script
├─ test_amount_fixes.py      # Verifies ₹/Rs/5k extraction & DM logic
├─ docs/voice_stack_handover.md  # Instructions for Ayush (ASR ↔ NLP ↔ TTS)
└─ docs/demo_checklist.md        # (this file) live demo crib sheet
```

Add this file to your slideshow/Notion so you can speak to each directory’s role when reviewers ask about architecture.

