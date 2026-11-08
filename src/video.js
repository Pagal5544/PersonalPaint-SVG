export function seekVideo(video, time) {
  return new Promise((resolve, reject) => {
    const done = () => { clearTimeout(timer); resolve(); };
    const fail = () => { clearTimeout(timer); reject(new Error("वीडियो फ्रेम seek नहीं हो पाया")); };
    const timer = setTimeout(fail, 12000);
    video.addEventListener("seeked", done, { once: true });
    video.currentTime = Math.min(time, Math.max(0, video.duration - 0.02));
  });
}
export function drawVideoFrame(video, canvas, width) {
  const ratio = video.videoHeight / video.videoWidth;
  canvas.width = width;
  canvas.height = Math.max(1, Math.round(width * ratio));
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  return context.getImageData(0, 0, canvas.width, canvas.height);
}