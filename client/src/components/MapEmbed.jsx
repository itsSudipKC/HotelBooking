import { MapPin } from 'lucide-react';

const MapEmbed = ({ address, lat, lng }) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const query = encodeURIComponent(address || (lat && lng ? `${lat},${lng}` : ''));

  if (!apiKey || !query) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 text-center">
        <MapPin className="h-8 w-8 text-gray-400" />
        <p className="text-sm text-gray-500">{address || 'Location unavailable'}</p>
        <p className="text-xs text-gray-400">Map preview requires a Google Maps API key</p>
      </div>
    );
  }

  return (
    <iframe
      title="Hotel location"
      className="aspect-video w-full rounded-xl border-0"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      src={`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${query}`}
      allowFullScreen
    />
  );
};

export default MapEmbed;
