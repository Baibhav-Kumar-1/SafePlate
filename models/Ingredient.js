import mongoose from 'mongoose';

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  aliases: [{
    type: String,
    trim: true,
  }],
  commonAllergens: [{
    name: {
      type: String,
      required: true,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    source: {
      type: String,
      enum: ['system', 'manual', 'feedback'],
      default: 'system',
    },
  }],
  category: {
    type: String,
    trim: true,
  },
  nutritionalInfo: {
    calories: Number,
    protein: Number,
    carbohydrates: Number,
    fats: Number,
  },
  restrictions: [{
    type: String,
    enum: [
      'vegetarian',
      'vegan',
      'halal',
      'kosher',
      'gluten-free',
      'dairy-free',
    ],
  }],
  metadata: {
    lastVerified: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    confidence: {
      type: Number,
      default: 1,
      min: 0,
      max: 1,
    },
  },
}, {
  timestamps: true,
});

// Indexes
ingredientSchema.index({ name: 1 }, { unique: true });
ingredientSchema.index({ aliases: 1 });
ingredientSchema.index({ 'commonAllergens.name': 1 });
ingredientSchema.index({ category: 1 });
ingredientSchema.index({ restrictions: 1 });

// Static methods
ingredientSchema.statics.findByNameOrAlias = function(name) {
  const normalizedName = name.toLowerCase().trim();
  return this.findOne({
    $or: [
      { name: normalizedName },
      { aliases: normalizedName },
    ],
  });
};

ingredientSchema.statics.findAllergensForIngredients = async function(ingredients) {
  const names = ingredients.map(i => i.toLowerCase().trim());
  const results = await this.find({
    $or: [
      { name: { $in: names } },
      { aliases: { $in: names } },
    ],
  }).select('name commonAllergens');
  
  return results.reduce((acc, ingredient) => {
    acc[ingredient.name] = ingredient.commonAllergens;
    return acc;
  }, {});
};

// Instance methods
ingredientSchema.methods.addAlias = async function(alias) {
  if (!this.aliases.includes(alias)) {
    this.aliases.push(alias);
    await this.save();
  }
  return this;
};

ingredientSchema.methods.updateAllergens = async function(allergens) {
  this.commonAllergens = allergens;
  this.metadata.lastVerified = new Date();
  await this.save();
  return this;
};

export const Ingredient = mongoose.models.Ingredient || mongoose.model('Ingredient', ingredientSchema);