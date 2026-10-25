"""Ekspor bobot Fake News Detector ke JSON untuk inferensi di browser (src/lib/fake-news/infer.ts).

Usage (Python 3.12, scikit-learn==1.8.0 sesuai requirements.txt repo sumber, nltk, pandas, numpy):
  python -I scripts/export-fake-news-model.py --repo <clone Fakenews-MLOps-Pipeline> --data <dir True.csv/Fake.csv> \
      --out public/models/fake-news/model.json --samples src/lib/fake-news/samples.ts --fixtures <dir uji kesetaraan> \
      --fake-positions 41,191

Data dan split mengikuti Jupyter/AOL_ML_FakeNews_Research.ipynb persis; model diambil dari pipeline_fake_news.pkl.
Skrip berhenti (exit 1) kalau data tidak cocok dengan output notebook atau akurasi di luar 98,58 ± 0,1.
"""
import argparse
import datetime
import hashlib
import json
import pickle
import re
import string
import subprocess
import sys
from pathlib import Path

import nltk
import numpy as np
import pandas as pd
import sklearn
from nltk.corpus import stopwords
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer

NOTEBOOK_ACCURACY = 98.58
STOP_WORDS_LIST = stopwords.words("english")
stop_words = set(STOP_WORDS_LIST)


# Salinan clean_text notebook sel 6 / app.py:21-30 (regex identik).
def clean_text(text):
    text = text.lower()
    text = re.sub(r"\[.*?\]", "", text)
    text = re.sub("[%s]" % re.escape(string.punctuation), "", text)
    text = re.sub(r"\w*\d\w*", "", text)
    text = " ".join([word for word in text.split() if word not in stop_words])
    return text


def check(name, got, want):
    ok = got == want
    print(f"  {'OK ' if ok else 'BEDA'} {name}: {got} (notebook {want})")
    return ok


def load_data(data_dir):
    df_true = pd.read_csv(data_dir / "True.csv")
    df_fake = pd.read_csv(data_dir / "Fake.csv")
    ok = check("baris True.csv", len(df_true), 21417)
    ok &= check("baris Fake.csv", len(df_fake), 23481)
    ok &= check("duplikat True", int(df_true.duplicated().sum()), 206)
    ok &= check("duplikat Fake", int(df_fake.duplicated().sum()), 3)
    df_true["label"] = 1
    df_fake["label"] = 0
    df = pd.concat([df_true, df_fake], axis=0).reset_index(drop=True)
    df.drop(["date", "subject"], axis=1, inplace=True, errors="ignore")
    df["full_text"] = df["title"] + " " + df["text"]
    df.drop_duplicates(inplace=True)
    ok &= check("baris setelah drop_duplicates", len(df), 39105)
    return df, ok


def top_terms(x_row, coef, terms, k=5):
    idx = x_row.indices
    contrib = x_row.data * coef[idx]
    # Urut |kontribusi| menurun, seri diputus indeks term menaik (sama dengan infer.ts).
    order = sorted(range(len(idx)), key=lambda i: (-abs(contrib[i]), idx[i]))[:k]
    return [{"term": terms[idx[i]], "contribution": float(contrib[i])} for i in order]


