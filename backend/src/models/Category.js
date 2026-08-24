import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  urdu: {
    type: String,
    trim: true
  },
  value: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  label: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for better query performance
categorySchema.index({ name: 1 });
categorySchema.index({ value: 1 });
categorySchema.index({ isActive: 1, order: 1 });

// Static method to get all active categories
categorySchema.statics.getActiveCategories = function() {
  return this.find({ isActive: true }).sort({ order: 1, name: 1 });
};

// Static method to seed default categories
categorySchema.statics.seedDefaultCategories = async function(adminUserId) {
  const existingCount = await this.countDocuments();
  
  if (existingCount === 0) {
    const defaultCategories = [
      { name: 'Diamond', urdu: 'Heera', value: 'Diamond', label: '💎 Diamond', order: 1 },
      { name: 'Emerald', urdu: 'Zamurrad', value: 'Emerald', label: '💚 Emerald (Zumurd)', order: 2 },
      { name: 'Ruby', urdu: 'Yaqoot', value: 'Ruby', label: '❤️ Ruby (Yaqoot)', order: 3 },
      { name: 'Sapphire', urdu: 'Neelam', value: 'Sapphire', label: '💙 Sapphire (Neelam)', order: 4 },
      { name: 'Topaz', urdu: 'Pukhraj', value: 'Topaz', label: '💛 Topaz (Pukhraj)', order: 5 },
      { name: 'Coral', urdu: 'Marjan', value: 'Coral', label: '🧡 Coral (Moonga)', order: 6 },
      { name: 'Pearl', urdu: 'Moti', value: 'Pearl', label: '⚪ Pearl (Moti)', order: 7 },
      { name: 'Turquoise', urdu: 'Feroza', value: 'Turquoise', label: '🔷 Turquoise (Feroza)', order: 8 },
      { name: 'Onyx', urdu: 'Sulemani', value: 'Onyx', label: '⚫ Onyx (Sulemani)', order: 9 },
      { name: 'Aqeeq', urdu: 'Aqeeq', value: 'Aqeeq', label: '🔴 Aqeeq', order: 10 },
      { name: 'Moonstone', urdu: 'Chandrakanta', value: 'Moonstone', label: '🌙 Moonstone (Chandrakanta)', order: 11 },
      { name: 'Zircon', urdu: 'Zarqun', value: 'Zircon', label: '✨ Zircon', order: 12 },
      { name: 'Opal', urdu: 'Opal', value: 'Opal', label: '🌈 Opal', order: 13 },
      { name: 'Tourmaline', urdu: 'Turmari', value: 'Tourmaline', label: '🌟 Tourmaline', order: 14 },
      { name: 'Garnet', urdu: 'Yaman', value: 'Garnet', label: '🍷 Garnet', order: 15 },
      { name: 'Other', urdu: 'Dusre', value: 'Other', label: '📿 Other', order: 99 }
    ];

    const categories = defaultCategories.map(cat => ({
      ...cat,
      addedBy: adminUserId
    }));

    await this.insertMany(categories);
    console.log('✅ Default categories seeded successfully');
  }
};

const Category = mongoose.model('Category', categorySchema);

export default Category; 