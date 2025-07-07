import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  menuId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  dishId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  type: {
    type: String,
    enum: ['ocr_error', 'nlp_error', 'allergen_error', 'other'],
    required: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  suggestedCorrection: {
    originalText: String,
    correctedText: String,
    originalIngredients: [String],
    correctedIngredients: [String],
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'applied', 'rejected'],
    default: 'pending',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  reviewDetails: {
    reviewedAt: Date,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: String,
    actionTaken: String,
  },
  metadata: {
    browserInfo: String,
    deviceType: String,
    appVersion: String,
  },
}, {
  timestamps: true,
});

// Indexes
feedbackSchema.index({ menuId: 1, status: 1 });
feedbackSchema.index({ userId: 1, createdAt: -1 });
feedbackSchema.index({ type: 1, status: 1 });
feedbackSchema.index({ status: 1, priority: -1 });

// Static methods
feedbackSchema.statics.getPendingFeedback = function(filters = {}) {
  const query = { status: 'pending' };
  
  if (filters.type) {
    query.type = filters.type;
  }
  
  if (filters.priority) {
    query.priority = filters.priority;
  }
  
  if (filters.dateRange) {
    query.createdAt = {
      $gte: filters.dateRange.start,
      $lte: filters.dateRange.end,
    };
  }
  
  return this.find(query)
    .sort({ priority: -1, createdAt: 1 })
    .populate('userId', 'name email')
    .populate('menuId', 'restaurantName');
};

// Instance methods
feedbackSchema.methods.markAsReviewed = async function(reviewerId, action, notes = '') {
  this.status = action === 'apply' ? 'applied' : 
                action === 'reject' ? 'rejected' : 
                'reviewed';
                
  this.reviewDetails = {
    reviewedAt: new Date(),
    reviewedBy: reviewerId,
    notes: notes,
    actionTaken: action,
  };
  
  await this.save();
  
  // If feedback is applied, update the related menu
  if (this.status === 'applied') {
    const Menu = mongoose.model('Menu');
    const menu = await Menu.findById(this.menuId);
    
    if (menu) {
      const dish = menu.dishes.id(this.dishId);
      if (dish && this.suggestedCorrection) {
        if (this.suggestedCorrection.correctedText) {
          dish.name = this.suggestedCorrection.correctedText;
        }
        if (this.suggestedCorrection.correctedIngredients) {
          dish.ingredients = this.suggestedCorrection.correctedIngredients.map(name => ({
            name,
            confidence: 1, // Human-verified
            allergens: [], // Will be reprocessed by allergen service
          }));
        }
        await menu.save();
      }
    }
  }
  
  return this;
};

export const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);