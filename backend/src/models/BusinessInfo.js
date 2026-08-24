import mongoose from 'mongoose';

const businessInfoSchema = new mongoose.Schema({
  shopName: {
    type: String,
    trim: true
  },
  tagline: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxLength: [500, 'Description cannot exceed 500 characters']
  },
  contact: {
    email: {
      type: String,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
        'Please provide a valid email'
      ]
    },
    phone: {
      type: String,
      match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid phone number']
    },
    whatsapp: {
      type: String,
      match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid WhatsApp number']
    }
  },
  address: {
    street: {
      type: String,
      trim: true
    },
    area: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    pincode: {
      type: String,
      match: [/^\d{6}$/, 'Please provide a valid 6-digit pincode']
    },
    country: {
      type: String,
      trim: true
    },
    fullAddress: {
      type: String,
      trim: true
    }
  },
  googleMapsUrl: {
    type: String,
    trim: true
  },
  businessHours: {
    monday: { open: String, close: String, closed: { type: Boolean, default: false } },
    tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
    friday: { open: String, close: String, closed: { type: Boolean, default: false } },
    saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
    sunday: { open: String, close: String, closed: { type: Boolean, default: true } }
  },
  socialMedia: {
    facebook: { type: String, trim: true },
    instagram: { type: String, trim: true },
    twitter: { type: String, trim: true },
    youtube: { type: String, trim: true },
    linkedin: { type: String, trim: true }
  },
  certifications: [{
    name: { type: String, trim: true },
    number: { type: String, trim: true },
    issuedBy: { type: String, trim: true },
    validUntil: { type: Date },
    image: { type: String }
  }],
  heritage: {
    foundedYear: {
      type: Number,
      min: [1800, 'Founded year seems too old'],
      max: [new Date().getFullYear(), 'Founded year cannot be in the future']
    },
    story: {
      type: String,
      trim: true,
      maxLength: [1000, 'Story cannot exceed 1000 characters']
    },
    specialties: [{
      type: String,
      trim: true
    }]
  },
  policies: {
    returnPolicy: {
      type: String,
      trim: true
    },
    shippingPolicy: {
      type: String,
      trim: true
    },
    privacyPolicy: {
      type: String,
      trim: true
    }
  },
  seoSettings: {
    metaTitle: {
      type: String,
      trim: true,
      maxLength: [60, 'Meta title cannot exceed 60 characters']
    },
    metaDescription: {
      type: String,
      trim: true,
      maxLength: [160, 'Meta description cannot exceed 160 characters']
    },
    keywords: [{
      type: String,
      trim: true,
      lowercase: true
    }]
  },
  theme: {
    primaryColor: { type: String },
    secondaryColor: { type: String },
    accentColor: { type: String },
    logo: { type: String },
    favicon: { type: String }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Create full address before saving
businessInfoSchema.pre('save', function (next) {
  if (this.isModified('address') || this.isNew) {
    const { street, area, city, state, pincode, country } = this.address || {};
    this.address = this.address || {};
    this.address.fullAddress = [street, area, city, state, pincode, country]
      .filter(Boolean)
      .join(', ');
  }
  next();
});

// Static method to get business info (singleton pattern)
businessInfoSchema.statics.getBusinessInfo = async function () {
  const businessInfo = await this.findOne({ isActive: true });
  return businessInfo; // do not auto-create defaults
};

// Method to update business info
businessInfoSchema.methods.updateBusinessInfo = async function (updateData, userId) {
  Object.assign(this, updateData);
  this.lastUpdatedBy = userId;
  await this.save();
  return this;
};

const BusinessInfo = mongoose.model('BusinessInfo', businessInfoSchema);

export default BusinessInfo; 