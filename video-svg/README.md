# Video to SVG Studio

Modular browser-based video frame vectorizer for GitHub Pages.

## Architecture
- `src/app.js`: UI orchestration and frame pipeline
- `src/video.js`: video seeking and frame extraction
- `src/vector-worker.js`: VTracer WebAssembly vectorization in a Web Worker
- `src/export.js`: SVG ZIP and WebM export
- `src/video-to-svg.css`: interface styling

## Libraries
- [@buzz-dee/vtrace](https://github.com/BuZZ-dEE/vtrace): VTracer-backed WebAssembly SVG vectorizer, MIT
- [JSZip](https://github.com/Stuk/jszip): ZIP archive creation, MIT

No server or API key is required. Video frames are processed locally in the browser. The VTracer package is loaded as an ESM dependency from esm.sh; an internet connection is required.

## Run
Open `video-to-svg.html` through GitHub Pages. The app uses native browser video decoding and canvas frame extraction, then sends RGBA frames to a VTracer worker.