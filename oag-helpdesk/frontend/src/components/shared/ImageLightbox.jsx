import React, { useEffect, useState, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * In-app image viewer with zoom + pan + multi-image navigation.
 * Never triggers downloads.
 */
export default function ImageLightbox({ images = [], startIndex = 0, open, onClose }) {
  const [index, setIndex] = useState(startIndex);
  const [zoom, setZoom] = useState(1);

  useEffect(() => { setIndex(startIndex); setZoom(1); }, [startIndex, open]);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + images.length) % images.length);
    setZoom(1);
  }, [images.length]);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % images.length);
    setZoom(1);
  }, [images.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, prev, next]);

  if (!open || images.length === 0) return null;
  const src = images[index];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Top bar */}
        <div
          className="absolute top-0 inset-x-0 p-3 flex items-center justify-between text-white z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-sm opacity-80">{index + 1} / {images.length}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
              className="p-2 rounded-full hover:bg-white/10"
              aria-label="Zoom out"
            ><ZoomOut className="w-5 h-5" /></button>
            <button
              onClick={() => setZoom((z) => Math.min(4, z + 0.25))}
              className="p-2 rounded-full hover:bg-white/10"
              aria-label="Zoom in"
            ><ZoomIn className="w-5 h-5" /></button>
            <button
              onClick={() => setZoom(1)}
              className="p-2 rounded-full hover:bg-white/10"
              aria-label="Reset zoom"
            ><RotateCcw className="w-5 h-5" /></button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10"
              aria-label="Close"
            ><X className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Prev / Next */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-3 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white z-10"
              aria-label="Previous image"
            ><ChevronLeft className="w-6 h-6" /></button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-3 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white z-10"
              aria-label="Next image"
            ><ChevronRight className="w-6 h-6" /></button>
          </>
        )}

        {/* Image */}
        <div
          className="w-full h-full flex items-center justify-center overflow-auto p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={src}
            alt={`Image ${index + 1}`}
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            style={{
              transform: `scale(${zoom})`,
              transition: 'transform 0.15s ease-out',
              maxWidth: '95%',
              maxHeight: '85vh',
              objectFit: 'contain',
              userSelect: 'none',
            }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}