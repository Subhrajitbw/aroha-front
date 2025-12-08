// src/utils/backgroundSampler.js

export const getLuminance = (r, g, b) => {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

export const rgbToTheme = (r, g, b) => (getLuminance(r, g, b) > 0.5 ? "light" : "dark");

export const rafThrottle = (fn) => {
  let ticking = false;
  return (...args) => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      fn(...args);
      ticking = false;
    });
  };
};

// Enhanced color mixing for overlapping elements
const blendColors = (baseColor, overlayColor, alpha = 1) => {
  const a = Math.min(1, Math.max(0, alpha));
  return {
    r: Math.round(baseColor.r * (1 - a) + overlayColor.r * a),
    g: Math.round(baseColor.g * (1 - a) + overlayColor.g * a),
    b: Math.round(baseColor.b * (1 - a) + overlayColor.b * a),
    a: Math.min(255, baseColor.a + overlayColor.a * a)
  };
};

// Calculate color distance for clustering similar colors
const colorDistance = (c1, c2) => {
  const dr = c1.r - c2.r;
  const dg = c1.g - c2.g;
  const db = c1.b - c2.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
};

// Intelligent color clustering to group similar pixels
const clusterColors = (colors, threshold = 30) => {
  const clusters = [];
  
  colors.forEach(color => {
    let foundCluster = false;
    
    for (let cluster of clusters) {
      if (colorDistance(color, cluster.representative) < threshold) {
        cluster.colors.push(color);
        cluster.weight += 1;
        // Update representative to average
        const total = cluster.colors.length;
        cluster.representative = {
          r: Math.round(cluster.colors.reduce((sum, c) => sum + c.r, 0) / total),
          g: Math.round(cluster.colors.reduce((sum, c) => sum + c.g, 0) / total),
          b: Math.round(cluster.colors.reduce((sum, c) => sum + c.b, 0) / total),
          a: Math.round(cluster.colors.reduce((sum, c) => sum + c.a, 0) / total)
        };
        foundCluster = true;
        break;
      }
    }
    
    if (!foundCluster) {
      clusters.push({
        representative: { ...color },
        colors: [color],
        weight: 1
      });
    }
  });
  
  return clusters.sort((a, b) => b.weight - a.weight);
};

// Calculate adaptive theme based on color distribution
const calculateAdaptiveTheme = (clusters) => {
  let lightWeight = 0;
  let darkWeight = 0;
  let totalWeight = 0;
  
  clusters.forEach(cluster => {
    const luminance = getLuminance(cluster.representative.r, cluster.representative.g, cluster.representative.b);
    const weight = cluster.weight;
    
    if (luminance > 0.5) {
      lightWeight += weight * luminance;
    } else {
      darkWeight += weight * (1 - luminance);
    }
    totalWeight += weight;
  });
  
  // If there's a significant contrast, determine dominance
  const contrastRatio = Math.abs(lightWeight - darkWeight) / totalWeight;
  
  if (contrastRatio > 0.3) {
    return lightWeight > darkWeight ? "light" : "dark";
  }
  
  // For mixed content, consider the most dominant cluster
  const dominantCluster = clusters[0];
  const dominantLuminance = getLuminance(
    dominantCluster.representative.r,
    dominantCluster.representative.g,
    dominantCluster.representative.b
  );
  
  return dominantLuminance > 0.5 ? "light" : "dark";
};

// Multi-point sampling around the target point
const generateSamplePoints = (centerX, centerY, radius = 8, samples = 9) => {
  const points = [{ x: centerX, y: centerY }]; // Center point
  
  if (samples > 1) {
    const angleStep = (2 * Math.PI) / (samples - 1);
    for (let i = 0; i < samples - 1; i++) {
      const angle = i * angleStep;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      points.push({ x: Math.round(x), y: Math.round(y) });
    }
  }
  
  return points;
};

