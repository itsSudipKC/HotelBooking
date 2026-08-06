import { useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { getErrorMessage } from '../utils/getErrorMessage';
import { uploadImage } from '../services/uploadService';

// Drag-and-drop local file upload — no Cloudinary. Works for both the
// multi-image hotel/room galleries and the single-image profile avatar
// (multiple=false switches to a circular preview instead of a thumbnail grid).
const ImageDropzone = ({ accessToken, value = [], onChange, multiple = true, label = 'Images' }) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);
  const toast = useToast();

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []).filter((f) => f.type.startsWith('image/'));
    if (!files.length) return;

    const toUpload = multiple ? files : [files[0]];
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of toUpload) {
        const res = await uploadImage(accessToken, file);
        uploaded.push({ url: res.data.url, publicId: res.data.publicId });
      }
      onChange(multiple ? [...value, ...uploaded] : uploaded);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const openBrowser = () => inputRef.current?.click();

  const handleInputChange = (e) => {
    handleFiles(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const removeAt = (index) => onChange(value.filter((_, i) => i !== index));

  const fileInput = (
    <input ref={inputRef} type="file" accept="image/*" multiple={multiple} className="hidden" onChange={handleInputChange} />
  );

  if (!multiple && value[0]) {
    return (
      <div>
        {label && <p className="text-sm font-medium text-gray-700">{label}</p>}
        <div className="group relative mt-2 h-24 w-24 cursor-pointer" onClick={openBrowser}>
          <img src={value[0].url} alt="" className="h-24 w-24 rounded-full border border-gray-200 object-cover" />
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition group-hover:opacity-100">
            {uploading ? <Loader2 className="h-5 w-5 animate-spin text-white" /> : <ImagePlus className="h-5 w-5 text-white" />}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeAt(0);
            }}
            className="absolute -right-1 -top-1 rounded-full bg-white p-1 text-gray-500 shadow hover:text-red-600"
            aria-label="Remove photo"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          {fileInput}
        </div>
      </div>
    );
  }

  return (
    <div>
      {label && <p className="text-sm font-medium text-gray-700">{label}</p>}
      <div
        onDragOver={handleDragOver}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={openBrowser}
        className={`mt-2 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition ${
          dragOver ? 'border-brand-500 bg-brand-50' : 'border-gray-300 hover:border-brand-400'
        }`}
      >
        {fileInput}
        {uploading ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
            <p className="text-sm text-gray-500">Uploading...</p>
          </>
        ) : (
          <>
            <ImagePlus className="h-6 w-6 text-gray-400" />
            <p className="text-sm text-gray-500">
              Drag &amp; drop {multiple ? 'images' : 'an image'} here, or click to browse
            </p>
          </>
        )}
      </div>

      {multiple && value.length > 0 && (
        <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6">
          {value.map((img, index) => (
            <div key={img.publicId || img.url} className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200">
              <img src={img.url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeAt(index);
                }}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100"
                aria-label="Remove image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageDropzone;
