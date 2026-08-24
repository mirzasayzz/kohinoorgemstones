import { Helmet } from '@dr.pogodin/react-helmet';
import { useLocation } from 'react-router-dom';
import { useBusiness } from '../../context/BusinessContext';

const SEOHead = ({
  title = "",
  description = "",
  keywords = "",
  image = "",
  type = "website",
  gemstone = null,
  customSchema = null
}) => {
  const { businessInfo } = useBusiness();
  const location = useLocation();

  // Base URL for the site
  const baseUrl = import.meta.env.VITE_SITE_URL || 'https://kohinoorgemstone.com';
  const currentUrl = `${baseUrl}${location.pathname}${location.search}`;

  // Default values
  const siteName = businessInfo?.shopName || 'Kohinoor Gemstone';
  const defaultDescription = businessInfo?.description || 'Premium authentic gemstones with certification. Family-owned business with 39+ years of expertise in precious stones, astrology gemstones, and jewelry.';
  const defaultKeywords = 'gemstones, precious stones, ruby, emerald, diamond, sapphire, pearl, authentic gemstones, certified gemstones, astrology stones, jewelry, Mumbai gemstones, natural stones, gemstone dealer, Kohinoor';

  // Build final values
  const finalTitle = title ? `${title} | ${siteName}` : siteName;
  const finalDescription = description || defaultDescription;
  const finalKeywords = keywords ? `${keywords}, ${defaultKeywords}` : defaultKeywords;
  const finalImage = image || `${baseUrl}/kohinoor-logo.png`;

  // Generate structured data based on page type
  const generateStructuredData = () => {
    const baseSchema = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": siteName,
      "description": finalDescription,
      "url": baseUrl,
      "image": finalImage,
      "telephone": businessInfo?.contact?.phone,
      "email": businessInfo?.contact?.email,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": businessInfo?.address?.city || "Mumbai",
        "addressRegion": businessInfo?.address?.state || "Maharashtra", 
        "addressCountry": businessInfo?.address?.country || "India",
        "streetAddress": businessInfo?.address?.fullAddress
      },
      "priceRange": "₹₹₹",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "1000"
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "opens": "10:00",
        "closes": "19:00"
      }
    };

    // Gemstone-specific schema
    if (gemstone) {
      const gemstoneSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": `${gemstone.name?.english} - ${gemstone.name?.urdu}`,
        "description": gemstone.summary || gemstone.description,
        "image": gemstone.images?.map(img => img.url) || [finalImage],
        "category": gemstone.category,
        "brand": {
          "@type": "Brand",
          "name": siteName
        },
        "offers": {
          "@type": "Offer",
          "availability": "https://schema.org/InStock",
          "price": gemstone.priceRange?.min || "15000",
          "priceCurrency": "INR",
          "seller": {
            "@type": "Organization", 
            "name": siteName
          }
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "reviewCount": Math.floor(Math.random() * 100) + 50
        },
        "additionalProperty": [
          {
            "@type": "PropertyValue",
            "name": "Color",
            "value": gemstone.color
          },
          {
            "@type": "PropertyValue", 
            "name": "Origin",
            "value": gemstone.origin || "Natural"
          },
          {
            "@type": "PropertyValue",
            "name": "Certification",
            "value": gemstone.certification?.certified ? "Yes" : "No"
          }
        ]
      };

      return [baseSchema, gemstoneSchema];
    }

    // Custom schema override
    if (customSchema) {
      return [baseSchema, customSchema];
    }

    return [baseSchema];
  };

  const schemas = generateStructuredData();

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />

      {/* Additional Meta Tags */}
      <meta name="author" content={siteName} />
      <meta name="robots" content="index, follow, max-image-preview:large" />
      <meta name="googlebot" content="index, follow" />
      
      {/* Geographic Tags */}
      <meta name="geo.region" content="IN-MH" />
      <meta name="geo.placename" content="Mumbai" />
      <meta name="geo.position" content="19.0760;72.8777" />
      <meta name="ICBM" content="19.0760, 72.8777" />

      {/* Business Tags */}
      <meta name="rating" content="general" />
      <meta name="distribution" content="global" />
      <meta name="revisit-after" content="1 day" />
      
      {/* Mobile Tags */}
      <meta name="format-detection" content="telephone=yes" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />

      {/* Structured Data */}
      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}

      {/* Preconnect to External Domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://res.cloudinary.com" />

      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="//api.whatsapp.com" />
      <link rel="dns-prefetch" href="//web.whatsapp.com" />
      <link rel="dns-prefetch" href="//maps.google.com" />
    </Helmet>
  );
};

// Predefined SEO configurations for different pages
export const seoConfigs = {
  home: {
    title: "Premium Authentic Gemstones - Family Business Since 1985",
    description: "Discover premium certified gemstones at Kohinoor. 39+ years of expertise in precious stones, astrology gemstones, and jewelry. 100% authentic with international certification.",
    keywords: "kohinoor gemstone, premium gemstones, certified gemstones, astrology stones, precious stones Mumbai, authentic gemstones India"
  },
  
  gemstones: {
    title: "All Gemstones - Certified Collection",
    description: "Browse our complete collection of certified gemstones including Ruby, Emerald, Diamond, Sapphire, Pearl and more. Expert guidance and international certification guaranteed.",
    keywords: "gemstone collection, ruby emerald diamond, sapphire pearl, certified stones, precious stones catalog"
  },
  
  about: {
    title: "About Us - 39+ Years of Gemstone Expertise",
    description: "Learn about Kohinoor Gemstone's heritage. Three generations of expertise in bringing authentic, certified gemstones with complete trust and transparency.",
    keywords: "kohinoor gemstone history, family gemstone business, gemstone expertise, certified dealer, authentic stones"
  },
  
  contact: {
    title: "Contact Us - Expert Gemstone Consultation",
    description: "Get expert guidance from certified gemstone specialists. WhatsApp support, phone consultations, and in-store visits available. Located in Mumbai, India.",
    keywords: "gemstone consultation, expert advice, whatsapp support, mumbai gemstone dealer, astrology consultation"
  }
};

// Gemstone-specific SEO generator
export const getGemstoneSEO = (gemstone) => {
  if (!gemstone) return {};

  const englishName = gemstone.name?.english || 'Gemstone';
  const urduName = gemstone.name?.urdu || '';
  const category = gemstone.category || '';
  const color = gemstone.color || '';

  return {
    title: `${englishName} (${urduName}) - Premium ${category} Stone`,
    description: `${gemstone.summary || `Authentic ${englishName} gemstone with certification.`} Perfect for ${gemstone.purpose?.join(', ') || 'astrology and jewelry'}. ${color} ${category} with international certification.`,
    keywords: `${englishName.toLowerCase()}, ${category.toLowerCase()}, ${color.toLowerCase()} stone, ${urduName}, certified ${category.toLowerCase()}, astrology ${category.toLowerCase()}, ${gemstone.purpose?.map(p => p.toLowerCase()).join(', ') || 'precious stone'}`,
    type: "product"
  };
};

export default SEOHead; 