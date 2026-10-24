<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/8f82f0fd-c738-4ebc-a72f-005b20ae665e

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in `.env` to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to Vercel

1. Push this repository to GitHub.
2. In the [Vercel Dashboard](https://vercel.com/new), import your repository.
3. Framework Preset will auto-detect as **Vite**.
4. Under **Environment Variables**, add:
   - `GEMINI_API_KEY`: Your Google Gemini API key
5. Click **Deploy**.
