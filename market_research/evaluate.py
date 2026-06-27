"""Evaluate market_researcher on the Tatweer QA benchmark, judged by gpt-4.1-mini.

For each benchmark question we run our tool, then ask the judge to score the tool's
text_summary against the reference answer (1-5). Calls run in parallel with a tqdm bar.

Run from this folder:  python evaluate.py
"""

import csv
import json
import os
from concurrent.futures import ThreadPoolExecutor, as_completed

from dotenv import find_dotenv, load_dotenv
from openai import OpenAI
from tqdm import tqdm

from market_researcher import market_researcher

load_dotenv(find_dotenv())
client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

HERE = os.path.dirname(__file__)
BENCHMARK = os.path.join(HERE, "..", "benchmark", "tatweer_market_research_qa_benchmark.csv")
JUDGE_MODEL = "gpt-4.1-mini"
MAX_WORKERS = 8

JUDGE_PROMPT = """You grade a market-research assistant for UAE entrepreneurs.
Compare the ASSISTANT ANSWER to the REFERENCE ANSWER for the user's question.
Score 1-5: 5 = matches or beats the reference in correctness, usefulness and UAE-grounding;
1 = wrong or useless. Return ONLY JSON: {"score": <int 1-5>, "reason": "<one sentence>"}."""


def evaluate_one(row: dict) -> dict:
    question = row["user_question"]
    try:
        answer = market_researcher(question).get("text_summary", "")
    except Exception as exc:  # tool failed -> score 0
        return {"id": row["id"], "score": 0, "reason": f"tool error: {exc}"}

    user = (
        f"QUESTION:\n{question}\n\n"
        f"REFERENCE ANSWER:\n{row['strong_answer']}\n\n"
        f"ASSISTANT ANSWER:\n{answer}"
    )
    resp = client.chat.completions.create(
        model=JUDGE_MODEL,
        messages=[
            {"role": "system", "content": JUDGE_PROMPT},
            {"role": "user", "content": user},
        ],
        response_format={"type": "json_object"},
    )
    verdict = json.loads(resp.choices[0].message.content)
    return {"id": row["id"], "score": verdict.get("score", 0), "reason": verdict.get("reason", "")}


def main() -> None:
    with open(BENCHMARK, encoding="utf-8-sig") as f:  # utf-8-sig strips the BOM
        rows = list(csv.DictReader(f))

    results = []
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as ex:
        futures = [ex.submit(evaluate_one, r) for r in rows]
        for fut in tqdm(as_completed(futures), total=len(futures), desc="Evaluating"):
            results.append(fut.result())

    results.sort(key=lambda r: r["id"])
    avg = sum(r["score"] for r in results) / len(results)
    out = os.path.join(HERE, "eval_results.json")
    with open(out, "w", encoding="utf-8") as f:
        json.dump({"average_score": avg, "n": len(results), "results": results}, f, indent=2, ensure_ascii=False)

    print(f"\nAverage score: {avg:.2f}/5 over {len(results)} questions")
    print(f"Saved -> {out}")


if __name__ == "__main__":
    main()
