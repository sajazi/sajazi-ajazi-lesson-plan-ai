
# AJAZI - PlanSmith AI

An intelligent lesson plan generator for teachers. Upload your district's specific template (Word/PDF), provide resources or links, and let AI craft a perfectly formatted lesson plan tailored to your needs.

## Features

- **Template Intelligence**: Analyzes uploaded DOCX/PDF templates to maintain district-specific formatting.
- **Resource Scribing**: Processes URLs or raw text to generate high-quality pedagogical content.
- **My Library**: Securely stores your templates and resources locally using IndexedDB.
- **Direct Export**: Generates clean HTML that copies/pastes perfectly into Microsoft Word or Google Docs.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open the app**:
   The app will be running at `http://localhost:5173`.

### Building for Production

To create an optimized production build:
```bash
npm run build
```
The output will be in the `dist` folder.

## Deployment

### Netlify

This project is pre-configured for Netlify deployment.

1. Connect your GitHub repository to a new Netlify site.
2. Netlify will automatically detect the `netlify.toml` file.
3. Add your `API_KEY` to the **Environment Variables** in the Netlify dashboard.
4. Deploy!

## Architecture

- **Frontend**: React (v19) + Vite
- **Styling**: Tailwind CSS
- **AI Engine**: Google Gemini API (gemini-3-flash-preview)
- **Document Processing**: Mammoth.js (for DOCX)
- **Local Storage**: Browser IndexedDB
