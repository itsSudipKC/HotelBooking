import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const ImageGallery = ({ images = [], alt }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!images.length) {
    return <div className="aspect-video w-full rounded-xl bg-gray-100 dark:bg-gray-800" />;
  }

  const goTo = (delta) => {
    setActiveIndex((current) => (current + delta + images.length) % images.length);
  };

  return (
    <div>
      <button type="button" onClick={() => setLightboxOpen(true)} className="block w-full overflow-hidden rounded-xl">
        <img src={images[activeIndex].url} alt={alt} className="aspect-video w-full object-cover" />
      </button>

      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6">
          {images.map((img, index) => (
            <button
              key={img.url + index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`aspect-square overflow-hidden rounded-lg border-2 transition ${
                index === activeIndex ? 'border-brand-500' : 'border-transparent'
              }`}
            >
              <img src={img.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={() => goTo(-1)}
            className="absolute left-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <img src={images[activeIndex].url} alt={alt} className="max-h-[85vh] max-w-4xl rounded-lg object-contain" />
          <button
            type="button"
            onClick={() => goTo(1)}
            className="absolute right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
