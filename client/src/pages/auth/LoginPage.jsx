import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { getErrorMessage } from '../../utils/getErrorMessage';

const ROLE_TITLES = {
  user: 'Log in to your account',
  owner: 'Hotel Owner Login',
  admin: 'Admin Login',
};

const LoginPage = ({ role }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const { login } = useAuth(role);
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await login(form);
      toast.success('Logged in successfully.');
      navigate(`/${role}/dashboard`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout role={role} title={ROLE_TITLES[role]}>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <TextField
          id="email"
          name="email"
          type="email"
          label="Email address"
          value={form.email}
          onChange={handleChange}
          required
        />
        <TextField
          id="password"
          name="password"
          type="password"
          label="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <div className="flex justify-end">
          <Link to={`/${role}/forgot-password`} className="text-xs font-medium text-brand-600 hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" loading={submitting}>
          Log in
        </Button>
      </form>
      {role !== 'admin' && (
        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <Link to={`/${role}/register`} className="font-medium text-brand-600 hover:underline">
            Register
          </Link>
        </p>
      )}
    </AuthLayout>
  );
};

export default LoginPage;
