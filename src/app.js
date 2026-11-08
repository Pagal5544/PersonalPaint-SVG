import { seekVideo, drawVideoFrame } from "./video.js";
import { downloadBlob, exportSvgZip, exportWebM } from "./export.js";
const $ = id => document.getElementById(id);
const video = $("source"), canvas = $("original");
let frames = [], worker, active = false, playTimer = 0, videoUrl = "", frameWidth = 360, frameHeight = 640;
const say = message => $("status").textContent = message;
function setProgress(done, total) { $("progress").style.width = (100 * done / total) + "%"; $("count").textContent = done + " / " + total + " SVG frames"; }
function makeWorker() { if (worker) worker.terminate(); worker = new Worker("./src/vector-worker.js?v=3", { type: "module" }); }
function trace(imageData, style, colors, id) {
  return new Promise((resolve, reject) => {
    const onMessage = event => {
      if (event.data.id !== id) return;
      worker.removeEventListener("message", onMessage);
      event.data.error ? reject(new Error(event.data.error)) : resolve(event.data.svg);
    };
    const timer = setTimeout(() => { worker.removeEventListener("message", onMessage); reject(new Error("VTracer worker timeout — CDN/WASM load या processing अटक गया")); }, 60000);
    const fail = event => { clearTimeout(timer); worker.removeEventListener("message", onMessage); reject(new Error("VTracer worker error: " + (event.message || "unknown"))); };\n    worker.addEventListener("error", fail, { once: true });\n    worker.addEventListener("message", onMessage);
    const copy = new Uint8ClampedArray(imageData.data);
    worker.postMessage({ id, buffer: copy.buffer, width: imageData.width, height: imageData.height, style, colors }, [copy.buffer]);
  });
}
$("file").addEventListener("change", event => {
  const file = event.target.files?.[0]; if (!file) return;
  if (videoUrl) URL.revokeObjectURL(videoUrl);
  videoUrl = URL.createObjectURL(file); video.src = videoUrl;
  video.onloadedmetadata = () => {
    $("meta").textContent = file.name + " · " + video.videoWidth + "×" + video.videoHeight + " · " + video.duration.toFixed(1) + " sec";
    $("convert").disabled = false; say("वीडियो तैयार है। अब VTracer WASM engine से conversion करें।");
  };
  video.onerror = () => say("वीडियो browser में decode नहीं हुआ।");
});
$("cancel").onclick = () => { active = false; say("रोकने का अनुरोध भेजा गया…"); };
$("convert").onclick = async () => {
  if (!video.src || active) return;
  active = true; frames = []; makeWorker();
  ["convert","play","saveframe","zip","webm"].forEach(id => $(id).disabled = true);
  $("cancel").disabled = false; $("progress").style.width = "0%";
  try {
    const fps = +$("fps").value, seconds = Math.min(+ $("duration").value, video.duration);
    const total = Math.max(1, Math.ceil(seconds * fps)), width = +$("width").value;
    frameWidth = Math.min(width, video.videoWidth);
    frameHeight = Math.max(1, Math.round(frameWidth * video.videoHeight / video.videoWidth));
    const style = $("style").value, colors = +$("colors").value;
    say("VTracer poster mode (WASM) initialize हो रहा है…");
    for (let i = 0; i < total && active; i++) {
      await seekVideo(video, i / fps);
      const imageData = drawVideoFrame(video, canvas, frameWidth);
      const svg = await trace(imageData, style, colors, i);
      frames.push(svg);
      if (i === 0) {
        const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
        $("vector").src = url; $("vector").onload = () => URL.revokeObjectURL(url);
        $("saveframe").disabled = false;
      }
      setProgress(i + 1, total);
    }
    if (frames.length) {
      say((active ? "Conversion पूरा!" : "रोक दिया गया।") + " " + frames.length + " SVG फ्रेम तैयार।");
      $("play").disabled = $("zip").disabled = $("webm").disabled = false;
    }
  } catch (error) { say("Conversion error: " + error.message); }
  finally { active = false; $("convert").disabled = false; $("cancel").disabled = true; }
};
$("saveframe").onclick = () => { if (frames[0]) downloadBlob(new Blob([frames[0]], { type: "image/svg+xml" }), "frame_00000.svg"); };
$("zip").onclick = async () => {
  if (!frames.length) return;
  $("zip").disabled = true;
  try { say("ZIP library से SVG archive बनाया जा रहा है…"); const blob = await exportSvgZip(frames, +$("fps").value); downloadBlob(blob, "Video_to_SVG_Frames.zip"); say("सभी SVG फ्रेम की ZIP डाउनलोड हो गई।"); }
  catch (error) { say("ZIP error: " + error.message); } finally { $("zip").disabled = false; }
};
$("play").onclick = () => {
  if (!frames.length) return;
  clearTimeout(playTimer); let i = 0; const delay = 1000 / +$("fps").value;
  const tick = () => {
    const url = URL.createObjectURL(new Blob([frames[i]], { type: "image/svg+xml" }));
    $("vector").src = url; $("vector").onload = () => URL.revokeObjectURL(url);
    i = (i + 1) % frames.length; playTimer = setTimeout(tick, delay);
  };
  tick(); say("SVG frame animation चल रही है।");
};
$("webm").onclick = async () => {
  if (!frames.length) return;
  $("webm").disabled = true;
  try {
    say("SVG frames से WebM video render हो रहा है…");
    const blob = await exportWebM(frames, +$("fps").value, frameWidth, frameHeight, (done,total) => say("WebM render: " + done + "/" + total));
    downloadBlob(blob, "Vector_Animation.webm"); say("WebM वीडियो डाउनलोड हो गया।");
  } catch (error) { say("Export error: " + error.message); }
  finally { $("webm").disabled = false; }
};
makeWorker();