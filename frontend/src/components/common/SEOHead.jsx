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
  const baseUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
  const currentUrl = `${baseUrl}${location.pathname}${location.search}`;

  // Values from DB only
  const siteName = businessInfo?.shopName || '';
  const defaultDescription = businessInfo?.description || '';
  const defaultKeywords = '';

  // Build final values
  const finalTitle = title ? (siteName ? `${title} | ${siteName}` : title) : siteName || title;
  const finalDescription = description || defaultDescription || undefined;
  const finalKeywords = keywords || defaultKeywords || undefined;
  const finalImage = image || `${baseUrl}/kohinoor-logo.png`;

  // Generate structured data based only on available data
  const generateStructuredData = () => {
    const baseSchema = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      ...(siteName ? { name: siteName } : {}),
      ...(finalDescription ? { description: finalDescription } : {}),
      url: baseUrl,
      image: finalImage,
      ...(businessInfo?.contact?.phone ? { telephone: businessInfo.contact.phone } : {}),
      ...(businessInfo?.contact?.email ? { email: businessInfo.contact.email } : {}),
      ...(businessInfo?.address ? {
        address: {
          "@type": "PostalAddress",
          ...(businessInfo.address.city ? { addressLocality: businessInfo.address.city } : {}),
          ...(businessInfo.address.state ? { addressRegion: businessInfo.address.state } : {}),
          ...(businessInfo.address.country ? { addressCountry: businessInfo.address.country } : {}),
          ...(businessInfo.address.fullAddress ? { streetAddress: businessInfo.address.fullAddress } : {})
        }
      } : {}),
      priceRange: "₹₹₹"
    };

    if (gemstone) {
      const gemstoneSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        ...(gemstone.name?.english ? { name: `${gemstone.name.english}${gemstone.name?.urdu ? ` - ${gemstone.name.urdu}` : ''}` } : {}),
        ...(gemstone.summary || gemstone.description ? { description: gemstone.summary || gemstone.description } : {}),
        image: gemstone.images?.map(img => img.url).filter(Boolean) || [finalImage],
        ...(gemstone.category ? { category: gemstone.category } : {}),
        ...(siteName ? { brand: { "@type": "Brand", name: siteName } } : {}),
        offers: {
          "@type": "Offer",
          availability: "https://schema.org/InStock",
          ...(gemstone.priceRange?.min ? { price: gemstone.priceRange.min } : {}),
          priceCurrency: "INR",
          ...(siteName ? { seller: { "@type": "Organization", name: siteName } } : {})
        }
      };
      return [baseSchema, gemstoneSchema];
    }

    if (customSchema) {
      return [baseSchema, customSchema];
    }

    return [baseSchema];
  };

  const schemas = generateStructuredData();

  return (
    <Helmet>
      {finalTitle ? <title>{finalTitle}</title> : null}
      {finalDescription ? <meta name="description" content={finalDescription} /> : null}
      {finalKeywords ? <meta name="keywords" content={finalKeywords} /> : null}
      <link rel="canonical" href={currentUrl} />

      {finalTitle ? <meta property="og:title" content={finalTitle} /> : null}
      {finalDescription ? <meta property="og:description" content={finalDescription} /> : null}
      <meta property="og:image" content={finalImage} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:type" content={type} />
      {siteName ? <meta property="og:site_name" content={siteName} /> : null}
      <meta property="og:locale" content="en_IN" />

      <meta name="twitter:card" content="summary_large_image" />
      {finalTitle ? <meta name="twitter:title" content={finalTitle} /> : null}
      {finalDescription ? <meta name="twitter:description" content={finalDescription} /> : null}
      <meta name="twitter:image" content={finalImage} />

      {siteName ? <meta name="author" content={siteName} /> : null}
      <meta name="robots" content="index, follow, max-image-preview:large" />

      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://res.cloudinary.com" />

      <link rel="dns-prefetch" href="//api.whatsapp.com" />
      <link rel="dns-prefetch" href="//web.whatsapp.com" />
      <link rel="dns-prefetch" href="//maps.google.com" />
    </Helmet>
  );
};

export const seoConfigs = {
  home: {
    title: "",
    description: "",
    keywords: ""
  },
  
  gemstones: {
    title: "All Gemstones",
    description: "",
    keywords: ""
  },
  
  about: {
    title: "About Us",
    description: "",
    keywords: ""
  },
  
  contact: {
    title: "Contact Us",
    description: "",
    keywords: ""
  }
};

export const getGemstoneSEO = (gemstone) => {
  if (!gemstone) return {};

  const englishName = gemstone.name?.english || '';
  const urduName = gemstone.name?.urdu || '';
  const category = gemstone.category || '';
  const color = gemstone.color || '';

  return {
    title: [englishName, urduName && `(${urduName})`].filter(Boolean).join(' '),
    description: gemstone.summary || `Authentic ${englishName} gemstone. ${color && category ? `${color} ${category}.` : ''}`,
    keywords: [englishName, category, color, urduName].filter(Boolean).join(', '),
    type: "product"
  };
};

export default SEOHead; 