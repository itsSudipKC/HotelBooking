import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import ImageDropzone from '../../components/ImageDropzone';
import { useUserSession } from '../../hooks/useUserSession';
import { getErrorMessage, getFieldErrors } from '../../utils/getErrorMessage';
import * as userProfileService from '../../services/userProfileService';

const ProfilePage = () => {
  const { account, accessToken, toast, handleLogout, updateAccount } = useUserSession();

  const [profileForm, setProfileForm] = useState({
    name: account?.name || '',
    phone: account?.phone || '',
    email: account?.email || '',
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [savingPassword, setSavingPassword] = useState(false);

  const avatarValue = account?.avatar?.url ? [{ url: account.avatar.url, publicId: account.avatar.publicId }] : [];

  const handleAvatarChange = async ([img]) => {
    if (!img) return;
    try {
      const res = await userProfileService.updateAvatar(accessToken, img);
      updateAccount(res.data.account);
      toast.success('Profile picture updated.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleProfileChange = (e) => setProfileForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileErrors({});
    try {
      const res = await userProfileService.updateProfile(accessToken, profileForm);
      updateAccount(res.data.account);
      toast.success(res.message);
    } catch (err) {
      const errors = getFieldErrors(err);
      if (errors.length > 0) setProfileErrors(Object.fromEntries(errors.map((fe) => [fe.field, fe.message])));
      toast.error(getErrorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = (e) => setPasswordForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }
    setSavingPassword(true);
    setPasswordErrors({});
    try {
      await userProfileService.changePassword(accessToken, passwordForm);
      toast.success('Password changed. Please log in again.');
      await handleLogout();
    } catch (err) {
      const errors = getFieldErrors(err);
      if (errors.length > 0) setPasswordErrors(Object.fromEntries(errors.map((fe) => [fe.field, fe.message])));
      toast.error(getErrorMessage(err));
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <DashboardLayout role="user" accountName={account?.name} onLogout={handleLogout}>
      <Link to="/user/dashboard" className="text-sm font-medium text-brand-600 hover:underline">
        ← Back to dashboard
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-gray-900">Profile Settings</h1>

      <div className="mt-6 flex max-w-lg flex-col gap-10">
        <section>
          <ImageDropzone
            accessToken={accessToken}
            value={avatarValue}
            onChange={handleAvatarChange}
            multiple={false}
            label="Profile picture"
          />
        </section>

        <section>
          <h2 className="text-sm font-semibold text-gray-900">Account details</h2>
          <form className="mt-4 flex flex-col gap-4" onSubmit={handleProfileSubmit}>
            <TextField
              id="name"
              name="name"
              label="Full name"
              value={profileForm.name}
              onChange={handleProfileChange}
              error={profileErrors.name}
              required
            />
            <TextField
              id="phone"
              name="phone"
              label="Phone number"
              value={profileForm.phone}
              onChange={handleProfileChange}
              error={profileErrors.phone}
            />
            <TextField
              id="email"
              name="email"
              type="email"
              label="Email address"
              value={profileForm.email}
              onChange={handleProfileChange}
              error={profileErrors.email}
              required
            />
            {profileForm.email !== account?.email && (
              <p className="text-xs text-amber-600">
                Changing your email will require verifying the new address before you can log in again.
              </p>
            )}
            <Button type="submit" loading={savingProfile} className="self-start">
              Save changes
            </Button>
          </form>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-gray-900">Change password</h2>
          <form className="mt-4 flex flex-col gap-4" onSubmit={handlePasswordSubmit}>
            <TextField
              id="currentPassword"
              name="currentPassword"
              type="password"
              label="Current password"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              error={passwordErrors.currentPassword}
              required
            />
            <TextField
              id="newPassword"
              name="newPassword"
              type="password"
              label="New password"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              error={passwordErrors.newPassword}
              required
            />
            <TextField
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="Confirm new password"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              error={passwordErrors.confirmPassword}
              required
            />
            <Button type="submit" variant="secondary" loading={savingPassword} className="self-start">
              Change password
            </Button>
          </form>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
