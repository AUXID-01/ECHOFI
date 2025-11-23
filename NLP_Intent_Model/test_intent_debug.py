"""
Quick debug script to test intent classification.
Run: python test_intent_debug.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from src.nlu.entity_extractor import combined_nlu, load_intent_model_if_available
from src.nlu.intent_classifier import predict_intent, load_trained_model

print("=" * 60)
print("Intent Classification Debug Test")
print("=" * 60)

# Test 1: Try loading model directly
print("\n1. Testing direct model load...")
try:
    model, tokenizer, label2id, id2label = load_trained_model("models/intent_classifier")
    print("[OK] Model loaded successfully!")
    print(f"   Model type: {type(model)}")
    print(f"   Number of labels: {len(id2label)}")
    print(f"   Labels: {list(id2label.values())[:5]}...")
except Exception as e:
    print(f"[ERROR] Failed to load model: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Test 2: Try prediction with direct model
print("\n2. Testing direct prediction...")
try:
    test_text = "I want to transfer money"
    result = predict_intent(
        test_text,
        model=model,
        tokenizer=tokenizer,
        id2label=id2label,
        top_k=3
    )
    print(f"[OK] Prediction successful for: '{test_text}'")
    print(f"   Results: {result}")
    for intent, conf in result:
        print(f"   - {intent}: {conf:.4f}")
except Exception as e:
    print(f"[ERROR] Prediction failed: {e}")
    import traceback
    traceback.print_exc()

# Test 3: Try cached model loader
print("\n3. Testing cached model loader...")
try:
    cached_model, cached_tokenizer, cached_id2label = load_intent_model_if_available()
    print("[OK] Cached model loaded successfully!")
except Exception as e:
    print(f"[ERROR] Failed to load cached model: {e}")
    import traceback
    traceback.print_exc()

# Test 4: Try combined_nlu
print("\n4. Testing combined_nlu...")
try:
    test_text = "I want to transfer money"
    result = combined_nlu(test_text)
    print(f"[OK] combined_nlu successful for: '{test_text}'")
    print(f"   Intents: {result.get('intents', [])}")
    print(f"   Entities: {result.get('entities', [])}")
    
    if not result.get('intents'):
        print("   [WARNING] No intents returned!")
    else:
        for intent_data in result['intents']:
            print(f"   - Intent: {intent_data.get('intent')}, Confidence: {intent_data.get('confidence', 0):.4f}")
except Exception as e:
    print(f"[ERROR] combined_nlu failed: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
print("Debug test complete!")
print("=" * 60)

