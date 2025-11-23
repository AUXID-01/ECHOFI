from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

MODEL_DIR = "models/intent_classifier"

tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_DIR)

def predict_intent(text: str):
    inputs = tokenizer(text, return_tensors="pt", truncation=True)
    with torch.no_grad():
        logits = model(**inputs).logits

    predicted_id = torch.argmax(logits, dim=1).item()
    return model.config.id2label[str(predicted_id)]

if __name__ == "__main__":
    while True:
        text = input("\nEnter text: ")
        if text.lower() == "exit":
            break

        print("Predicted Intent:", predict_intent(text))
