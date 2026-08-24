import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import BusinessInfo from '../models/BusinessInfo.js';

// @desc    Get business information
// @route   GET /api/business/info
// @access  Public
export const getBusinessInfo = asyncHandler(async (req, res, next) => {
  const businessInfo = await BusinessInfo.getBusinessInfo();

  res.status(200).json({
    success: true,
    data: {
      businessInfo
    }
  });
});

// @desc    Update business information
// @route   PUT /api/business/info
// @access  Private (Admin)
export const updateBusinessInfo = asyncHandler(async (req, res, next) => {
  let businessInfo = await BusinessInfo.getBusinessInfo();

  // Update business info
  businessInfo = await businessInfo.updateBusinessInfo(req.body, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Business information updated successfully',
    data: {
      businessInfo
    }
  });
});

// @desc    Get contact information for WhatsApp integration
// @route   GET /api/business/contact
// @access  Public
export const getContactInfo = asyncHandler(async (req, res, next) => {
  const businessInfo = await BusinessInfo.getBusinessInfo();

  const contactInfo = {
    whatsapp: businessInfo.contact.whatsapp,
    phone: businessInfo.contact.phone,
    email: businessInfo.contact.email,
    shopName: businessInfo.shopName,
    address: businessInfo.address.fullAddress
  };

  res.status(200).json({
    success: true,
    data: {
      contact: contactInfo
    }
  });
});

// @desc    Update contact information
// @route   PUT /api/business/contact
// @access  Private (Admin)
export const updateContactInfo = asyncHandler(async (req, res, next) => {
  let businessInfo = await BusinessInfo.getBusinessInfo();

  const { email, phone, whatsapp } = req.body;
  
  if (email) businessInfo.contact.email = email;
  if (phone) businessInfo.contact.phone = phone;
  if (whatsapp) businessInfo.contact.whatsapp = whatsapp;

  businessInfo.lastUpdatedBy = req.user.id;
  await businessInfo.save();

  res.status(200).json({
    success: true,
    message: 'Contact information updated successfully',
    data: {
      contact: {
        email: businessInfo.contact.email,
        phone: businessInfo.contact.phone,
        whatsapp: businessInfo.contact.whatsapp
      }
    }
  });
});

// @desc    Update all contact information (WhatsApp, Email, Address)
// @route   PUT /api/business/contact-all
// @access  Private (Admin)
export const updateAllContactInfo = asyncHandler(async (req, res, next) => {
  let businessInfo = await BusinessInfo.getBusinessInfo();

  const { 
    email, 
    phone, 
    whatsapp,
    street,
    area,
    city,
    state,
    pincode,
    country,
    googleMapsUrl
  } = req.body;
  
  // Update contact information
  if (email) businessInfo.contact.email = email;
  if (phone) businessInfo.contact.phone = phone;
  if (whatsapp) businessInfo.contact.whatsapp = whatsapp;
  
  // Update address information
  if (street) businessInfo.address.street = street;
  if (area) businessInfo.address.area = area;
  if (city) businessInfo.address.city = city;
  if (state) businessInfo.address.state = state;
  if (pincode) businessInfo.address.pincode = pincode;
  if (country) businessInfo.address.country = country;
  
  // Update Google Maps URL
  if (googleMapsUrl) businessInfo.googleMapsUrl = googleMapsUrl;

  businessInfo.lastUpdatedBy = req.user.id;
  await businessInfo.save();

  res.status(200).json({
    success: true,
    message: 'All contact information updated successfully',
    data: {
      contact: {
        email: businessInfo.contact.email,
        phone: businessInfo.contact.phone,
        whatsapp: businessInfo.contact.whatsapp
      },
      address: businessInfo.address,
      googleMapsUrl: businessInfo.googleMapsUrl
    }
  });
});

// @desc    Get complete contact information for frontend
// @route   GET /api/business/contact-complete
// @access  Public
export const getCompleteContactInfo = asyncHandler(async (req, res, next) => {
  const businessInfo = await BusinessInfo.getBusinessInfo();

  const completeContactInfo = {
    whatsapp: businessInfo.contact.whatsapp,
    phone: businessInfo.contact.phone,
    email: businessInfo.contact.email,
    shopName: businessInfo.shopName,
    address: {
      street: businessInfo.address.street,
      area: businessInfo.address.area,
      city: businessInfo.address.city,
      state: businessInfo.address.state,
      pincode: businessInfo.address.pincode,
      country: businessInfo.address.country,
      fullAddress: businessInfo.address.fullAddress
    },
    googleMapsUrl: businessInfo.googleMapsUrl
  };

  res.status(200).json({
    success: true,
    data: {
      contact: completeContactInfo
    }
  });
});

