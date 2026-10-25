"""Ekspor judul untuk game 404 "Real or fake?" (src/lib/fake-news/game-titles.ts).

Usage (venv yang sama dengan export-fake-news-model.py):
  python -I scripts/export-fake-news-game.py --repo <clone Fakenews-MLOps-Pipeline> --data <dir True.csv/Fake.csv> \
      --out src/lib/fake-news/game-titles.ts --fixtures <dir uji kesetaraan> [--positions 3,17,...]

Data, split, dan clean_text diambil dari export-fake-news-model.py (split uji yang sama, 7.821 baris).
Pool dipilih TANPA melihat prediksi model: urutan split uji, judul 6-16 kata, judul unik, lima pertama per label.
--positions: pilihan editorial pemilik (mis. mengganti judul bernada menghasut), tetap harus memenuhi aturan yang sama.
Game hanya menampilkan judul, jadi model juga hanya diberi judul. Skrip mencetak akurasi model pada judul saja
di seluruh split uji sebagai konteks (model dilatih pada judul + isi).
"""
import argparse
import importlib.util
import json
import pickle
import sys
from pathlib import Path

from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split

sys.dont_write_bytecode = True  # tanpa scripts/__pycache__
spec = importlib.util.spec_from_file_location("export_model", Path(__file__).with_name("export-fake-news-model.py"))
em = importlib.util.module_from_spec(spec)
spec.loader.exec_module(em)

PER_LABEL = 5


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", type=Path, required=True)
    ap.add_argument("--data", type=Path, required=True)
    ap.add_argument("--out", type=Path, required=True)
    ap.add_argument("--fixtures", type=Path, required=True)
    ap.add_argument("--positions", type=lambda s: [int(x) for x in s.split(",")], default=None,
                    help="posisi split uji pilihan pemilik (5 real + 5 fake)")
    ap.add_argument("--candidates", type=int, default=15, help="jumlah kandidat per label yang dicetak untuk ditinjau")
    args = ap.parse_args()
    sys.stdout.reconfigure(encoding="utf-8")

    print("1. Data (sama dengan export-fake-news-model.py)")
    df, ok = em.load_data(args.data)
    df["clean_text"] = df["full_text"].apply(em.clean_text)
    X_train, X_test, y_train, y_test = train_test_split(df["clean_text"], df["label"], test_size=0.2, random_state=42)
    ok &= em.check("baris test", len(X_test), 7821)
    if not ok:
        sys.exit("Data tidak cocok dengan output notebook; berhenti.")

    print("2. Model")
    with open(args.repo / "pipeline_fake_news.pkl", "rb") as f:
        pipe = pickle.load(f)
    acc_full = accuracy_score(y_test, pipe.predict(X_test)) * 100
    print(f"  akurasi judul + isi (split uji): {acc_full:.4f}%")
    titles = df.loc[X_test.index, "title"].str.strip()
    clean_titles = titles.apply(em.clean_text)
    p_title = pipe.predict_proba(clean_titles)[:, 1]
    acc_title = accuracy_score(y_test, (p_title > 0.5).astype(int)) * 100
    print(f"  akurasi judul saja (split uji, n={len(titles)}): {acc_title:.4f}%")

    print("3. Pool")
    seen = set()

    def in_rule(pos):
        t = titles.iloc[pos]
        return 6 <= len(t.split()) <= 16 and t not in seen

    cand = {1: [], 0: []}
    for pos in range(len(X_test)):
        label = int(y_test.iloc[pos])
        if in_rule(pos):
            seen.add(titles.iloc[pos])
            cand[label].append(pos)
    for label in (1, 0):
        print(f"  kandidat {'real' if label else 'fake'} (urutan split):")
        for pos in cand[label][:args.candidates]:
            print(f"    pos {pos:5d}  pReal {p_title[pos]:.4f}  {titles.iloc[pos]}")

    if args.positions:
        allowed = set(cand[1]) | set(cand[0])
        bad = [p for p in args.positions if p not in allowed]
        if bad:
            sys.exit(f"Posisi {bad} tidak memenuhi aturan pool; berhenti.")
        pool = args.positions
        rule = f"posisi {', '.join(map(str, pool))} dipilih pemilik dari kandidat aturan yang sama"
    else:
        pool = cand[1][:PER_LABEL] + cand[0][:PER_LABEL]
        rule = f"{PER_LABEL} pertama per label"
    labels = [int(y_test.iloc[p]) for p in pool]
    if labels.count(1) != PER_LABEL or labels.count(0) != PER_LABEL:
        sys.exit(f"Pool harus {PER_LABEL} real + {PER_LABEL} fake; berhenti.")

    items = [{"label": "real" if y_test.iloc[p] == 1 else "fake", "title": titles.iloc[p]} for p in pool]
    meta = [{**it, "testPosition": p, "pReal": float(p_title[p])} for it, p in zip(items, pool)]
    right = sum((m["pReal"] > 0.5) == (m["label"] == "real") for m in meta)
    print(f"  pool: {len(pool)} judul, model benar {right}/{len(pool)} (judul saja)")
    for m in meta:
        print(f"    {m['label']:4s} pos {m['testPosition']:5d} pReal {m['pReal']:.4f}  {m['title']}")

    body = json.dumps(items, ensure_ascii=False, indent=2)
    args.out.write_text(
        "// Dihasilkan oleh scripts/export-fake-news-game.py: judul dari split uji ISOT untuk game 404\n"
        f"// (urutan split, 6-16 kata, judul unik, {rule}). Judul tidak diubah selain strip spasi tepi.\n"
        f"// Model hanya diberi judul (seperti pemain). Akurasi model pada judul saja di split uji: {acc_title:.2f}%.\n"
        "export interface GameTitle {\n  label: 'real' | 'fake';\n  title: string;\n}\n\n"
        f"export const titleAccuracy = {round(acc_title, 2)};\n"
        f"export const fullAccuracy = {round(acc_full, 2)};\n\n"
        f"export const gameTitles: GameTitle[] = {body};\n",
        encoding="utf-8",
    )
    args.fixtures.mkdir(parents=True, exist_ok=True)
    (args.fixtures / "game.json").write_text(json.dumps(meta, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"  {args.out}, {args.fixtures / 'game.json'}")


if __name__ == "__main__":
    main()
