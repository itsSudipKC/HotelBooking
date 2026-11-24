import { MapPin } from 'lucide-react';

const MapEmbed = ({ address }) => {
  const query = encodeURIComponent(address || '');

  if (!address || !address.trim()) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 text-center">
        <MapPin className="h-8 w-8 text-gray-400" />
        <p className="text-sm text-gray-500">Location unavailable</p>
      </div>
    );
  }

  return (
    <iframe
      title="Hotel location"
      className="aspect-video w-full rounded-xl border-0"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      src={`https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
      allowFullScreen
    />
  );
};

export default MapEmbed;