// @desc    Update business address
// @route   PUT /api/business/address
// @access  Private (Admin)
export const updateAddress = asyncHandler(async (req, res, next) => {
  let businessInfo = await BusinessInfo.getBusinessInfo();

  const { street, area, city, state, pincode, country, googleMapsUrl } = req.body;

  if (street) businessInfo.address.street = street;
  if (area) businessInfo.address.area = area;
  if (city) businessInfo.address.city = city;
  if (state) businessInfo.address.state = state;
  if (pincode) businessInfo.address.pincode = pincode;
  if (country) businessInfo.address.country = country;

  if (googleMapsUrl) businessInfo.googleMapsUrl = googleMapsUrl;

  businessInfo.lastUpdatedBy = req.user.id;
  await businessInfo.save();

  res.status(200).json({
    success: true,
    message: 'Address updated successfully',
    data: {
      address: businessInfo.address,
      googleMapsUrl: businessInfo.googleMapsUrl
    }
  });
});

// @desc    Update business hours
// @route   PUT /api/business/hours
// @access  Private (Admin)
export const updateBusinessHours = asyncHandler(async (req, res, next) => {
  let businessInfo = await BusinessInfo.getBusinessInfo();

  const { businessHours } = req.body;

  if (businessHours) {
    businessInfo.businessHours = { ...businessInfo.businessHours, ...businessHours };
  }

  businessInfo.lastUpdatedBy = req.user.id;
  await businessInfo.save();

  res.status(200).json({
    success: true,
    message: 'Business hours updated successfully',
    data: {
      businessHours: businessInfo.businessHours
    }
  });
});

// @desc    Update social media links
// @route   PUT /api/business/social
// @access  Private (Admin)
export const updateSocialMedia = asyncHandler(async (req, res, next) => {
  let businessInfo = await BusinessInfo.getBusinessInfo();

  const { socialMedia } = req.body;

  if (socialMedia) {
    businessInfo.socialMedia = { ...businessInfo.socialMedia, ...socialMedia };
  }

  businessInfo.lastUpdatedBy = req.user.id;
  await businessInfo.save();

  res.status(200).json({
    success: true,
    message: 'Social media links updated successfully',
    data: {
      socialMedia: businessInfo.socialMedia
    }
  });
});

// @desc    Add or update certification
// @route   POST /api/business/certifications
// @access  Private (Admin)
export const addCertification = asyncHandler(async (req, res, next) => {
  let businessInfo = await BusinessInfo.getBusinessInfo();

  const { name, number, issuedBy, validUntil, image } = req.body;

  if (!name) {
    throw new AppError('Certification name is required', 400);
  }

  const newCertification = {
    name,
    number,
    issuedBy,
    validUntil: validUntil ? new Date(validUntil) : undefined,
    image
  };

  businessInfo.certifications.push(newCertification);
  businessInfo.lastUpdatedBy = req.user.id;
  await businessInfo.save();

  res.status(201).json({
    success: true,
    message: 'Certification added successfully',
    data: {
      certification: newCertification,
      certifications: businessInfo.certifications
    }
  });
});

// @desc    Delete certification
// @route   DELETE /api/business/certifications/:id
// @access  Private (Admin)
export const deleteCertification = asyncHandler(async (req, res, next) => {
  let businessInfo = await BusinessInfo.getBusinessInfo();

  const certificationIndex = businessInfo.certifications.findIndex(
    cert => cert._id.toString() === req.params.id
  );

  if (certificationIndex === -1) {
    throw new AppError('Certification not found', 404);
  }

  businessInfo.certifications.splice(certificationIndex, 1);
  businessInfo.lastUpdatedBy = req.user.id;
  await businessInfo.save();

  res.status(200).json({
    success: true,
    message: 'Certification deleted successfully',
    data: {
      certifications: businessInfo.certifications
    }
  });
});

