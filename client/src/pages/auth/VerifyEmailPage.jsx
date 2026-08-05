import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import Spinner from '../../components/Spinner';
import * as authService from '../../services/authService';
import { getErrorMessage } from '../../utils/getErrorMessage';

const VerifyEmailPage = ({ role }) => {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    authService
      .verifyEmail(role, token)
      .then((res) => {
        if (cancelled) return;
        setStatus('success');
        setMessage(res.message);
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus('error');
        setMessage(getErrorMessage(err));
      });

    return () => {
      cancelled = true;
    };
  }, [role, token]);

  return (
    <AuthLayout role={role} title="Email verification">
      <div className="flex flex-col items-center gap-4 text-center">
        {status === 'verifying' && (
          <>
            <Spinner />
            <p className="text-sm text-gray-500">Verifying your email...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <p className="text-sm text-emerald-600">{message}</p>
            <Link to={`/${role}/login`} className="text-sm font-medium text-brand-600 hover:underline">
              Continue to login
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <p className="text-sm text-red-600">{message}</p>
            <Link to={`/${role}/login`} className="text-sm font-medium text-brand-600 hover:underline">
              Back to login
            </Link>
          </>
        )}
      </div>
    </AuthLayout>
  );
};

export default VerifyEmailPage;
