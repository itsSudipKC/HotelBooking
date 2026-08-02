const SECTIONS = [
  {
    title: '1. Acceptance of terms',
    body: 'By creating an account or booking a hotel through StayNepal, you agree to these Terms & Conditions. If you do not agree, please do not use the platform.',
  },
  {
    title: '2. Accounts',
    body: 'You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. Guests, Hotel Owners, and Admins each operate under separate roles with different permissions.',
  },
  {
    title: '3. Bookings and payments',
    body: 'A booking is confirmed only after successful payment through a supported gateway (Stripe, eSewa, or Khalti). Prices, availability, and cancellation policies are set by individual hotel owners and shown before checkout.',
  },
  {
    title: '4. Hotel listings',
    body: 'Hotel Owners are responsible for the accuracy of their listings. All new listings and material changes are reviewed by our Admin team before appearing publicly.',
  },
  {
    title: '5. Cancellations and refunds',
    body: "Cancellation and refund terms vary by hotel and are displayed on the booking page. Refunds, where applicable, are processed back to the original payment method.",
  },
  {
    title: '6. Reviews',
    body: 'Reviews must reflect a genuine stay and may not contain abusive, misleading, or unlawful content. We reserve the right to remove reviews that violate these guidelines.',
  },
  {
    title: '7. Limitation of liability',
    body: 'StayNepal acts as an intermediary between guests and hotel owners. We are not liable for the condition of a property, the conduct of hotel staff, or events outside our reasonable control.',
  },
  {
    title: '8. Changes to these terms',
    body: 'We may update these Terms & Conditions periodically. Continued use of the platform after changes are posted constitutes acceptance of the updated terms.',
  },
];

const TermsPage = () => (
  <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
    <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Terms &amp; Conditions</h1>
    <p className="mt-2 text-sm text-gray-400">Last updated: January 2026</p>

    <div className="mt-8 flex flex-col gap-8">
      {SECTIONS.map((section) => (
        <section key={section.title}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{section.title}</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{section.body}</p>
        </section>
      ))}
    </div>
  </div>
);

export default TermsPage;