// @desc    Update heritage information
// @route   PUT /api/business/heritage
// @access  Private (Admin)
export const updateHeritage = asyncHandler(async (req, res, next) => {
  let businessInfo = await BusinessInfo.getBusinessInfo();

  const { foundedYear, story, specialties } = req.body;

  if (foundedYear) businessInfo.heritage.foundedYear = foundedYear;
  if (story) businessInfo.heritage.story = story;
  if (specialties && Array.isArray(specialties)) businessInfo.heritage.specialties = specialties;

  businessInfo.lastUpdatedBy = req.user.id;
  await businessInfo.save();

  res.status(200).json({
    success: true,
    message: 'Heritage information updated successfully',
    data: {
      heritage: businessInfo.heritage
    }
  });
});

// @desc    Update policies
// @route   PUT /api/business/policies
// @access  Private (Admin)
export const updatePolicies = asyncHandler(async (req, res, next) => {
  let businessInfo = await BusinessInfo.getBusinessInfo();

  const { returnPolicy, shippingPolicy, privacyPolicy } = req.body;

  if (returnPolicy) businessInfo.policies.returnPolicy = returnPolicy;
  if (shippingPolicy) businessInfo.policies.shippingPolicy = shippingPolicy;
  if (privacyPolicy) businessInfo.policies.privacyPolicy = privacyPolicy;

  businessInfo.lastUpdatedBy = req.user.id;
  await businessInfo.save();

  res.status(200).json({
    success: true,
    message: 'Policies updated successfully',
    data: {
      policies: businessInfo.policies
    }
  });
});

// @desc    Update SEO settings
// @route   PUT /api/business/seo
// @access  Private (Admin)
export const updateSEOSettings = asyncHandler(async (req, res, next) => {
  let businessInfo = await BusinessInfo.getBusinessInfo();

  const { metaTitle, metaDescription, keywords } = req.body;

  if (metaTitle) businessInfo.seoSettings.metaTitle = metaTitle;
  if (metaDescription) businessInfo.seoSettings.metaDescription = metaDescription;
  if (keywords && Array.isArray(keywords)) businessInfo.seoSettings.keywords = keywords;

  businessInfo.lastUpdatedBy = req.user.id;
  await businessInfo.save();

  res.status(200).json({
    success: true,
    message: 'SEO settings updated successfully',
    data: {
      seoSettings: businessInfo.seoSettings
    }
  });
});

// @desc    Update theme settings
// @route   PUT /api/business/theme
// @access  Private (Admin)
export const updateThemeSettings = asyncHandler(async (req, res, next) => {
  let businessInfo = await BusinessInfo.getBusinessInfo();

  const { primaryColor, secondaryColor, accentColor, logo, favicon } = req.body;

  if (primaryColor) businessInfo.theme.primaryColor = primaryColor;
  if (secondaryColor) businessInfo.theme.secondaryColor = secondaryColor;
  if (accentColor) businessInfo.theme.accentColor = accentColor;
  if (logo) businessInfo.theme.logo = logo;
  if (favicon) businessInfo.theme.favicon = favicon;

  businessInfo.lastUpdatedBy = req.user.id;
  await businessInfo.save();

  res.status(200).json({
    success: true,
    message: 'Theme settings updated successfully',
    data: {
      theme: businessInfo.theme
    }
  });
}); 

// @desc    Handle contact form submissions
// @route   POST /api/business/contact-form
// @access  Public
export const submitContactForm = asyncHandler(async (req, res, next) => {
  const { name, email, phone, subject, message, interestedIn } = req.body;

  // Validate required fields
  if (!name || !email || !phone || !subject || !message) {
    return next(new AppError('Please provide all required fields', 400));
  }

  // Get business info to include in the response
  const businessInfo = await BusinessInfo.getBusinessInfo();
  
  // Create WhatsApp message from form data
  const whatsappMessage = `🔶 New Contact Form Submission 🔶

📋 **Contact Details:**
• Name: ${name}
• Email: ${email}
• Phone: ${phone}
• Subject: ${subject.replace('_', ' ')}
${interestedIn ? `• Interested In: ${interestedIn}` : ''}

💬 **Message:**
${message}

---
Sent from Kohinoor Gemstone website contact form`;

  const encodedMessage = encodeURIComponent(whatsappMessage);
  const whatsappUrl = `https://wa.me/${businessInfo.contact.whatsapp.replace('+', '')}?text=${encodedMessage}`;

  res.status(200).json({
    success: true,
    message: 'Contact form received successfully',
    data: {
      whatsappUrl,
      redirectMessage: 'Redirecting you to WhatsApp to complete your inquiry...'
    }
  });
}); 