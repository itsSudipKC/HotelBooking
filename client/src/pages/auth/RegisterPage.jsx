import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import * as authService from '../../services/authService';
import { getErrorMessage, getFieldErrors } from '../../utils/getErrorMessage';
import { useToast } from '../../hooks/useToast';

const ROLE_TITLES = {
  user: 'Create your account',
  owner: 'Register as a Hotel Owner',
};

const RegisterPage = ({ role }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFieldErrors({});

    try {
      await authService.registerAccount(role, form);
      toast.success('Registration successful! Please check your email to verify your account.');
      navigate(`/${role}/login`);
    } catch (err) {
      const errors = getFieldErrors(err);
      if (errors.length > 0) {
        setFieldErrors(Object.fromEntries(errors.map((fe) => [fe.field, fe.message])));
      }
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout role={role} title={ROLE_TITLES[role]} subtitle="It only takes a minute.">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <TextField
          id="name"
          name="name"
          label="Full name"
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
          id="password"
          name="password"
          type="password"
          label="Password"
          value={form.password}
          onChange={handleChange}
          error={fieldErrors.password}
          required
        />
        <Button type="submit" loading={submitting} className="mt-2">
          Create account
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link to={`/${role}/login`} className="font-medium text-brand-600 hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default RegisterPage;
