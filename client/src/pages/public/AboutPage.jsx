const STATS = [
  { label: 'Hotels listed', value: '500+' },
  { label: 'Cities covered', value: '20+' },
  { label: 'Happy guests', value: '10,000+' },
];

const AboutPage = () => (
  <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
    <h1 className="text-3xl font-semibold text-gray-900">About StayNepal</h1>
    <p className="mt-4 text-gray-600">
      StayNepal is a hotel booking platform built to make finding and reserving the right place to stay simple,
      transparent, and reliable. We connect travelers with verified hotel owners across Nepal, from boutique city
      stays to lakeside retreats and jungle resorts.
    </p>
    <p className="mt-4 text-gray-600">
      Every hotel listed on StayNepal is reviewed by our team before it goes live, and every booking is backed by
      secure payments and responsive customer support. Whether you&apos;re travelling for business or leisure, we
      aim to take the guesswork out of finding your next stay.
    </p>
    <div className="mt-10 grid gap-6 sm:grid-cols-3">
      {STATS.map((stat) => (
        <div key={stat.label} className="rounded-xl border border-gray-200 p-6 text-center">
          <p className="text-2xl font-bold text-brand-600">{stat.value}</p>
          <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
        </div>
      ))}
    </div>
  </div>
);

export default AboutPage;
