# Personal Paint — SVG Studio

A browser-only vector drawing studio inspired by the recovered Personal Paint project. Describe an illustration and Gemini returns editable SVG markup. No Android APK, Termux server, or drawing app is needed.

## Features
- Prompt-to-SVG generation through Google's Gemini API.
- Paste and preview SVG markup.
- SVG safety filtering before preview.
- Download editable SVG, export PNG, or copy the SVG source.
- Responsive interface for phone and desktop.
- API key is entered at runtime and is not stored by this project.

## Run locally
Open `index.html` in a modern browser, or serve this folder with any static HTTP server.

## Publish with GitHub Pages
1. Open **Settings → Pages** in this repository.
2. Under **Build and deployment**, choose **GitHub Actions** as the source.
3. Push to `main` (or rerun the Pages workflow from the Actions tab).
4. After the workflow succeeds, the site URL is shown in the Pages settings.

The included workflow deploys the repository root as a static site.

## Gemini API key
Create a key in Google AI Studio and paste it into the key field when using the site. The browser sends the key directly to Google's Generative Language API. The key is not stored by this project. Do not share your key or paste it into repository files. API access and charges/limits are governed by Google.

## Important
This creates vector illustrations, not photorealistic raster images. SVG quality depends on the model's ability to produce paths and shapes.