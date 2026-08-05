import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import * as authService from '../../services/authService';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { useToast } from '../../hooks/useToast';

const ResetPasswordPage = ({ role }) => {
  const { token } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      await authService.resetPassword(role, token, { password });
      toast.success('Password reset successful. Please log in with your new password.');
      navigate(`/${role}/login`);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout role={role} title="Choose a new password">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <TextField
          id="password"
          name="password"
          type="password"
          label="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errorMessage}
          required
        />
        <Button type="submit" loading={submitting}>
          Reset password
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-500">
        <Link to={`/${role}/login`} className="font-medium text-brand-600 hover:underline">
          Back to login
        </Link>
      </p>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
