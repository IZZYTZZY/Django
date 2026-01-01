import os
from pathlib import Path
import json
import requests
import re
from typing import Dict, Any, Optional, List
from datetime import datetime

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None


class PerplexityClient:
    """
    Lightweight Perplexity client optimized for low-memory environments (Render free tier).
    No retries. Single model. Fail fast.
    """

    def __init__(self):
        if load_dotenv:
            env_path = Path(__file__).resolve().parents[1] / ".env"
            try:
                load_dotenv(env_path)
            except Exception:
                pass

        self.api_key = os.getenv("PERPLEXITY_API_KEY")
        self.base_url = "https://api.perplexity.ai/chat/completions"

        print(f"PerplexityClient initialized; key present: {bool(self.api_key)}")

        if not self.api_key:
            raise RuntimeError("PERPLEXITY_API_KEY is missing")

    def generate_lead_magnet_json(
        self,
        user_answers: Dict[str, Any],
        firm_profile: Dict[str, Any],
    ) -> Dict[str, Any]:

        payload = {
            "model": "sonar",   # ✅ single lightweight model
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are a professional content strategist. "
                        "Return VALID JSON ONLY. No markdown. No commentary."
                    ),
                },
                {
                    "role": "user",
                    "content": self._create_content_prompt(
                        user_answers, firm_profile
                    ),
                },
            ],
            "max_tokens": 3000,   # reduced
            "temperature": 0.7,
        }

        try:
            response = requests.post(
                self.base_url,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                json=payload,
                timeout=12,   # ⛔ shorter timeout
            )
        except requests.exceptions.Timeout:
            raise RuntimeError("Perplexity API timeout")
        except requests.exceptions.RequestException as e:
            raise RuntimeError(f"Perplexity API request failed: {e}")

        if response.status_code != 200:
            raise RuntimeError(
                f"Perplexity API error {response.status_code}: {response.text}"
            )

        raw_content = (
            response.json()
            .get("choices", [{}])[0]
            .get("message", {})
            .get("content", "")
        )

        json_text = self._extract_json_from_markdown(raw_content)

        try:
            return json.loads(json_text)
        except json.JSONDecodeError:
            raise RuntimeError("Invalid JSON returned from Perplexity")

    def _extract_json_from_markdown(self, content: str) -> str:
        content = content.strip()

        if content.startswith("```"):
            lines = content.splitlines()
            start = next(
                (i for i, l in enumerate(lines) if l.strip().startswith("```")),
                0,
            ) + 1
            end = next(
                (
                    i
                    for i in range(len(lines) - 1, -1, -1)
                    if lines[i].strip().startswith("```")
                ),
                len(lines),
            )
            return "\n".join(lines[start:end])

        return content

    def _create_content_prompt(
        self,
        user_answers: Dict[str, Any],
        firm_profile: Dict[str, Any],
    ) -> str:

        prompt = {
            "firm_profile": firm_profile,
            "user_answers": user_answers,
            "rules": {
                "format": "JSON only",
                "tone": "professional",
                "length": "concise but complete",
                "no_placeholders": True,
            },
        }

        return json.dumps(prompt, ensure_ascii=False)
