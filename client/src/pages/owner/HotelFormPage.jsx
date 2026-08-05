import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import Spinner from '../../components/Spinner';
import { useOwnerSession } from '../../hooks/useOwnerSession';
import { getErrorMessage, getFieldErrors } from '../../utils/getErrorMessage';
import * as ownerHotelService from '../../services/ownerHotelService';

const AMENITIES = ['WiFi', 'Parking', 'Swimming Pool', 'Restaurant', 'Gym', 'Room Service', 'Spa', 'Air Conditioning'];

const EMPTY_FORM = {
  name: '',
  description: '',
  category: '',
  starRating: '3',
  street: '',
  city: '',
  country: '',
  lat: '',
  lng: '',
  amenities: [],
  imageUrls: [''],
};

const HotelFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { account, accessToken, toast, handleLogout } = useOwnerSession();
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [wasReviewed, setWasReviewed] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit || !accessToken) return;
    ownerHotelService
      .getMyHotelById(accessToken, id)
      .then((res) => {
        const h = res.data.hotel;
        setForm({
          name: h.name,
          description: h.description,
          category: h.category || '',
          starRating: String(h.starRating || 3),
          street: h.address?.street || '',
          city: h.address?.city || '',
          country: h.address?.country || '',
          lat: h.location?.lat ?? '',
          lng: h.location?.lng ?? '',
          amenities: h.amenities || [],
          imageUrls: h.images?.length ? h.images.map((img) => img.url) : [''],
        });
        setWasReviewed(h.status === 'approved' || h.status === 'rejected');
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, id, accessToken]);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const toggleAmenity = (amenity) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const setImageUrl = (index, value) => {
    setForm((prev) => ({ ...prev, imageUrls: prev.imageUrls.map((u, i) => (i === index ? value : u)) }));
  };

  const addImageField = () => setForm((prev) => ({ ...prev, imageUrls: [...prev.imageUrls, ''] }));
  const removeImageField = (index) =>
    setForm((prev) => ({ ...prev, imageUrls: prev.imageUrls.filter((_, i) => i !== index) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFieldErrors({});

    const payload = { ...form, starRating: Number(form.starRating) };

    try {
      if (isEdit) {
        await ownerHotelService.updateHotel(accessToken, id, payload);
        toast.success(wasReviewed ? 'Hotel updated and resubmitted for review.' : 'Hotel updated.');
        navigate(`/owner/hotels/${id}`);
      } else {
        const res = await ownerHotelService.createHotel(accessToken, payload);
        toast.success('Hotel submitted for admin review.');
        navigate(`/owner/hotels/${res.data.hotel._id}`);
      }
    } catch (err) {
      const errors = getFieldErrors(err);
      if (errors.length > 0) setFieldErrors(Object.fromEntries(errors.map((fe) => [fe.field, fe.message])));
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout role="owner" accountName={account?.name} onLogout={handleLogout}>
      <Link to={isEdit ? `/owner/hotels/${id}` : '/owner/hotels'} className="text-sm font-medium text-brand-600 hover:underline">
        ← Back
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-gray-900">{isEdit ? 'Edit Hotel' : 'Add Hotel'}</h1>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <form className="mt-6 flex max-w-2xl flex-col gap-6" onSubmit={handleSubmit}>
          {isEdit && wasReviewed && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              Saving changes will resubmit this hotel for admin review.
            </p>
          )}

          <section className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-gray-900">Basic Information</h2>
            <TextField id="name" name="name" label="Hotel name" value={form.name} onChange={handleChange} error={fieldErrors.name} required />
            <div className="flex flex-col gap-1">
              <label htmlFor="description" className="text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={form.description}
                onChange={handleChange}
                required
                className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
              {fieldErrors.description && <span className="text-xs text-red-600">{fieldErrors.description}</span>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <TextField id="category" name="category" label="Category (optional)" placeholder="e.g. Boutique, Resort" value={form.category} onChange={handleChange} error={fieldErrors.category} />
              <div className="flex flex-col gap-1">
                <label htmlFor="starRating" className="text-sm font-medium text-gray-700">
                  Star rating
                </label>
                <select
                  id="starRating"
                  name="starRating"
                  value={form.starRating}
                  onChange={handleChange}
                  className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n} star{n === 1 ? '' : 's'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-gray-900">Location</h2>
            <TextField id="street" name="street" label="Street (optional)" value={form.street} onChange={handleChange} error={fieldErrors.street} />
            <div className="grid grid-cols-2 gap-4">
              <TextField id="city" name="city" label="City" value={form.city} onChange={handleChange} error={fieldErrors.city} required />
              <TextField id="country" name="country" label="Country" value={form.country} onChange={handleChange} error={fieldErrors.country} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <TextField id="lat" name="lat" type="number" step="any" label="Latitude (optional)" value={form.lat} onChange={handleChange} error={fieldErrors.lat} />
              <TextField id="lng" name="lng" type="number" step="any" label="Longitude (optional)" value={form.lng} onChange={handleChange} error={fieldErrors.lng} />
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-900">Amenities</h2>
            <div className="mt-3 flex flex-wrap gap-3">
              {AMENITIES.map((amenity) => (
                <label
                  key={amenity}
                  className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm transition ${
                    form.amenities.includes(amenity)
                      ? 'border-brand-500 bg-brand-50 text-brand-700'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  <input type="checkbox" className="hidden" checked={form.amenities.includes(amenity)} onChange={() => toggleAmenity(amenity)} />
                  {amenity}
                </label>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-900">Images</h2>
            <p className="mt-1 text-xs text-gray-400">Paste image URLs (Cloudinary upload lands in a later update).</p>
            <div className="mt-3 flex flex-col gap-2">
              {form.imageUrls.map((url, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setImageUrl(index, e.target.value)}
                    placeholder="https://..."
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                  {form.imageUrls.length > 1 && (
                    <button type="button" onClick={() => removeImageField(index)} className="p-2 text-gray-400 hover:text-red-600">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addImageField}
                className="flex w-fit items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline"
              >
                <Plus className="h-4 w-4" /> Add another image
              </button>
            </div>
          </section>

          <Button type="submit" loading={submitting} className="self-start">
            {isEdit ? 'Save changes' : 'Submit for review'}
          </Button>
        </form>
      )}
    </DashboardLayout>
  );
};

export default HotelFormPage;
