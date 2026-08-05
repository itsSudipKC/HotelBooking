import Accordion from '../../components/Accordion';

const FAQS = [
  {
    question: 'How do I book a hotel?',
    answer: 'Search for a hotel, choose your room, sign in or create an account, and confirm your booking with payment.',
  },
  {
    question: 'Can I cancel my booking?',
    answer: 'Yes, cancellation policies vary by hotel and are shown on the booking page before you confirm.',
  },
  {
    question: 'What payment methods are supported?',
    answer: 'We support Stripe, eSewa, and Khalti for secure online payments.',
  },
  {
    question: 'How do I list my hotel on StayNepal?',
    answer: 'Register as a Hotel Owner, add your property details, and submit it for admin approval.',
  },
  {
    question: 'Is my payment information secure?',
    answer:
      'Yes, all payments are processed through secure, PCI-compliant payment gateways. We never store your card details.',
  },
];

const FaqPage = () => (
  <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
    <h1 className="text-3xl font-semibold text-gray-900">Frequently Asked Questions</h1>
    <div className="mt-8">
      <Accordion items={FAQS} />
    </div>
  </div>
);

export default FaqPage;
