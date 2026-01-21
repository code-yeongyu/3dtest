'use client';

import { useState, useEffect } from 'react';

type WebGLContext = WebGLRenderingContext | WebGL2RenderingContext;

export function useWebGLSupport() {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);

  useEffect(() => {
    const checkWebGL = () => {
      try {
        const canvas = document.createElement('canvas');
        const gl: WebGLContext | null =
          canvas.getContext('webgl2') || canvas.getContext('webgl');

        if (!gl) {
          return false;
        }

        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string;
          if (renderer.includes('SwiftShader') || renderer.includes('Software')) {
            return false;
          }
        }

        return true;
      } catch {
        return false;
      }
    };

    setIsSupported(checkWebGL());
  }, []);

  return { isSupported, isLoading: isSupported === null };
}
