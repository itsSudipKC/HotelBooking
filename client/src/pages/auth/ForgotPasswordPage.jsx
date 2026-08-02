import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import * as authService from '../../services/authService';
import { getErrorMessage } from '../../utils/getErrorMessage';

const ForgotPasswordPage = ({ role }) => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      await authService.forgotPassword(role, { email });
      setSent(true);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      role={role}
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset link."
    >
      {sent ? (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          If an account with that email exists, a reset link has been sent. Please check your inbox.
        </p>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <TextField
            id="email"
            name="email"
            type="email"
            label="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errorMessage}
            required
          />
          <Button type="submit" loading={submitting}>
            Send reset link
          </Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <Link to={`/${role}/login`} className="font-medium text-brand-600 hover:underline">
          Back to login
        </Link>
      </p>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
