import mongoose from 'mongoose';

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return emailRegex.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long']
  },
  allergens: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    severity: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: '{VALUE} is not a valid severity level'
      },
      default: 'medium'
    }
  }],
  preferences: {
    dietaryRestrictions: [String],
    notifications: {
      type: Boolean,
      default: true
    },
    language: {
      type: String,
      default: 'en',
      enum: {
        values: ['en', 'es', 'fr'],
        message: '{VALUE} is not a supported language'
      }
    }
  },
  scanHistory: [{
    menuId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Menu'
    },
    scannedAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastLogin: {
    type: Date
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  
});

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ 'allergens.name': 1 });
userSchema.index({ createdAt: 1 });

// Instance methods
userSchema.methods.hasAllergen = function(allergenName) {
  return this.allergens.some(allergen => 
    allergen.name.toLowerCase() === allergenName.toLowerCase()
  );
};

userSchema.methods.getAllergenSeverity = function(allergenName) {
  const allergen = this.allergens.find(a => 
    a.name.toLowerCase() === allergenName.toLowerCase()
  );
  return allergen ? allergen.severity : null;
};

// Pre-save hooks
userSchema.pre('save', function(next) {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase();
  }
  next();
});

// Error handling
userSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('Email already exists'));
  } else {
    next(error);
  }
});

// Create the model
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;