def sig(x):
    return float(f"{x:.6g}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", type=Path, required=True)
    ap.add_argument("--data", type=Path, required=True)
    ap.add_argument("--out", type=Path, required=True)
    ap.add_argument("--samples", type=Path, required=True)
    ap.add_argument("--fixtures", type=Path, required=True)
    ap.add_argument("--fake-positions", type=lambda s: [int(x) for x in s.split(",")], default=None,
                    help="posisi split uji untuk dua contoh fake (pilihan editorial), mis. 41,191")
    args = ap.parse_args()
    sys.stdout.reconfigure(encoding="utf-8")  # konsol Windows cp1252

    print(f"python {sys.version.split()[0]}, scikit-learn {sklearn.__version__}, nltk {nltk.__version__}, pandas {pd.__version__}, numpy {np.__version__}")
    print("1. Data")
    df, ok = load_data(args.data)
    df["clean_text"] = df["full_text"].apply(clean_text)
    X_train, X_test, y_train, y_test = train_test_split(df["clean_text"], df["label"], test_size=0.2, random_state=42)
    ok &= check("baris train", len(X_train), 31284)
    ok &= check("baris test", len(X_test), 7821)
    ok &= check("support test fake (0)", int((y_test == 0).sum()), 3564)
    ok &= check("support test real (1)", int((y_test == 1).sum()), 4257)
    if not ok:
        sys.exit("Data tidak cocok dengan output notebook; berhenti.")

    print("2. Pipeline .pkl")
    pkl_path = args.repo / "pipeline_fake_news.pkl"
    pkl_sha = hashlib.sha256(pkl_path.read_bytes()).hexdigest()
    with open(pkl_path, "rb") as f:
        pipe = pickle.load(f)
    commit = subprocess.run(["git", "-C", str(args.repo), "rev-parse", "HEAD"], capture_output=True, text=True).stdout.strip()
    acc = accuracy_score(y_test, pipe.predict(X_test)) * 100
    print(f"  sha256 {pkl_sha}, commit {commit}")
    print(f"  akurasi .pkl pada split uji: {acc:.4f}%")
    if abs(acc - NOTEBOOK_ACCURACY) > 0.1:
        sys.exit(f"Akurasi {acc:.4f}% di luar {NOTEBOOK_ACCURACY} ± 0,1; berhenti.")

    print("3. Latih ulang (cek konsistensi, tidak diekspor)")
    re_pipe = Pipeline([("tfidf", TfidfVectorizer(max_features=5000)), ("model", LogisticRegression())])
    re_pipe.fit(X_train, y_train)
    re_acc = accuracy_score(y_test, re_pipe.predict(X_test)) * 100
    tf, lr = pipe.named_steps["tfidf"], pipe.named_steps["model"]
    same_vocab = re_pipe.named_steps["tfidf"].vocabulary_ == tf.vocabulary_
    coef_diff = float(np.abs(re_pipe.named_steps["model"].coef_ - lr.coef_).max()) if same_vocab else None
    print(f"  akurasi latih ulang {re_acc:.4f}%, vocab sama {same_vocab}, max |Δcoef| {coef_diff}")

    print("4. Ekspor")
    vocab = tf.vocabulary_
    terms = sorted(vocab, key=vocab.get)
    assert list(range(len(terms))) == [vocab[t] for t in terms]
    coef = lr.coef_[0]
    model = {
        "meta": {
            "name": "Fake News Detector",
            "dataset": "ISOT Fake News Dataset (True.csv + Fake.csv), title + ' ' + text",
            "accuracy": round(acc, 2),
            "testSize": int(len(X_test)),
            "split": "drop_duplicates, train_test_split(test_size=0.2, random_state=42)",
            "pipeline": "TfidfVectorizer(max_features=5000) + LogisticRegression()",
            "labels": {"0": "fake", "1": "real"},
            "sourceRepo": "https://github.com/Jirosann/Fakenews-MLOps-Pipeline",
            "sourceCommit": commit,
            "sourcePickleSha256": pkl_sha,
            "sklearn": sklearn.__version__,
            "nltk": nltk.__version__,
            "exportedAt": datetime.date.today().isoformat(),
        },
        "stopwords": STOP_WORDS_LIST,
        "terms": terms,
        "idf": [sig(v) for v in tf.idf_],
        "coef": [sig(v) for v in coef],
        "intercept": sig(lr.intercept_[0]),
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(model, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"  {args.out}: {args.out.stat().st_size} B")

    # Akurasi ulang dari bobot yang sudah dibulatkan (numpy murni, tanpa sklearn.transform).
    Xc = tf.transform(X_test)
    raw = CountVectorizer(vocabulary=vocab, token_pattern=tf.token_pattern).transform(X_test)
    w = raw.multiply(np.array(model["idf"])).tocsr()
    norms = np.sqrt(np.asarray(w.multiply(w).sum(axis=1))).ravel()
    norms[norms == 0] = 1
    z = np.asarray(w @ np.array(model["coef"])).ravel() / norms + model["intercept"]
    p_json = 1 / (1 + np.exp(-z))
    p_pkl = pipe.predict_proba(X_test)[:, 1]
    acc_json = accuracy_score(y_test, (z > 0).astype(int)) * 100
    print(f"  akurasi dari JSON {acc_json:.4f}%, max |Δp| JSON vs .pkl {np.abs(p_json - p_pkl).max():.2e}")

    print("5. Fixture kesetaraan dan contoh")
    raw_test = df.loc[X_test.index, "full_text"]
    rng = np.random.RandomState(42)
    pick = rng.choice(len(X_test), 300, replace=False)
    parity = []
    for i in pick:
        parity.append({
            "text": raw_test.iloc[i],
            "label": int(y_test.iloc[i]),
            "pReal": float(p_pkl[i]),
            "top5": top_terms(Xc[i], coef, terms),
        })
    edge_texts = [
        "",
        "   \t\n ",
        "1234 5678 2016",
        "the and of to",
        "WASHINGTON (Reuters) - The Senate said on Tuesday it would vote.",
        "[Reuters photo\nacross lines] Senate said on Tuesday",
        "[editor note] BREAKING: Hillary via image VIDEO watch!!!",
        "“The president” — said ‘it’ don’t won’t didn’t",
        "Café naïve résumé São Paulo Zürich",
        "Ünïcödé ΣΊΣΥΦΟΣ İstanbul ǅemal straße",
        "covid19 h1n1 3d mp3 2nd 21st x86",
        "trump_tower foo_bar snake_case",
        "a b c d e f g",
        "Obama said Tuesday　Reuters\u0085senate\x1cvote",
        "zero​width﻿space said reuters",
        "東京 北京 said ١٢٣ reuters ٤abc",
        "Reuters " * 50,
        "GOP via @realDonaldTrump https://t.co/abc123 #MAGA pic.twitter.com/xyz",
    ]
    edge = []
    for t in edge_texts:
        xc = tf.transform([clean_text(t)])
        edge.append({"text": t, "clean": clean_text(t), "pReal": float(pipe.predict_proba([clean_text(t)])[0, 1]), "nnz": int(xc.nnz), "top5": top_terms(xc[0], coef, terms)})
    args.fixtures.mkdir(parents=True, exist_ok=True)
    (args.fixtures / "parity.json").write_text(json.dumps(parity, ensure_ascii=False), encoding="utf-8")
    (args.fixtures / "edge.json").write_text(json.dumps(edge, ensure_ascii=False), encoding="utf-8")
    print(f"  parity {len(parity)}, edge {len(edge)} -> {args.fixtures}")

    # Contoh UI: urutan split uji, 80-250 kata, dua pertama per label. Teks tidak diubah.
    # --fake-positions: pilihan editorial pemilik (bahasa lebih netral), tetap harus memenuhi aturan yang sama.
    def sample(pos):
        idx = X_test.index[pos]
        words = len(df.loc[idx, "full_text"].split())
        return {"label": "real" if y_test.iloc[pos] == 1 else "fake", "title": df.loc[idx, "title"].strip(), "text": df.loc[idx, "text"].strip(), "words": words, "testPosition": pos, "pReal": float(p_pkl[pos])}

    def in_rule(pos, label):
        return y_test.iloc[pos] == label and 80 <= len(df.loc[X_test.index[pos], "full_text"].split()) <= 250

    samples = []
    for label in (1, 0):
        if label == 0 and args.fake_positions:
            for pos in args.fake_positions:
                if not in_rule(pos, 0):
                    sys.exit(f"Posisi {pos} bukan artikel fake 80-250 kata di split uji; berhenti.")
                samples.append(sample(pos))
            continue
        samples += [sample(pos) for pos in range(len(X_test)) if in_rule(pos, label)][:2]
    for s in samples:
        print(f"  sampel {s['label']} pos {s['testPosition']} kata {s['words']} pReal {s['pReal']:.4f}: {s['title'][:70]}")
    body = json.dumps([{k: s[k] for k in ("label", "title", "text")} for s in samples], ensure_ascii=False, indent=2)
    rule = "dua pertama per label" if not args.fake_positions else f"real: dua pertama; fake: posisi {', '.join(map(str, args.fake_positions))} dipilih pemilik"
    args.samples.write_text(
        "// Dihasilkan oleh scripts/export-fake-news-model.py: dua artikel asli dan dua palsu dari split uji ISOT\n"
        f"// (urutan split, 80-250 kata, {rule}). Judul dan isi tidak diubah selain strip spasi tepi.\n"
        "export interface FakeNewsSample {\n  label: 'real' | 'fake';\n  title: string;\n  text: string;\n}\n\n"
        f"export const samples: FakeNewsSample[] = {body};\n",
        encoding="utf-8",
    )
    (args.fixtures / "samples-meta.json").write_text(json.dumps(samples, ensure_ascii=False, indent=1), encoding="utf-8")


if __name__ == "__main__":
    main()
