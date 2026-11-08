export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}
export async function exportSvgZip(frames, fps) {
  const JSZip = (await import("https://esm.sh/jszip@3.10.1")).default;
  const zip = new JSZip(), folder = zip.folder("svg_frames");
  frames.forEach((svg, i) => folder.file("frame_" + String(i).padStart(5, "0") + ".svg", svg));
  folder.file("README.txt", "Created by Personal Paint Video to SVG Studio. FPS: " + fps);
  return zip.generateAsync({ type: "blob" });
}
export async function exportWebM(frames, fps, width, height, onProgress) {
  if (!HTMLCanvasElement.prototype.captureStream || !window.MediaRecorder) throw new Error("इस browser में WebM export उपलब्ध नहीं।");
  const canvas = document.createElement("canvas");
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext("2d");
  const stream = canvas.captureStream(30);
  const mime = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"].find(t => MediaRecorder.isTypeSupported(t));
  if (!mime) throw new Error("WebM codec उपलब्ध नहीं।");
  const recorder = new MediaRecorder(stream, { mimeType: mime }), chunks = [];
  recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
  const stopped = new Promise(resolve => recorder.onstop = () => resolve(new Blob(chunks, { type: "video/webm" })));
  recorder.start();
  for (let i = 0; i < frames.length; i++) {
    const url = URL.createObjectURL(new Blob([frames[i]], { type: "image/svg+xml" }));
    const img = new Image();
    await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = url; });
    ctx.clearRect(0, 0, width, height); ctx.drawImage(img, 0, 0, width, height);
    URL.revokeObjectURL(url); onProgress?.(i + 1, frames.length);
    await new Promise(resolve => setTimeout(resolve, 1000 / 30));
  }
  recorder.stop();
  return stopped;
}