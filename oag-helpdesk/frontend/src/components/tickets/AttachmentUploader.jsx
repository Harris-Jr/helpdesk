import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud, Camera, X } from 'lucide-react';
import { UploadFile } from '@/api/functions';

/**
 * Dual-mode uploader:
 *  - "Upload from device" (file picker)
 *  - "Take photo" (camera via capture="environment")
 *
 * Only accepts JPG / PNG / WebP for images; also permits PDF/docs via file picker.
 */
export default function AttachmentUploader({ attachments, setAttachments, uploading, setUploading, setError }) {
  const fileRef = useRef(null);
  const cameraRef = useRef(null);

  const handleFiles = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const uploaded = await Promise.all(
        Array.from(files).map(async (f) => {
          const { file_url } = await UploadFile({ file: f });
          return file_url;
        })
      );
      setAttachments((p) => [...p, ...uploaded]);
    } catch {
      setError?.('File upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const isImage = (url) => /\.(jpe?g|png|webp|gif)$/i.test(url);

  return (
    <div>
      <div className="border-2 border-dashed border-green-300 bg-green-50/40 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,application/pdf,.doc,.docx,.txt"
            onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
            className="hidden"
          />
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="border-green-600 text-green-700 hover:bg-green-50"
          >
            <UploadCloud className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload from device'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => cameraRef.current?.click()}
            disabled={uploading}
            className="border-green-600 text-green-700 hover:bg-green-50"
          >
            <Camera className="w-4 h-4 mr-2" />
            Take photo
          </Button>
        </div>
        <p className="text-xs text-gray-500 text-center mt-2">
          JPG, PNG, WebP accepted. Also supports PDF, DOC, TXT.
        </p>
      </div>

      {attachments.length > 0 && (
        <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
          {attachments.map((url, i) => (
            <div key={url + i} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
              {isImage(url) ? (
                <img
                  src={url}
                  alt={`Preview ${i + 1}`}
                  className="w-full h-full object-cover"
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-600 p-2 text-center break-all">
                  {decodeURIComponent(url.split('/').pop())}
                </div>
              )}
              <button
                type="button"
                onClick={() => setAttachments((a) => a.filter((_, x) => x !== i))}
                className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-1"
                aria-label="Remove attachment"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