// Parse gradients including overlays
const parseGradientColors = (gradientString) => {
  if (!gradientString) return [];
  try {
    const rgbMatches = gradientString.match(/rgba?\(([^)]+)\)/g) || [];
    const hexMatches = gradientString.match(/#[0-9a-fA-F]{3,6}/g) || [];
    
    const colors = [];
    
    rgbMatches.forEach(match => {
      const values = match.match(/[\d.]+/g);
      if (values && values.length >= 3) {
        colors.push([
          parseFloat(values[0]),
          parseFloat(values[1]),
          parseFloat(values[2]),
          values[3] ? parseFloat(values[3]) : 1
        ]);
      }
    });
    
    hexMatches.forEach(hex => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (result) {
        colors.push([
          parseInt(result[1], 16),
          parseInt(result[2], 16), 
          parseInt(result[3], 16),
          1
        ]);
      } else if (hex.length === 4) {
        const shortHex = hex.substring(1);
        colors.push([
          parseInt(shortHex[0] + shortHex[0], 16),
          parseInt(shortHex[1] + shortHex[1], 16),
          parseInt(shortHex[2] + shortHex[2], 16),
          1
        ]);
      }
    });
    
    return colors;
  } catch {
    return [];
  }
};

const calculateGradientLuminance = (gradientString) => {
  const colors = parseGradientColors(gradientString);
  if (colors.length === 0) return 0.5;
  
  let totalWeight = 0;
  let weightedR = 0, weightedG = 0, weightedB = 0;
  
  colors.forEach(([r, g, b, a]) => {
    const weight = a || 1;
    weightedR += r * weight;
    weightedG += g * weight;
    weightedB += b * weight;
    totalWeight += weight;
  });
  
  if (totalWeight === 0) return 0.5;
  
  const avgR = weightedR / totalWeight;
  const avgG = weightedG / totalWeight;
  const avgB = weightedB / totalWeight;
  
  return getLuminance(avgR, avgG, avgB);
};

const extractImageUrl = (cssBackgroundImage) => {
  if (!cssBackgroundImage || cssBackgroundImage === "none") return null;
  try {
    const urlMatches = cssBackgroundImage.match(/url\(['"]?([^'"]*?)['"]?\)/g);
    if (!urlMatches) return null;
    
    const lastUrlMatch = urlMatches[urlMatches.length - 1];
    let url = lastUrlMatch.replace(/^url\(['"]?([^'"]*?)['"]?\)$/, "$1");
    
    if (url.startsWith("data:") || (url.includes("%") && url.includes("%%"))) return null;
    if (url.length > 2000) return null;
    return decodeURIComponent(url);
  } catch {
    return null;
  }
};

const computeBackgroundPixelCoord = (el, clientX, clientY, img, styles) => {
  const rect = el.getBoundingClientRect();
  const xInEl = clientX - rect.left;
  const yInEl = clientY - rect.top;

  const size = styles.backgroundSize;
  const pos = (styles.backgroundPosition || "0% 0%").split(",")[0];
  const repeat = (styles.backgroundRepeat || "repeat").split(",")[0];

  const elW = rect.width, elH = rect.height;
  let renderW = img.naturalWidth;
  let renderH = img.naturalHeight;
  const aspectImg = img.naturalWidth / img.naturalHeight;

  const parseLen = (val, total) => {
    if (!val) return 0;
    if (val.endsWith("%")) return (parseFloat(val) / 100) * total;
    if (val.endsWith("px")) return parseFloat(val);
    const n = parseFloat(val);
    return isNaN(n) ? 0 : n;
  };

  if (size && size !== "auto" && size !== "auto auto") {
    const [sx, sy] = size.split(" ");
    if (sx === "cover" || sy === "cover") {
      if (elW / elH > aspectImg) {
        renderW = elW; renderH = elW / aspectImg;
      } else {
        renderH = elH; renderW = elH * aspectImg;
      }
    } else if (sx === "contain" || sy === "contain") {
      if (elW / elH < aspectImg) {
        renderW = elW; renderH = elW / aspectImg;
      } else {
        renderH = elH; renderW = elH * aspectImg;
      }
    } else {
      if (sx && sy) {
        renderW = sx === "auto" ? img.naturalWidth : parseLen(sx, elW);
        renderH = sy === "auto" ? img.naturalHeight : parseLen(sy, elH);
        if (sx !== "auto" && sy === "auto") renderH = renderW / aspectImg;
        if (sx === "auto" && sy !== "auto") renderW = renderH * aspectImg;
      } else if (sx) {
        renderW = parseLen(sx, elW);
        renderH = renderW / aspectImg;
      }
    }
  }

  const [pxRaw, pyRaw] = pos.split(" ");
  const px = (pxRaw || "0%").trim();
  const py = (pyRaw || "0%").trim();
  const resolvePos = (val, elSize, renderSize) => {
    if (val === "left" || val === "top") return 0;
    if (val === "center") return (elSize - renderSize) / 2;
    if (val === "right" || val === "bottom") return elSize - renderSize;
    if (val.endsWith("%")) return (parseFloat(val) / 100) * (elSize - renderSize);
    if (val.endsWith("px")) return parseFloat(val);
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  };
  const offsetX = resolvePos(px, elW, renderW);
  const offsetY = resolvePos(py, elH, renderH);

  let x = xInEl - offsetX;
  let y = yInEl - offsetY;

  if (repeat.includes("repeat-x") || repeat === "repeat") x = ((x % renderW) + renderW) % renderW;
  if (repeat.includes("repeat-y") || repeat === "repeat") y = ((y % renderH) + renderH) % renderH;

  if (repeat === "no-repeat" && (x < 0 || y < 0 || x >= renderW || y >= renderH)) return null;

  const scaleX = img.naturalWidth / renderW;
  const scaleY = img.naturalHeight / renderH;
  const imgX = Math.round(x * scaleX);
  const imgY = Math.round(y * scaleY);
  if (imgX < 0 || imgY < 0 || imgX >= img.naturalWidth || imgY >= img.naturalHeight) return null;

  return { imgX, imgY };
};

