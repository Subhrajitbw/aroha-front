'use client';

import { useEffect, useRef, useState } from 'react';
import { Box } from 'lucide-react';

export function FauxARViewer({ imageUrl, dimensions, title }) {
  const modelRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  useEffect(() => {
    // Dynamically import the web component only on the client
    import('@google/model-viewer').then(() => setIsReady(true)).catch(console.error);
  }, []);

  // Convert Sanity dimensions (cm/mm/in) to meters for AR scaling
  const getScaleInMeters = () => {
    if (!dimensions) return '1 1 0.01'; // Default flat plane if no dimensions

    let multiplier = 1;
    const unit = dimensions.unit?.toLowerCase() || 'cm';
    if (unit === 'cm') multiplier = 0.01;
    else if (unit === 'mm') multiplier = 0.001;
    else if (unit === 'in' || unit === 'inches') multiplier = 0.0254;

    const w = (parseFloat(dimensions.width) * multiplier) || 1;
    const h = (parseFloat(dimensions.height) * multiplier) || 1;
    // We use a very thin depth (0.01m) to mimic a 2D cutout if depth isn't provided or is zero.
    const d = (parseFloat(dimensions.depth) * multiplier) || 0.01;

    return `${w} ${h} ${d}`;
  };

  useEffect(() => {
    if (!isReady || !modelRef.current || !imageUrl) return;

    const applyTexture = async () => {
      const modelViewer = modelRef.current;
      
      const updateMaterial = async () => {
        try {
          const material = modelViewer.model?.materials?.[0];
          if (!material) return;
          
          // Browsers often cache images without CORS headers when used in standard <img> tags.
          // When WebGL tries to use the same cached image, it fails with a CORS error.
          // Appending a dummy query string bypasses the disk cache and forces a fresh CORS fetch.
          const corsUrl = imageUrl + (imageUrl.includes('?') ? '&' : '?') + 'cors=true';
          const texture = await modelViewer.createTexture(corsUrl);
          
          material.pbrMetallicRoughness.baseColorTexture.setTexture(texture);
          
          // Remove lighting effects to make the 2D photo look natural
          material.pbrMetallicRoughness.setMetallicFactor(0);
          material.pbrMetallicRoughness.setRoughnessFactor(1);
          // The Khronos Box.glb has a default red base color. Reset it to white so it doesn't tint the image.
          material.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 1]);
          setIsModelLoaded(true);
        } catch (e) {
          console.error("Failed to apply AR texture", e);
        }
      };

      // If already loaded, update immediately
      if (modelViewer.model) {
        updateMaterial();
      } else {
        modelViewer.addEventListener('load', updateMaterial);
      }

      return () => {
        modelViewer.removeEventListener('load', updateMaterial);
      };
    };

    applyTexture();
  }, [isReady, imageUrl]);

  if (!isReady) return null;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto flex items-center justify-center">
      <style>{`
        model-viewer::part(default-canvas) {
          opacity: 0;
          pointer-events: none;
        }
      `}</style>
      
      {/* Invisible model-viewer to handle WebXR/QuickLook logic */}
      <model-viewer
        ref={modelRef}
        src="https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF-Binary/Box.glb"
        alt={`AR View for ${title}`}
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls={false}
        disable-zoom
        disable-pan
        disable-tap
        scale={getScaleInMeters()}
        className="absolute w-[180px] h-[48px] rounded-full overflow-hidden bg-transparent [--poster-color:transparent] outline-none border-none pointer-events-none"
      />

      {/* Always-visible Custom Button */}
      <button
        onClick={() => {
          if (modelRef.current?.canActivateAR) {
            modelRef.current.activateAR();
          } else {
            alert("AR View is only supported on mobile devices (iOS/Android). Please open this site on your phone to view in your room!");
          }
        }}
        className="w-[180px] h-[48px] bg-stone-900 text-white rounded-full font-bold text-[10px] tracking-[0.2em] uppercase shadow-2xl flex items-center justify-center gap-2 transition-transform active:scale-95 hover:bg-stone-800 z-10 pointer-events-auto"
      >
        <Box className="w-4 h-4 shrink-0" />
        <span>View in Room</span>
      </button>
    </div>
  );
}
