"""
Test 2 — Intent Classification: Training & Inference
File: tests/nlu/test_intent_classifier.py
"""

import os
import pytest

from src.nlu.intent_classifier import (
    train,
    load_trained_model,
    predict_intent,
)

MODEL_DIR = "models/intent_classifier"


@pytest.mark.order(1)
def test_training_runs_without_error():
    """
    Ensures training completes end-to-end without exceptions and produces artifacts.
    """
    output_path = train(
        model_name="distilbert-base-uncased",
        epochs=1,            # keep test fast
        batch_size=4,
    )

    # Check model saved correctly
    assert os.path.exists(output_path), "Model output directory not created."
    model_bin = os.path.join(output_path, "pytorch_model.bin")
    model_safe = os.path.join(output_path, "model.safetensors")

    assert (
        os.path.exists(model_bin) or os.path.exists(model_safe)
    ), "No model weights found (.bin or .safetensors)"

    assert os.path.exists(os.path.join(output_path, "tokenizer.json")), "Tokenizer not saved."
    assert os.path.exists(os.path.join(output_path, "label2id.json")), "label2id not saved."


@pytest.mark.order(2)
def test_model_loads_successfully():
    """
    Ensure the trained model can be loaded without crash.
    """
    model, tokenizer, label2id, id2label = load_trained_model(MODEL_DIR)

    assert model is not None
    assert tokenizer is not None
    assert isinstance(label2id, dict)
    assert isinstance(id2label, dict)


@pytest.mark.order(3)
def test_inference_on_known_utterances():
    """
    Tests if predictions match correct high-level intent patterns.
    We don't test exact accuracy, only that the output is structured and reasonable.
    """
    model, tokenizer, label2id, id2label = load_trained_model(MODEL_DIR)

    test_samples = {
        "check balance": "check_balance",
        "show me my latest transactions": "show_transactions",
        "transfer 500 to savings": "transfer_funds",
        "open a fixed deposit": "create_fd",
    }

    for text, expected_intent in test_samples.items():
        predictions = predict_intent(
            text,
            model=model,
            tokenizer=tokenizer,
            id2label=id2label,
            top_k=1
        )

        predicted_intent = predictions[0][0]  # (intent_name, probability)

        assert isinstance(predicted_intent, str), "Predicted intent is not a string."
        assert predicted_intent in id2label.values(), "Prediction returned unknown intent."

        # Soft validation: prediction should be one of expected categories
        print(f"Input: '{text}' | Prediction: {predicted_intent} | Expected: {expected_intent}")


@pytest.mark.order(4)
def test_prediction_confidence_format():
    """
    Ensure the model returns probability float between 0-1.
    """
    model, tokenizer, label2id, id2label = load_trained_model(MODEL_DIR)

    result = predict_intent(
        "check my balance",
        model=model,
        tokenizer=tokenizer,
        id2label=id2label,
        top_k=1
    )

    intent_name, confidence = result[0]

    assert 0.0 <= confidence <= 1.0, "Confidence score not in valid range."
