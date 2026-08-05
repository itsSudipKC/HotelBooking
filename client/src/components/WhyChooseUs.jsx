import { ShieldCheck, Wallet, Clock, Headphones } from 'lucide-react';

const REASONS = [
  {
    icon: ShieldCheck,
    title: 'Verified Hotels',
    description: 'Every property is reviewed and approved by our team before it goes live.',
  },
  {
    icon: Wallet,
    title: 'Best Price Guarantee',
    description: 'Transparent pricing with no hidden fees, ever.',
  },
  {
    icon: Clock,
    title: 'Instant Confirmation',
    description: 'Get your booking confirmed in seconds, not days.',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Our support team is here to help whenever you need it.',
  },
];

const WhyChooseUs = () => (
  <section className="bg-white py-16">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <h2 className="text-center text-2xl font-semibold text-gray-900">Why choose us</h2>
      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {REASONS.map(({ icon: Icon, title, description }) => (
          <div key={title} className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600">
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-gray-900">{title}</h3>
            <p className="mt-2 text-sm text-gray-500">{description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default WhyChooseUs;
