import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { useAdminSession } from '../../hooks/useAdminSession';
import { getErrorMessage, getFieldErrors } from '../../utils/getErrorMessage';
import { createOwner } from '../../services/adminOwnerService';

const AddOwnerPage = () => {
  const { account, accessToken, toast, handleLogout } = useAdminSession();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', businessName: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFieldErrors({});

    try {
      const res = await createOwner(accessToken, form);
      toast.success('Owner account created — a temporary password was emailed to them.');
      navigate(`/admin/owners/${res.data.owner._id}`);
    } catch (err) {
      const errors = getFieldErrors(err);
      if (errors.length > 0) setFieldErrors(Object.fromEntries(errors.map((fe) => [fe.field, fe.message])));
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout role="admin" accountName={account?.name} onLogout={handleLogout}>
      <Link to="/admin/owners" className="text-sm font-medium text-brand-600 hover:underline">
        ← Back to owners
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-gray-900">Add Hotel Owner</h1>
      <p className="mt-1 text-sm text-gray-500">
        A temporary password is generated and emailed to the owner — they can set their own via "Forgot password".
      </p>

      <form className="mt-6 flex max-w-md flex-col gap-4" onSubmit={handleSubmit}>
        <TextField
          id="name"
          name="name"
          label="Owner name"
          value={form.name}
          onChange={handleChange}
          error={fieldErrors.name}
          required
        />
        <TextField
          id="email"
          name="email"
          type="email"
          label="Email address"
          value={form.email}
          onChange={handleChange}
          error={fieldErrors.email}
          required
        />
        <TextField
          id="phone"
          name="phone"
          label="Phone number (optional)"
          value={form.phone}
          onChange={handleChange}
          error={fieldErrors.phone}
        />
        <TextField
          id="businessName"
          name="businessName"
          label="Business name (optional)"
          value={form.businessName}
          onChange={handleChange}
          error={fieldErrors.businessName}
        />
        <Button type="submit" loading={submitting} className="mt-2 self-start">
          Create owner account
        </Button>
      </form>
    </DashboardLayout>
  );
};

export default AddOwnerPage;
