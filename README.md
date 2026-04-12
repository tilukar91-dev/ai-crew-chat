# 🤖 AI Crew Chat

A group chat with 4 unique AI personalities powered by Google Gemini.

## Personalities
- 🧘 **Aria** — calm & helpful
- 🤖 **SYS-7** — strict system monitor
- 🎲 **Chaos** — funny & chaotic
- 🌸 **Pixie** — playful & sweet

---

## Deploy to Vercel (Step by Step)

### 1. Upload to GitHub
1. Go to github.com and log in
2. Click the **+** button → **New repository**
3. Name it `ai-crew-chat` → Click **Create repository**
4. Upload all these project files to the repository

### 2. Connect to Vercel
1. Go to vercel.com and log in
2. Click **Add New Project**
3. Import your `ai-crew-chat` GitHub repository
4. Click **Deploy** (leave all settings as default)

### 3. Add your Gemini API Key (IMPORTANT)
1. In Vercel, go to your project → **Settings** → **Environment Variables**
2. Add a new variable:
   - Name: `GEMINI_API_KEY`
   - Value: (paste your key from aistudio.google.com)
3. Click **Save**
4. Go to **Deployments** → click **Redeploy**

Your site is now live! 🎉
