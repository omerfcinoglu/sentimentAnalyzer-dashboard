from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
from transformers import AutoTokenizer
import tensorflow as tf

MODEL_PATH = "models/bertFineTuned_model"
TOKENIZER_PATH = "models/tokenizer"
MAX_LEN = 128
ID2LABEL = {0: "Positive", 1: "Notr", 2: "Negative"}

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

tokenizer = AutoTokenizer.from_pretrained(TOKENIZER_PATH)
saved_model = tf.saved_model.load(MODEL_PATH)
serving_fn = saved_model.signatures["serving_default"]


class PredictRequest(BaseModel):
    text: str


class PredictManyRequest(BaseModel):
    texts: list[str]


def encode_texts(texts):
    encodings = tokenizer(
        texts,
        padding="max_length",
        truncation=True,
        max_length=MAX_LEN,
        return_tensors="np",
    )
    input_ids = tf.convert_to_tensor(encodings["input_ids"], dtype=tf.int32)
    attention_mask = tf.convert_to_tensor(encodings["attention_mask"], dtype=tf.int32)
    return input_ids, attention_mask


@app.post("/predict")
def predict(req: PredictRequest):
    input_ids, attention_mask = encode_texts([req.text])

    outputs = serving_fn(
        attention_mask=attention_mask,
        input_ids=input_ids,
    )

    probs = outputs["dense_2"].numpy()[0]
    label_id = int(np.argmax(probs))

    return {
        "label_id": label_id,
        "label": ID2LABEL[label_id],
        "scores": {
            "Positive": float(probs[0]),
            "Notr": float(probs[1]),
            "Negative": float(probs[2]),
        },
    }


@app.post("/predict-batch")
def predict_batch(req: PredictManyRequest):
    input_ids, attention_mask = encode_texts(req.texts)

    outputs = serving_fn(
        attention_mask=attention_mask,
        input_ids=input_ids,
    )

    preds = outputs["dense_2"].numpy()
    results = []

    for i in range(len(req.texts)):
        probs = preds[i]
        label_id = int(np.argmax(probs))

        results.append(
            {
                "text": req.texts[i],
                "label_id": label_id,
                "label": ID2LABEL[label_id],
                "scores": {
                    "Positive": float(probs[0]),
                    "Notr": float(probs[1]),
                    "Negative": float(probs[2]),
                },
            }
        )

    return {"results": results}
