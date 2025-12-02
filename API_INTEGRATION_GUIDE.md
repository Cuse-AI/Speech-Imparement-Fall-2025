# API Integration Guide

This document explains how to integrate and switch between pronunciation assessment services.

## Current Architecture

The application uses a **pluggable pronunciation assessment layer** that allows you to switch between different services without changing the main application code.

### Supported Services

1. **Azure Pronunciation Assessment** (Currently Active)
   - Production-ready
   - Highly accurate phoneme-level scoring
   - Used by default

2. **Language Confidence API** (Ready to Integrate)
   - Placeholder implementation in place
   - Will be fully implemented once credentials are available
   - Same API contract as Azure

## How to Switch Services

### 1. Set Environment Variable

In your `.env` file or deployment configuration:

```bash
# Use Azure (default)
PRONUNCIATION_SERVICE=azure

# Use Language Confidence
PRONUNCIATION_SERVICE=language_confidence
```

The app will log which service is active on startup:
```
Configured pronunciation service: language_confidence
```

### 2. No Code Changes Required

All endpoints (`/api/placement` and `/api/exercise/evaluate`) automatically use the configured service. No other changes needed.

## Integrating Language Confidence API

When you have Language Confidence API credentials, follow these steps:

### Step 1: Get Credentials
- Obtain your Language Confidence API key and endpoint
- Add to `.env`:
  ```
  LANGUAGE_CONFIDENCE_KEY=your_key_here
  LANGUAGE_CONFIDENCE_ENDPOINT=https://api.languageconfidence.com
  ```

### Step 2: Update the Service Implementation

In `backend/services/azure_pronunciation.py`, replace the `LanguageConfidenceAssessor.assess()` method:

```python
class LanguageConfidenceAssessor(PronunciationAssessor):
    """Language Confidence API integration."""
    
    def assess(self, text: str, audio_bytes: bytes) -> Dict:
        """Call Language Confidence API for pronunciation assessment."""
        
        api_key = os.getenv("LANGUAGE_CONFIDENCE_KEY")
        endpoint = os.getenv("LANGUAGE_CONFIDENCE_ENDPOINT")
        
        if not api_key or not endpoint:
            raise HTTPException(
                status_code=500,
                detail="Language Confidence credentials not configured"
            )
        
        # Make HTTP request to Language Confidence API
        # (Implementation depends on Language Confidence's exact API contract)
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "audio/wav"
        }
        
        params = {
            "text": text,
            "language": "en-US"
        }
        
        try:
            response = httpx.post(
                f"{endpoint}/assess",
                content=audio_bytes,
                headers=headers,
                params=params,
                timeout=30,
            )
            response.raise_for_status()
            api_response = response.json()
            
            # Normalize Language Confidence response to our standard format
            return {
                "overallScore": api_response.get("overallScore", 0),
                "phonemes": api_response.get("phonemes", []),
                "words": api_response.get("words", []),
            }
            
        except httpx.HTTPStatusError as exc:
            raise HTTPException(
                status_code=exc.response.status_code,
                detail=f"Language Confidence assessment failed: {exc.response.text}"
            ) from exc
        except httpx.HTTPError as exc:
            raise HTTPException(
                status_code=502,
                detail="Language Confidence service unavailable"
            ) from exc
```

### Step 3: Test the Integration

```bash
# Start the backend with Language Confidence
PRONUNCIATION_SERVICE=language_confidence python -m uvicorn backend.main:app

# Test the placement endpoint
curl -X POST http://localhost:8000/api/placement \
  -H "Content-Type: application/json" \
  -d '{
    "attempts": [{
      "text": "hello",
      "audioBase64": "..."
    }]
  }'
```

### Step 4: Activate in Production

Update your deployment configuration to use Language Confidence:
```bash
PRONUNCIATION_SERVICE=language_confidence
```

## API Response Format

Both Azure and Language Confidence must return responses in this normalized format:

```json
{
  "overallScore": 75,
  "phonemes": [
    {"ph": "h", "score": 90},
    {"ph": "ə", "score": 70},
    {"ph": "l", "score": 85},
    {"ph": "oʊ", "score": 75}
  ],
  "words": [
    {"word": "hello", "score": 75}
  ]
}
```

## Troubleshooting

### Service Not Found Error
```
ValueError: Unknown PRONUNCIATION_SERVICE: [service]. Use 'azure' or 'language_confidence'.
```
**Solution**: Check that `PRONUNCIATION_SERVICE` environment variable is set to either `azure` or `language_confidence`.

### Language Confidence Returns 401/403
**Cause**: Invalid credentials or missing authorization header
**Solution**: Verify `LANGUAGE_CONFIDENCE_KEY` is set correctly in `.env`

### Service Startup Logs
Check the startup output to confirm which service loaded:
```bash
python -m uvicorn backend.main:app --reload
# Output should show:
# Configured pronunciation service: azure
# or
# Configured pronunciation service: language_confidence
```

## Adding New Pronunciation Services

To add another pronunciation service in the future:

1. Create a new class inheriting from `PronunciationAssessor`
2. Implement the `assess()` method
3. Add a condition in `get_assessor()` function
4. Update environment variable documentation

Example:

```python
class MyNewServiceAssessor(PronunciationAssessor):
    def assess(self, text: str, audio_bytes: bytes) -> Dict:
        # Your implementation here
        pass

def get_assessor() -> PronunciationAssessor:
    service = os.getenv("PRONUNCIATION_SERVICE", "azure").lower()
    
    if service == "my_new_service":
        return MyNewServiceAssessor()
    # ... rest of conditions
```

## Files Modified

- `backend/services/azure_pronunciation.py` - Added service abstraction layer
- `backend/main.py` - Updated to use `get_assessor()` factory
- `.env.example` - Configuration template
- This file - Integration documentation

