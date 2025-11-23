"""
Quick script to retrain the intent classifier with updated data.
Run: python retrain_model.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from src.nlu.intent_classifier import train

print("=" * 60)
print("Retraining Intent Classifier")
print("=" * 60)
print("\nThis will retrain the model with updated training data.")
print("This may take a few minutes...\n")

try:
    output_dir = train(
        model_name="distilbert-base-uncased",
        epochs=5,  # More epochs for better accuracy
        batch_size=8,
        learning_rate=2e-5
    )
    print(f"\n[SUCCESS] Model retrained and saved to: {output_dir}")
    print("\nYou can now test the model with: python -m src.main")
except Exception as e:
    print(f"\n[ERROR] Training failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

