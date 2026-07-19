"""Optional local OCR adapter. It never sends pages to a network service."""

import argparse
import json
from pathlib import Path

import pytesseract
from pdf2image import convert_from_path
from pytesseract import Output


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--file", required=True)
    parser.add_argument("--page", required=True, type=int)
    parser.add_argument("--output", required=True)
    parser.add_argument("--language", default="chi_sim+chi_tra")
    args = parser.parse_args()

    image = convert_from_path(args.file, first_page=args.page, last_page=args.page, dpi=300)[0]
    data = pytesseract.image_to_data(image, lang=args.language, output_type=Output.DICT)
    words = []
    confidences = []
    for word, confidence in zip(data["text"], data["conf"]):
        word = word.strip()
        try:
            score = float(confidence)
        except (TypeError, ValueError):
            score = -1
        if word:
            words.append(word)
            if score >= 0:
                confidences.append(score)

    result = {
        "page": args.page,
        "text": " ".join(words),
        "confidence": round(sum(confidences) / len(confidences), 2) if confidences else 0,
        "extractionMethod": "ocr",
        "requiresHumanReview": True,
    }
    Path(args.output).write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