const loadImage = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    setTimeout(() => reject(new Error('Image load timeout')), 5000);
    img.src = url;
  });

const isGradientBackground = (cssValue) => {
  return cssValue && (
    cssValue.includes('gradient') ||
    cssValue.includes('linear-gradient') ||
    cssValue.includes('radial-gradient') ||
    cssValue.includes('conic-gradient')
  );
};

// Sample multiple pixels from an image
const sampleImagePixels = (img, coords, styles, samplePoints) => {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);
  
  const pixels = [];
  
  samplePoints.forEach(point => {
    try {
      const pixelCoord = computeBackgroundPixelCoord(
        coords.element, 
        point.x, 
        point.y, 
        img, 
        styles
      );
      
      if (pixelCoord) {
        const { imgX, imgY } = pixelCoord;
        const data = ctx.getImageData(imgX, imgY, 1, 1).data;
        pixels.push({
          r: data[0],
          g: data[1],
          b: data[2],
          a: data[3]
        });
      }
    } catch (e) {
      // Skip invalid coordinates
    }
  });
  
  return pixels;
};

// Enhanced multi-point sampling function
export const sampleBackgroundAtPoint = async (
  clientX, 
  clientY, 
  options = {}
) => {
  const {
    log = true,
    sampleRadius = 8,
    sampleCount = 9,
    clusterThreshold = 30
  } = options;

  const LOG = (...args) => log && console.log("[BgSample]", ...args);
  
  // Generate sampling points around the target
  const samplePoints = generateSamplePoints(clientX, clientY, sampleRadius, sampleCount);
  const sampledColors = [];
  const elementLayers = [];

  // Sample each point and collect colors from all layers
  for (const point of samplePoints) {
    let el = document.elementFromPoint(point.x, point.y);
    if (!el) continue;

    const layerColors = [];

    // Walk up the DOM tree collecting colors from each layer
    while (el && el !== document.documentElement) {
      const styles = window.getComputedStyle(el);
      const bgImg = styles.backgroundImage;
      const bgColor = styles.backgroundColor;

      // Handle background images (gradients + images)
      if (bgImg && bgImg !== "none") {
        if (isGradientBackground(bgImg) && !bgImg.includes('url(')) {
          // Pure gradient
          const luminance = calculateGradientLuminance(bgImg);
          layerColors.push({
            r: Math.round(luminance * 255),
            g: Math.round(luminance * 255),
            b: Math.round(luminance * 255),
            a: 255,
            source: "gradient",
            element: el
          });
        } else {
          // Try to sample image
          const url = extractImageUrl(bgImg);
          if (url) {
            try {
              const img = await loadImage(url);
              const coords = computeBackgroundPixelCoord(el, point.x, point.y, img, styles);
              if (coords) {
                const pixels = sampleImagePixels(img, { element: el }, styles, [point]);
                if (pixels.length > 0) {
                  let color = pixels[0];
                  
                  // Blend with gradient overlay if present
                  if (isGradientBackground(bgImg)) {
                    const gradientColors = parseGradientColors(bgImg);
                    if (gradientColors.length > 0) {
                      const [gr, gg, gb, ga] = gradientColors[0];
                      const alpha = ga || 0.5;
                      color = blendColors(color, { r: gr, g: gg, b: gb, a: 255 }, alpha);
                    }
                  }
                  
                  layerColors.push({
                    ...color,
                    source: "image",
                    element: el
                  });
                }
              }
            } catch (e) {
              // Fallback to gradient if image fails
              if (isGradientBackground(bgImg)) {
                const luminance = calculateGradientLuminance(bgImg);
                layerColors.push({
                  r: Math.round(luminance * 255),
                  g: Math.round(luminance * 255),
                  b: Math.round(luminance * 255),
                  a: 255,
                  source: "gradient-fallback",
                  element: el
                });
              }
            }
          }
        }
      }

      // Handle solid background colors
      if (bgColor && bgColor !== "rgba(0, 0, 0, 0)" && bgColor !== "transparent") {
        const nums = bgColor.match(/[\d.]+/g) || [];
        const r = parseFloat(nums[0] || "0");
        const g = parseFloat(nums[1] || "0");
        const b = parseFloat(nums[2] || "0");
        const a = Math.round(parseFloat(nums[3] || "1") * 255);
        
        layerColors.push({
          r, g, b, a,
          source: "color",
          element: el
        });
      }

      el = el.parentElement;
    }

    // Composite all layers for this sample point
    if (layerColors.length > 0) {
      let compositeColor = layerColors[layerColors.length - 1]; // Start with bottom layer
      
      // Blend layers from bottom to top
      for (let i = layerColors.length - 2; i >= 0; i--) {
        const layerColor = layerColors[i];
        const alpha = layerColor.a / 255;
        compositeColor = blendColors(compositeColor, layerColor, alpha);
      }
      
      sampledColors.push(compositeColor);
    }
  }

  // If no colors found, fallback
  if (sampledColors.length === 0) {
    const bodyColor = window.getComputedStyle(document.body).backgroundColor;
    const nums = bodyColor.match(/[\d.]+/g) || [];
    const r = parseFloat(nums[0] || "255");
    const g = parseFloat(nums[1] || "255");
    const b = parseFloat(nums[2] || "255");
    const a = Math.round(parseFloat(nums[3] || "1") * 255);
    const theme = rgbToTheme(r, g, b);
    return { 
      r, g, b, a, theme, 
      source: "fallback-body", 
      element: document.body,
      analysis: {
        sampleCount: 0,
        clusters: [],
        distribution: "fallback"
      }
    };
  }

  // Cluster similar colors
  const clusters = clusterColors(sampledColors, clusterThreshold);
  
  // Calculate adaptive theme based on color distribution
  const adaptiveTheme = calculateAdaptiveTheme(clusters);
  
  // Return the dominant color with enhanced analysis
  const dominantColor = clusters[0].representative;
  
  return {
    ...dominantColor,
    theme: adaptiveTheme,
    source: "multi-sample",
    element: clusters[0].colors[0].element,
    analysis: {
      sampleCount: sampledColors.length,
      clusters: clusters.map(cluster => ({
        color: cluster.representative,
        weight: cluster.weight,
        percentage: (cluster.weight / sampledColors.length * 100).toFixed(1)
      })),
      distribution: clusters.length > 1 ? "mixed" : "uniform",
      contrastInfo: {
        hasHighContrast: clusters.length > 1 && 
          colorDistance(clusters[0].representative, clusters[1]?.representative || clusters[0].representative) > 100,
        dominantClusterPercentage: (clusters[0].weight / sampledColors.length * 100).toFixed(1)
      }
    }
  };
};

// Utility function for getting detailed color analysis
export const getColorAnalysis = (result) => {
  if (!result || !result.analysis) return null;
  
  const { analysis } = result;
  
  return {
    sampleCount: analysis.sampleCount,
    distribution: analysis.distribution,
    clusters: analysis.clusters,
    hasHighContrast: analysis.contrastInfo?.hasHighContrast,
    dominance: analysis.contrastInfo?.dominantClusterPercentage,
    recommendation: analysis.distribution === "mixed" && analysis.contrastInfo?.hasHighContrast
      ? "Consider using adaptive styling based on dominant color"
      : "Uniform styling appropriate"
  };
};
