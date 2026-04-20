const mongoose = require('mongoose');

// Tracks every search for analytics, trending, and future ML recommendations.
const searchLogSchema = new mongoose.Schema(
  {
    query: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 200,
    },
    resultsCount: { type: Number, default: 0 },
    filters: { type: mongoose.Schema.Types.Mixed },
    sort: { type: String },
    page: { type: Number, default: 1 },
    responseTimeMs: { type: Number },
    cacheHit: { type: Boolean, default: false },
    cacheLayer: { type: String },  // 'L1' | 'L2' | null
    userId: { type: String },       // optional — tie to auth later
    ip: { type: String },
    userAgent: { type: String },
  },
  {
    timestamps: true,
    // Disable versioning — high-write, read-rarely collection
    versionKey: false,
  }
);

searchLogSchema.index({ query: 1 });
searchLogSchema.index({ createdAt: -1 });

// Auto-delete logs older than 30 days (TTL index)
searchLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model('SearchLog', searchLogSchema);
