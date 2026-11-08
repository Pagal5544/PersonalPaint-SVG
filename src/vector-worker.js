import { VTrace } from "https://esm.sh/@buzz-dee/vtrace@2.0.0-0?bundle";
self.onmessage = (event) => {
  const { id, buffer, width, height, style, colors } = event.data;
  try {
    if (!buffer || !width || !height || buffer.byteLength !== width * height * 4) {
      throw new Error("Invalid RGBA frame data");
    }
    const imageData = new ImageData(new Uint8ClampedArray(buffer), width, height);
    const presets = {
      cartoon: { turdSize: 8, cornerThreshold: 64, lengthThreshold: 5, maxIterations: 7, spliceThreshold: 50, simplify: 1.4 },
      illustration: { turdSize: 4, cornerThreshold: 60, lengthThreshold: 4, maxIterations: 9, spliceThreshold: 46, simplify: 0.8 },
      detail: { turdSize: 2, cornerThreshold: 56, lengthThreshold: 3, maxIterations: 10, spliceThreshold: 42, simplify: 0.25 }
    };
    const tracer = new VTrace(imageData, {
      preset: "poster",
      clustering: "color-cluster",
      hierarchical: "stacked",
      mode: "spline",
      optCurve: true,
      maxColors: Math.min(24, Math.max(4, Number(colors) || 16)),
      optimize: 1,
      pathPrecision: 2,
      ...presets[style] || presets.cartoon
    });
    const svg = tracer.getSVG();
    if (typeof svg !== "string" || !svg.includes("<svg")) throw new Error("VTracer ने SVG output नहीं दिया");
    self.postMessage({ id, svg });
  } catch (error) {
    self.postMessage({ id, error: error?.message || String(error), stack: error?.stack || "" });
  }
};