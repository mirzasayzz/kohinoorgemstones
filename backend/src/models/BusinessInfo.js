import mongoose from 'mongoose';

const businessInfoSchema = new mongoose.Schema({
  shopName: {
    type: String,
    required: [true, 'Shop name is required'],
    trim: true,
    default: 'Kohinoor Gemstone'
  },
  tagline: {
    type: String,
    trim: true,
    default: 'Premium Gemstones for Life\'s Precious Moments'
  },
  description: {
    type: String,
    trim: true,
    maxLength: [500, 'Description cannot exceed 500 characters'],
    default: 'We are a family-owned gemstone business dedicated to providing authentic, certified gemstones with a heritage of trust and excellence.'
  },
  contact: {
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      match: [
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
        'Please provide a valid email'
      ],
      default: 'info@kohinoorgemstone.com'
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid phone number'],
      default: '+911234567890'
    },
    whatsapp: {
      type: String,
      required: [true, 'WhatsApp number is required'],
      match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid WhatsApp number'],
      default: '+911234567890'
    }
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true,
      default: '123 Gemstone Street'
    },
    area: {
      type: String,
      trim: true,
      default: 'Jewelry District'
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      default: 'Mumbai'
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      default: 'Maharashtra'
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      match: [/^\d{6}$/, 'Please provide a valid 6-digit pincode'],
      default: '400001'
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      default: 'India'
    },
    fullAddress: {
      type: String,
      trim: true
    }
  },
  googleMapsUrl: {
    type: String,
    trim: true,
    default: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.8574447892247!2d72.8310437!3d19.0544472!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDAzJzE2LjAiTiA3MsKwNDknNTEuOCJF!5e0!3m2!1sen!2sin!4v1234567890'
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
    name: { type: String, required: true, trim: true },
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
      trim: true,
      default: 'We offer a 7-day return policy for unused items in original condition.'
    },
    shippingPolicy: {
      type: String,
      trim: true,
      default: 'We provide secure shipping across India. International shipping available on request.'
    },
    privacyPolicy: {
      type: String,
      trim: true,
      default: 'We respect your privacy and protect your personal information.'
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
    primaryColor: { type: String, default: '#0F172A' },
    secondaryColor: { type: String, default: '#B91C1C' },
    accentColor: { type: String, default: '#047857' },
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
    const { street, area, city, state, pincode, country } = this.address;
    this.address.fullAddress = [street, area, city, state, pincode, country]
      .filter(Boolean)
      .join(', ');
  }
  next();
});

// Static method to get business info (singleton pattern)
businessInfoSchema.statics.getBusinessInfo = async function () {
  let businessInfo = await this.findOne({ isActive: true });
  
  if (!businessInfo) {
    // Create default business info if none exists
    businessInfo = await this.create({
      shopName: 'Kohinoor Gemstone',
      contact: {
        email: 'info@kohinoorgemstone.com',
        phone: '+911234567890',
        whatsapp: '+911234567890'
      },
      address: {
        street: '123 Gemstone Street',
        area: 'Jewelry District',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India'
      }
    });
  }
  
  return businessInfo;
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