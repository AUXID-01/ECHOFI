Entity extraction notes:

- Hybrid approach:
  - Regex (immediate, no training) for amount/date/upi/last4.
  - Token-classifier (optional) for complex entities like PERSON, ACCOUNT, IFSC, UPI aliases.
- To train token-classifier:
  - Prepare tokenized BIO data (see sample_entities_bio.json).
  - Use HuggingFace token-classification tutorial for subtokens -> labels alignment.
  - Example function train_token_classifier() provided as scaffold; use datasets.Dataset and aligned labels.
- For highly structured date/amount parsing consider adding Duckling or dateparser as a downstream normalizer.
- For production, tune amount regex for local numeric formats and currency symbols (₹, Rs, INR).
