"""Tiny terminal agent (gpt-4.1) that can call the market_researcher tool.

Run:  python chat.py
Then ask things like: "Is a specialty coffee shop in Dubai Marina a good idea?"
Type 'quit' to exit.
"""

import json
import os

from dotenv import find_dotenv, load_dotenv
from openai import OpenAI

from market_researcher import market_researcher

load_dotenv(find_dotenv())
client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

TOOLS = [{
    "type": "function",
    "function": {
        "name": "market_researcher",
        "description": (
            "UAE-only, web-search-grounded market research for a business idea. "
            "Returns feasibility, graphs_data, data_citation, target_audience and best_strategy."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "description": {"type": "string", "description": "The business/product idea to research."}
            },
            "required": ["description"],
        },
    },
}]

messages = [{
    "role": "system",
    "content": (
        "You help UAE entrepreneurs. When the user asks about whether an idea is viable, "
        "its market, audience, or strategy, call market_researcher, then explain the result "
        "clearly and concisely in plain text for a terminal."
    ),
}]


def save_result(result: dict) -> str:
    """Dump a market_researcher result to results/research_<N>.json and return the path."""
    out_dir = "results"
    os.makedirs(out_dir, exist_ok=True)
    n = len([f for f in os.listdir(out_dir) if f.endswith(".json")]) + 1
    path = os.path.join(out_dir, f"research_{n}.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    return path


def main() -> None:
    print("Market Researcher agent (gpt-4.1). Ask a question — type 'quit' to exit.")
    while True:
        user = input("\nyou> ").strip()
        if user.lower() in {"quit", "exit"}:
            break
        if not user:
            continue
        messages.append({"role": "user", "content": user})

        while True:
            resp = client.chat.completions.create(model="gpt-4.1", messages=messages, tools=TOOLS)
            msg = resp.choices[0].message
            messages.append(msg)

            if not msg.tool_calls:
                print(f"\nagent> {msg.content}")
                break

            for tc in msg.tool_calls:
                args = json.loads(tc.function.arguments)
                print(f"  [running market_researcher: {args.get('description', '')[:60]}...]")
                try:
                    result = market_researcher(**args)
                    content = json.dumps(result, ensure_ascii=False)
                    path = save_result(result)
                    print(f"  [saved raw result -> {path}]")
                except Exception as exc:  # surface tool errors back to the model
                    content = json.dumps({"error": str(exc)})
                messages.append({"role": "tool", "tool_call_id": tc.id, "content": content})


if __name__ == "__main__":
    main()
