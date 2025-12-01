from typing import Dict, List


def _get_weakest_phoneme(phoneme_scores: List[Dict]) -> str:
    valid_scores = [
        phoneme
        for phoneme in phoneme_scores or []
        if isinstance(phoneme, dict)
        and isinstance(phoneme.get("score"), (int, float))
    ]

    if not valid_scores:
        return ""

    weakest = min(valid_scores, key=lambda item: item["score"])
    phoneme = weakest.get("ph") or "sound"

    return str(phoneme)


def generate_feedback(text: str, phoneme_scores: List[Dict]) -> str:
    """Return a concise coaching sentence highlighting the weakest phoneme."""

    weakest_phoneme = _get_weakest_phoneme(phoneme_scores)

    if not weakest_phoneme:
        return "Keep practicing each sound slowly and clearly."

    return (
        f"Focus on the '{weakest_phoneme}' sound—slow down and keep airflow steady."
    )
