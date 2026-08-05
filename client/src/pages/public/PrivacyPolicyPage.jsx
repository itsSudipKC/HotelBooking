const SECTIONS = [
  {
    title: '1. Information we collect',
    body: 'When you create an account, book a hotel, or contact us, we collect information such as your name, email address, phone number, and booking details. Payment information is processed directly by our payment partners (Stripe, eSewa, Khalti) and is never stored on our servers.',
  },
  {
    title: '2. How we use your information',
    body: 'We use your information to process bookings, send confirmation and reminder emails, respond to support requests, and improve our platform. We do not sell your personal information to third parties.',
  },
  {
    title: '3. Information sharing',
    body: 'We share booking details with the relevant hotel owner so they can prepare for your stay. We may share information with payment processors solely to complete transactions.',
  },
  {
    title: '4. Data security',
    body: 'Passwords are hashed and never stored in plain text. Access tokens are kept in memory on your device, not in persistent storage, to reduce the risk of theft.',
  },
  {
    title: '5. Your choices',
    body: 'You can update your profile information, delete your account, or request a copy of your data at any time from your account settings or by contacting support.',
  },
  {
    title: '6. Changes to this policy',
    body: 'We may update this Privacy Policy from time to time. Continued use of StayNepal after changes are posted constitutes acceptance of the updated policy.',
  },
];

const PrivacyPolicyPage = () => (
  <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
    <h1 className="text-3xl font-semibold text-gray-900">Privacy Policy</h1>
    <p className="mt-2 text-sm text-gray-400">Last updated: January 2026</p>

    <div className="mt-8 flex flex-col gap-8">
      {SECTIONS.map((section) => (
        <section key={section.title}>
          <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">{section.body}</p>
        </section>
      ))}
    </div>
  </div>
);

export default PrivacyPolicyPage;
