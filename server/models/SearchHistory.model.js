import mongoose from 'mongoose';

const searchHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    keyword: {
      type: String,
      trim: true,
      default: '',
    },
    filters: {
      city: String,
      country: String,
      minPrice: Number,
      maxPrice: Number,
      amenities: [String],
      roomType: String,
      starRating: Number,
      guests: Number,
      checkIn: Date,
      checkOut: Date,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);

export default SearchHistory;
