import { Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Sita Rai',
    location: 'Kathmandu',
    quote: 'Booking was effortless and the hotel exceeded our expectations. Will definitely use this again!',
  },
  {
    name: 'Bibek Thapa',
    location: 'Pokhara',
    quote: 'Great range of hotels and honest reviews helped me pick the perfect stay for my trip.',
  },
  {
    name: 'Anjali Koirala',
    location: 'Chitwan',
    quote: 'Customer support was quick to respond when I had a question about my booking.',
  },
];

const Testimonials = () => (
  <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
    <h2 className="text-center text-2xl font-semibold text-gray-900 dark:text-gray-100">What our guests say</h2>
    <div className="mt-10 grid gap-6 md:grid-cols-3">
      {TESTIMONIALS.map((t) => (
        <div key={t.name} className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <Quote className="h-6 w-6 text-brand-500" />
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">&ldquo;{t.quote}&rdquo;</p>
          <p className="mt-4 text-sm font-semibold text-gray-900 dark:text-gray-100">{t.name}</p>
          <p className="text-xs text-gray-400">{t.location}</p>
        </div>
      ))}
    </div>
  </section>
);

export default Testimonials;
