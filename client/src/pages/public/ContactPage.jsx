import { useState } from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { useToast } from '../../hooks/useToast';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { submitContactMessage } from '../../services/contactService';

const EMPTY_FORM = { name: '', email: '', subject: '', message: '' };

const ContactPage = () => {
  const toast = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await submitContactMessage(form);
      toast.success('Your message has been sent. We will get back to you soon.');
      setForm(EMPTY_FORM);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Contact Us</h1>
      <p className="mt-3 text-gray-600 dark:text-gray-300">
        Have a question or need help with a booking? Send us a message.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <TextField id="name" name="name" label="Full name" value={form.name} onChange={handleChange} required />
          <TextField
            id="email"
            name="email"
            type="email"
            label="Email address"
            value={form.email}
            onChange={handleChange}
            required
          />
          <TextField id="subject" name="subject" label="Subject" value={form.subject} onChange={handleChange} required />
          <div className="flex flex-col gap-1">
            <label htmlFor="message" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              value={form.message}
              onChange={handleChange}
              required
              className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>
          <Button type="submit" loading={submitting} className="self-start">
            Send message
          </Button>
        </form>

        <div className="flex flex-col gap-4 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 shrink-0 text-brand-600" />
            <p>Thamel, Kathmandu, Nepal</p>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 shrink-0 text-brand-600" />
            <p>+977-1-4123456</p>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 shrink-0 text-brand-600" />
            <p>support@staynepal.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
