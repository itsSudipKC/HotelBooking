import StarRating from './StarRating';

const ReviewCard = ({ review }) => (
  <div className="rounded-lg border border-gray-200 p-4">
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
          {review.user?.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{review.user?.name || 'Guest'}</p>
          <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
      <StarRating rating={review.rating} showValue={false} size={14} />
    </div>
    {review.comment && <p className="mt-3 text-sm text-gray-600">{review.comment}</p>}
  </div>
);

export default ReviewCard;
