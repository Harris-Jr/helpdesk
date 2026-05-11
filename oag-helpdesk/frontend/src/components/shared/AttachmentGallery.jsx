import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import ImageLightbox from './ImageLightbox';

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|bmp)$/i;

/**
 * Renders ticket attachments. Images open in-app lightbox (no download).
 * Non-image files render as a small link.
 */
export default function AttachmentGallery({ urls = [] }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  if (!urls?.length) return null;

  const images = urls.filter((u) => IMAGE_EXT.test(u));
  const others = urls.filter((u) => !IMAGE_EXT.test(u));

  return (
    <>
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((url, i) => (
            <button
              key={url + i}
              type="button"
              onClick={() => { setStartIndex(i); setLightboxOpen(true); }}
              className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50 hover:ring-2 hover:ring-green-600 transition"
            >
              <img
                src={url}
                alt={`Attachment ${i + 1}`}
                className="w-full h-full object-cover"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
              />
            </button>
          ))}
        </div>
      )}

      {others.length > 0 && (
        <div className="mt-2 space-y-1">
          {others.map((url, i) => (
            <div key={url + i} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
              <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="text-green-700 hover:underline truncate flex-1"
              >
                {decodeURIComponent(url.split('/').pop())}
              </a>
            </div>
          ))}
        </div>
      )}

      <ImageLightbox
        images={images}
        startIndex={startIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}