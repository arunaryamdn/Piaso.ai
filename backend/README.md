# Paiso.ai Backend

This is the backend service for Paiso.ai, a modern Indian stock market portfolio analytics platform. Powered by FastAPI.

## Features
- Portfolio upload and analytics
- Real-time price fetching
- AI-powered recommendations
- Sector and risk analysis

## API Endpoints
See the main project README for endpoint details.

## Setup
1. Create a virtual environment and install requirements:
   ```sh
   python -m venv .venv
   source .venv/bin/activate  # or .venv\Scripts\activate on Windows
   pip install -r requirements.txt
   ```
2. Run the server:
   ```sh
   uvicorn main:app --reload
   ```

## License
MIT License

## Running Tests

Backend tests are located in the `tests/` directory. To run all tests:

```
pytest
```

Make sure you have installed the dev dependencies from `requirements.txt` (including `pytest` and `httpx`). 