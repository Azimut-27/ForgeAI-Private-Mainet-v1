ForgeAI Vercel deployment notes

Upload the contents of this folder as the GitHub repo root.

Vercel settings:
- Framework preset: Vite
- Install command: npm install
- Build command: npm run build
- Output directory: dist

Required AI environment variable:
- Key: GEMINI_API_KEY
- Value: your real Gemini API key

Alternative supported key name:
- GOOGLE_GENERATIVE_AI_API_KEY

Optional Gemini model override:
- GEMINI_MODEL=gemini-2.5-flash

Important:
- Do not commit .env files or provider keys to GitHub.
- After changing Vercel environment variables, redeploy the project.
