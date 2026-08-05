import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { useOwnerSession } from '../../hooks/useOwnerSession';
import { getErrorMessage, getFieldErrors } from '../../utils/getErrorMessage';
import * as ownerRoomService from '../../services/ownerRoomService';

const AMENITIES = ['AC', 'TV', 'WiFi', 'Balcony', 'Mini Bar', 'Room Service'];

const emptyForm = () => ({ type: '', price: '', capacity: '2', totalRooms: '1', amenities: [], imageUrls: [''] });

const RoomFormPage = () => {
  const { hotelId, id } = useParams();
  const isEdit = Boolean(id);
  const location = useLocation();
  const navigate = useNavigate();
  const { account, accessToken, toast, handleLogout } = useOwnerSession();

  const editingRoom = isEdit ? location.state?.room : null;
  const parentHotelId = isEdit ? location.state?.hotelId : hotelId;

  const [form, setForm] = useState(() =>
    editingRoom
      ? {
          type: editingRoom.type,
          price: String(editingRoom.price),
          capacity: String(editingRoom.capacity),
          totalRooms: String(editingRoom.totalRooms),
          amenities: editingRoom.amenities || [],
          imageUrls: editingRoom.images?.length ? editingRoom.images.map((img) => img.url) : [''],
        }
      : emptyForm()
  );
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (isEdit && !editingRoom) {
    return (
      <DashboardLayout role="owner" accountName={account?.name} onLogout={handleLogout}>
        <p className="text-sm text-gray-500">
          Open this page from a hotel&apos;s room list to edit it —{' '}
          <Link to="/owner/hotels" className="text-brand-600 hover:underline">
            go to My Hotels
          </Link>
          .
        </p>
      </DashboardLayout>
    );
  }

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const toggleAmenity = (amenity) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const setImageUrl = (index, value) =>
    setForm((prev) => ({ ...prev, imageUrls: prev.imageUrls.map((u, i) => (i === index ? value : u)) }));
  const addImageField = () => setForm((prev) => ({ ...prev, imageUrls: [...prev.imageUrls, ''] }));
  const removeImageField = (index) =>
    setForm((prev) => ({ ...prev, imageUrls: prev.imageUrls.filter((_, i) => i !== index) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFieldErrors({});

    const payload = {
      ...form,
      price: Number(form.price),
      capacity: Number(form.capacity),
      totalRooms: Number(form.totalRooms),
    };

    try {
      if (isEdit) {
        await ownerRoomService.updateRoom(accessToken, id, payload);
        toast.success('Room updated.');
      } else {
        await ownerRoomService.createRoom(accessToken, parentHotelId, payload);
        toast.success('Room added.');
      }
      navigate(`/owner/hotels/${parentHotelId}`);
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
      <Link to={`/owner/hotels/${parentHotelId}`} className="text-sm font-medium text-brand-600 hover:underline">
        ← Back to hotel
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-gray-900">{isEdit ? 'Edit Room' : 'Add Room'}</h1>

      <form className="mt-6 flex max-w-lg flex-col gap-4" onSubmit={handleSubmit}>
        <TextField
          id="type"
          name="type"
          label="Room type"
          placeholder="e.g. Deluxe Room"
          value={form.type}
          onChange={handleChange}
          error={fieldErrors.type}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <TextField
            id="price"
            name="price"
            type="number"
            min="0"
            label="Price per night (Rs.)"
            value={form.price}
            onChange={handleChange}
            error={fieldErrors.price}
            required
          />
          <TextField
            id="capacity"
            name="capacity"
            type="number"
            min="1"
            label="Capacity (guests)"
            value={form.capacity}
            onChange={handleChange}
            error={fieldErrors.capacity}
            required
          />
        </div>
        <TextField
          id="totalRooms"
          name="totalRooms"
          type="number"
          min="1"
          label="Number of rooms of this type"
          value={form.totalRooms}
          onChange={handleChange}
          error={fieldErrors.totalRooms}
          required
        />

        <div>
          <h2 className="text-sm font-semibold text-gray-900">Amenities</h2>
          <div className="mt-3 flex flex-wrap gap-3">
            {AMENITIES.map((amenity) => (
              <label
                key={amenity}
                className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm transition ${
                  form.amenities.includes(amenity) ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600'
                }`}
              >
                <input type="checkbox" className="hidden" checked={form.amenities.includes(amenity)} onChange={() => toggleAmenity(amenity)} />
                {amenity}
              </label>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-gray-900">Images</h2>
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
            <button type="button" onClick={addImageField} className="flex w-fit items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline">
              <Plus className="h-4 w-4" /> Add another image
            </button>
          </div>
        </div>

        <Button type="submit" loading={submitting} className="self-start">
          {isEdit ? 'Save changes' : 'Add room'}
        </Button>
      </form>
    </DashboardLayout>
  );
};

export default RoomFormPage;
