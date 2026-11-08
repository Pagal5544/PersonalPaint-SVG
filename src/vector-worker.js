import { VTrace } from "https://esm.sh/@buzz-dee/vtrace";
self.onmessage = (event) => {
  const { id, buffer, width, height, style, colors } = event.data;
  try {
    const pixels = new Uint8ClampedArray(buffer);
    const imageData = new ImageData(pixels, width, height);
    const presets = {
      cartoon: { colorPrecision: 5, layerDifference: 18, turdSize: 5, cornerThreshold: 62, lengthThreshold: 4, maxIterations: 7, spliceThreshold: 48, pathPrecision: 2 },
      illustration: { colorPrecision: 6, layerDifference: 14, turdSize: 3, cornerThreshold: 58, lengthThreshold: 3, maxIterations: 9, spliceThreshold: 45, pathPrecision: 3 },
      detail: { colorPrecision: 7, layerDifference: 10, turdSize: 1, cornerThreshold: 55, lengthThreshold: 2, maxIterations: 10, spliceThreshold: 42, pathPrecision: 4 }
    };
    const colorPrecision = Number(colors) <= 8 ? 4 : Number(colors) <= 16 ? 5 : Number(colors) <= 24 ? 6 : 7;
    const tracer = new VTrace(imageData, {
      colorMode: "color",
      hierarchical: "stacked",
      mode: "spline",
      optCurve: true,
      ...presets[style],
      colorPrecision,
    });
    self.postMessage({ id, svg: tracer.getSVG() });
  } catch (error) {
    self.postMessage({ id, error: error?.message || String(error) });
  }
};