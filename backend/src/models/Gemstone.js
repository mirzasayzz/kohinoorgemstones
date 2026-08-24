import mongoose from 'mongoose';

const gemstoneSchema = new mongoose.Schema({
  name: {
    english: {
      type: String,
      required: [true, 'English name is required'],
      trim: true,
      maxLength: [100, 'Name cannot exceed 100 characters']
    },
    urdu: {
      type: String,
      required: false,  // Made optional to allow flexibility
      trim: true,
      maxLength: [100, 'Urdu name cannot exceed 100 characters']
    }
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    index: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Diamond', 'Emerald', 'Ruby', 'Sapphire', 'Topaz', 
      'Coral', 'Pearl', 'Turquoise', 'Onyx', 'Aqeeq', 
      'Moonstone', 'Zircon', 'Opal', 'Tourmaline', 'Garnet', 'Other'
    ],
    index: true
  },
  purpose: [{
    type: String,
    enum: ['Love', 'Health', 'Wealth', 'Protection', 'Spiritual Growth', 'Success', 'Peace', 'Wisdom'],
    index: true
  }],
  color: {
    type: String,
    required: [true, 'Color is required'],
    trim: true
  },
  summary: {
    type: String,
    required: [true, 'Summary is required'],
    trim: true,
    maxLength: [200, 'Summary cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxLength: [2000, 'Description cannot exceed 2000 characters']
  },
  origin: {
    type: String,
    trim: true
  },
  astrologyBenefits: {
    type: String,
    trim: true
  },
  uses: {
    type: String,
    trim: true
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    }
  }],
  trending: {
    type: Boolean,
    default: false,
    index: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  weight: {
    value: {
      type: Number,
      min: [0.01, 'Weight must be positive']
    },
    unit: {
      type: String,
      enum: ['carats', 'grams', 'ratti'],
      default: 'carats'
    }
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: {
      type: String,
      enum: ['mm', 'cm'],
      default: 'mm'
    }
  },
  certification: {
    certified: {
      type: Boolean,
      default: false
    },
    certificateNumber: {
      type: String,
      trim: true
    },
    certifyingBody: {
      type: String,
      trim: true
    }
  },
  priceRange: {
    min: {
      type: Number,
      min: [0, 'Price cannot be negative']
    },
    max: {
      type: Number,
      min: [0, 'Price cannot be negative']
    },
    currency: {
      type: String,
      enum: ['INR', 'USD', 'EUR'],
      default: 'INR'
    }
  },
  availability: {
    type: String,
    enum: ['In Stock', 'Out of Stock', 'Made to Order'],
    default: 'In Stock'
  },
  viewCount: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  seoMeta: {
    title: {
      type: String,
      maxLength: [60, 'SEO title cannot exceed 60 characters']
    },
    description: {
      type: String,
      maxLength: [160, 'SEO description cannot exceed 160 characters']
    },
    keywords: [{
      type: String,
      trim: true,
      lowercase: true
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Create slug from English name before saving
gemstoneSchema.pre('save', function (next) {
  if (this.isModified('name.english') || this.isNew) {
    this.slug = this.name.english
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

// Increment view count method
gemstoneSchema.methods.incrementViewCount = async function () {
  this.viewCount += 1;
  await this.save({ validateBeforeSave: false });
};

// Static method to get trending gemstones
gemstoneSchema.statics.getTrending = function () {
  return this.find({ trending: true, isActive: true })
    .sort({ createdAt: -1 })
    .limit(8);
};

// Static method to get new arrivals
gemstoneSchema.statics.getNewArrivals = function () {
  return this.find({ isActive: true })
    .sort({ createdAt: -1 })
    .limit(8);
};

// Static method to search gemstones
gemstoneSchema.statics.searchGemstones = function (query) {
  return this.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { 'name.english': { $regex: query, $options: 'i' } },
          { 'name.urdu': { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { summary: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } }
        ]
      }
    ]
  });
};

// Indexes for better performance
gemstoneSchema.index({ 'name.english': 'text', 'name.urdu': 'text', description: 'text' });
gemstoneSchema.index({ category: 1, trending: -1 });
gemstoneSchema.index({ createdAt: -1 });
gemstoneSchema.index({ viewCount: -1 });

const Gemstone = mongoose.model('Gemstone', gemstoneSchema);

export default Gemstone; 