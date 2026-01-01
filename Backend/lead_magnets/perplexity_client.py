import os
import logging
import requests

logger = logging.getLogger(__name__)

PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY")
PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions"


class PerplexityClient:
    def __init__(self):
        if not PERPLEXITY_API_KEY:
            logger.error("❌ PERPLEXITY_API_KEY missing")
        else:
            logger.info("✅ PerplexityClient initialized; key present")

        self.headers = {
            "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
            "Content-Type": "application/json",
        }

    def generate_content(self, prompt: str) -> str:
        """
        Production-safe AI generation
        - Single request
        - NO retries
        - Lightweight model
        - Memory safe
        """

        if not PERPLEXITY_API_KEY:
            raise RuntimeError("PERPLEXITY_API_KEY is not configured")

        payload = {
            "model": "sonar",  # ✅ LIGHT MODEL (FREE-TIER SAFE)
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are a professional marketing assistant. "
                        "Generate structured, concise, high-quality lead magnet content."
                    ),
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            "temperature": 0.3,
            "max_tokens": 1200,  # ✅ HARD CAP TO PREVENT OOM
        }

        try:
            response = requests.post(
                PERPLEXITY_API_URL,
                headers=self.headers,
                json=payload,
                timeout=30,  # ✅ FAIL FAST
            )

            if response.status_code != 200:
                logger.error(
                    "❌ Perplexity API error %s: %s",
                    response.status_code,
                    response.text,
                )
                raise RuntimeError("AI generation failed")

            data = response.json()

            content = (
                data.get("choices", [{}])[0]
                .get("message", {})
                .get("content", "")
                .strip()
            )

            if not content:
                raise RuntimeError("Empty AI response")

            return content

        except requests.exceptions.Timeout:
            logger.error("❌ Perplexity API timeout")
            raise RuntimeError("AI request timed out")

        except Exception as e:
            logger.exception("❌ Perplexity generation error")
            raise RuntimeError("AI generation failed") from e
