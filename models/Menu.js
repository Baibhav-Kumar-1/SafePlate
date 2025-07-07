import mongoose from 'mongoose';

const dishSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  price: {
    amount: {
      type: Number,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
  },
  ingredients: [{
    name: {
      type: String,
      required: true,
      trim: true,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    allergens: [{
      type: String,
      trim: true,
    }],
  }],
  category: {
    type: String,
    trim: true,
  },
  allergenRatings: [{
    allergen: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ['none', 'low', 'medium', 'high'],
      required: true,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
  }],
  overallRating: {
    type: String,
    enum: ['green', 'yellow', 'red'],
    required: true,
  },
});

const menuSchema = new mongoose.Schema({
  restaurantName: {
    type: String,
    required: true,
    trim: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  ocrData: {
    rawText: String,
    confidence: Number,
    processedAt: Date,
  },
  dishes: [dishSchema],
  metadata: {
    menuType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'all-day', 'special'],
    },
    cuisine: String,
    scannedAt: {
      type: Date,
      default: Date.now,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
        validate: {
          validator: function(v) {
            return v.length === 2;
          },
          message: 'Location must be [longitude, latitude]'
        }
      }
    },
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'error'],
    default: 'processing',
  },
  feedbackCount: {
    type: Number,
    default: 0,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes
menuSchema.index({ userId: 1, 'metadata.scannedAt': -1 });
menuSchema.index({ restaurantName: 'text' });
menuSchema.index({ 'dishes.name': 'text' });
menuSchema.index({ 'metadata.location': '2dsphere' });

// Instance methods
menuSchema.methods.getDishByName = function(dishName) {
  return this.dishes.find(dish => 
    dish.name.toLowerCase() === dishName.toLowerCase()
  );
};

menuSchema.methods.updateDishRatings = async function(userAllergens) {
  for (const dish of this.dishes) {
    const ratings = [];
    let maxSeverity = 'none';
    
    for (const ingredient of dish.ingredients) {
      for (const allergen of userAllergens) {
        if (ingredient.allergens.includes(allergen.name)) {
          ratings.push({
            allergen: allergen.name,
            severity: allergen.severity,
            confidence: ingredient.confidence,
          });
          
          if (
            allergen.severity === 'high' ||
            (allergen.severity === 'medium' && maxSeverity !== 'high') ||
            (allergen.severity === 'low' && maxSeverity === 'none')
          ) {
            maxSeverity = allergen.severity;
          }
        }
      }
    }
    
    dish.allergenRatings = ratings;
    dish.overallRating = maxSeverity === 'high' ? 'red' :
                        maxSeverity === 'medium' ? 'yellow' :
                        maxSeverity === 'low' ? 'yellow' : 'green';
  }
  
  await this.save();
};

export const Menu = mongoose.models.Menu || mongoose.model('Menu', menuSchema);