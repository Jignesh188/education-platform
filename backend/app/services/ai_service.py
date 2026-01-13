import httpx
import base64
import json
from typing import Optional, List, Dict, Any
try:
    import wikipedia
except ImportError:
    wikipedia = None

from app.config import settings
from app.utils.logger import logger, log_ai_operation


class AIService:
    """Service for interacting with Qwen-VL via Ollama."""
    
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL.rstrip("/")
        self.model = settings.OLLAMA_MODEL
    
    async def _make_request(self, prompt: str, images: List[str] = None) -> str:
        """Make a request to Ollama API."""
        url = f"{self.base_url}/api/generate"
        
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.7,
                "top_p": 0.9
            }
        }
        
        if images:
            payload["images"] = images
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            try:
                response = await client.post(url, json=payload)
                response.raise_for_status()
                result = response.json()
                return result.get("response", "")
            except Exception as e:
                logger.error(f"AI Service Error: {e}", exc_info=True)
                raise
    
    async def _make_chat_request(self, messages: List[Dict], images: List[str] = None) -> str:
        """Make a chat request to Ollama API."""
        url = f"{self.base_url}/api/chat"
        
        payload = {
            "model": self.model,
            "messages": messages,
            "stream": False,
            "options": {
                "temperature": 0.7,
                "top_p": 0.9
            }
        }
        
        if images and messages:
            messages[-1]["images"] = images
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            try:
                response = await client.post(url, json=payload)
                response.raise_for_status()
                result = response.json()
                return result.get("message", {}).get("content", "")
            except Exception as e:
                logger.error(f"AI Chat Service Error: {e}", exc_info=True)
                raise
    
    def _encode_image(self, image_path: str) -> str:
        """Encode image to base64."""
        with open(image_path, "rb") as f:
            return base64.b64encode(f.read()).decode("utf-8")
    
    async def extract_text_from_image(self, image_path: str) -> str:
        """Extract text from image using vision model."""
        image_base64 = self._encode_image(image_path)
        
        prompt = """Please extract and transcribe all the text content from this image. 
        Include all visible text, maintaining the original structure as much as possible.
        If there are diagrams or figures, describe them briefly.
        Return only the extracted text content."""
        
        log_ai_operation("Text Extraction", f"Processing {image_path}")
        return await self._make_request(prompt, images=[image_base64])
    
    async def generate_summary(self, text: str, title: str = "") -> str:
        """
        Generate a concise, clean text summary of the document.
        Handles potentially large text by chunking if necessary (though simplified here for context).
        Enforces strict plain text output (no markdown).
        """
        # Chunking strategy: If text is too long (> 12000 chars), take the first, middle, and last chunks
        # to ensure the model doesn't choke, while still getting a good overview.
        # Ideally, we would summarize chunks and combine, but for speed, representative sampling works well.
        if len(text) > 20000:
            chunk_size = 6000
            start = text[:chunk_size]
            middle_idx = len(text) // 2
            middle = text[middle_idx - 2000 : middle_idx + 2000]
            end = text[-chunk_size:]
            processed_text = f"{start}\n...\n{middle}\n...\n{end}"
        else:
            processed_text = text

        prompt = f"""You are an educational content summarizer. Create a clear, concise summary of the following document content.

Document Title: {title}

Content:
{processed_text}

Instructions:
1. Identify the main topics and key points.
2. Create a well-structured summary.
3. CRITICAL: Return output as PLAIN TEXT ONLY. Do NOT use markdown, asterisks (**), bolding, bullet points (* or -), or hash symbols (#).
4. Use standard paragraphs and numbering (1. 2. 3.) only if absolutely necessary for list items.
5. Keep it concise but comprehensive.
6. Use simple, clear language.

Provide the plain text summary now:"""
        
        log_ai_operation("Generate Summary", title)
        return await self._make_request(prompt)
    
    async def generate_easy_explanation(self, text: str, title: str = "") -> str:
        """Generate an easy-to-understand explanation."""
        prompt = f"""You are a friendly teacher explaining complex topics to students. 
Take the following content and explain it in very simple terms that anyone can understand.

Document Title: {title}

Content:
{text[:8000]}

Instructions:
1. Use everyday language and simple words
2. Include helpful analogies and examples
3. Break down complex concepts step by step
4. Make it engaging and easy to follow
5. Use a conversational, friendly tone

Provide the easy explanation now:"""
        
        log_ai_operation("Generate Explanation", title)
        return await self._make_request(prompt)
    
    async def extract_key_concepts(self, text: str) -> List[str]:
        """Extract key concepts from the document."""
        prompt = f"""Analyze the following educational content and identify the key concepts, terms, and topics.

Content:
{text[:6000]}

Return a JSON array of key concepts. Example format:
["concept1", "concept2", "concept3"]

Return ONLY the JSON array, nothing else:"""
        
        log_ai_operation("Extract Concepts")
        response = await self._make_request(prompt)
        
        try:
            # Parse JSON response
            concepts = json.loads(response.strip())
            if isinstance(concepts, list):
                return concepts[:20]  # Limit to 20 concepts
        except json.JSONDecodeError:
            # Try to extract concepts from text
            lines = response.strip().split("\n")
            concepts = [line.strip("- •*").strip() for line in lines if line.strip()]
            return concepts[:20]
        
        return []
    
    async def generate_quiz_questions(
        self, 
        text: str, 
        difficulty: str, 
        count: int,
        title: str = ""
    ) -> List[Dict[str, Any]]:
        """Generate MCQ quiz questions based on difficulty."""
        
        difficulty_instructions = {
            "easy": "Focus on basic recall and simple understanding. Questions should test direct facts from the content.",
            "medium": "Include questions that require understanding relationships between concepts. Mix recall with comprehension questions.",
            "hard": "Create challenging questions that require analysis, application, and critical thinking. Include questions that combine multiple concepts."
        }
        
        prompt = f"""You are an expert quiz creator for educational content. Generate {count} multiple-choice questions based on the following content.

Document Title: {title}
Difficulty Level: {difficulty.upper()}
{difficulty_instructions.get(difficulty, difficulty_instructions["medium"])}

Content:
{text[:6000]}

Generate exactly {count} questions in the following JSON format:
[
  {{
    "question_text": "The question here?",
    "options": [
      {{"option_id": "A", "option_text": "First option"}},
      {{"option_id": "B", "option_text": "Second option"}},
      {{"option_id": "C", "option_text": "Third option"}},
      {{"option_id": "D", "option_text": "Fourth option"}}
    ],
    "correct_answer": "A",
    "explanation": "Brief explanation of why this is correct"
  }}
]

Important:
- Each question must have exactly 4 options (A, B, C, D)
- Provide clear, educational explanations
- Ensure questions are relevant to the content
- Make wrong answers plausible but clearly incorrect

Return ONLY the JSON array:"""
        
        log_ai_operation("Generate Quiz", f"{title} ({difficulty})")
        response = await self._make_request(prompt)
        
        try:
            # Try to parse JSON
            questions = json.loads(response.strip())
            if isinstance(questions, list):
                return questions[:count]
        except json.JSONDecodeError:
            # Try to find JSON in response
            import re
            json_match = re.search(r'\[[\s\S]*\]', response)
            if json_match:
                try:
                    questions = json.loads(json_match.group())
                    return questions[:count]
                except:
                    pass
        
        return []
    
    async def analyze_weak_topics(
        self, 
        wrong_answers: List[Dict], 
        document_summary: str
    ) -> List[str]:
        """Analyze wrong answers to identify weak topics."""
        
        wrong_details = "\n".join([
            f"- Q: {ans.get('question_text', 'Unknown')} | Selected: {ans.get('selected_answer', '?')} | Correct: {ans.get('correct_answer', '?')}"
            for ans in wrong_answers
        ])
        
        prompt = f"""Analyze the following incorrect quiz answers and identify the topics where the student needs improvement.

Document Summary:
{document_summary[:1000]}

Incorrect Answers:
{wrong_details}

Based on these wrong answers, identify 3-5 specific topics or concepts the student should review.
Return a JSON array of topic names. Example: ["Topic 1", "Topic 2", "Topic 3"]

Return ONLY the JSON array:"""
        
        log_ai_operation("Analyze Weak Topics")
        response = await self._make_request(prompt)
        
        try:
            topics = json.loads(response.strip())
            if isinstance(topics, list):
                return topics[:5]
        except json.JSONDecodeError:
            pass
        
        return ["General review recommended"]
    
    async def generate_page_insights(self, page_text: str, page_number: int) -> Dict[str, Any]:
        """Generate insights for a specific page."""
        prompt = f"""Analyze the following content from page {page_number} of a document.

Content:
{page_text[:4000]}

Instructions:
1. Summarize the main point of this page in 1-2 sentences (clean text).
2. Extract up to 3 key points (clean text).
3. Identify the single most important 'focus topic' of this page.

Return ONLY a JSON object in this format:
{{
  "content": "Summary sentence here.",
  "key_points": ["Point 1", "Point 2", "Point 3"],
  "focus_topic": "Main Topic"
}}"""
        
        log_ai_operation("Page Insights", f"Page {page_number}")
        response = await self._make_request(prompt)
        
        try:
            import re
            json_match = re.search(r'\{[\s\S]*\}', response)
            if json_match:
                return json.loads(json_match.group())
        except:
            pass
            
        return {
            "content": "Content analysis failed.",
            "key_points": [],
            "focus_topic": None
        }

    async def enrich_context_with_wiki(self, terms: List[str]) -> List[Dict[str, str]]:
        """Fetch Wikipedia definitions for terms."""
        results = []
        if not wikipedia or not terms:
            return results
            
        for term in terms[:5]: # XMLLimit to top 5 terms to avoid slowness
            try:
                # Basic search to get closest match
                search_res = wikipedia.search(term, results=1)
                if not search_res:
                    continue
                    
                page = wikipedia.page(search_res[0], auto_suggest=False)
                results.append({
                    "term": term,
                    "definition": page.summary[:300] + "...",
                    "url": page.url
                })
            except Exception as e:
                logger.warning(f"Wiki error for {term}: {e}")
                continue
                
        return results


# Singleton instance
ai_service = AIService()
