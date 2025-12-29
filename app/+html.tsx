import { ScrollViewStyleReset } from 'expo-router/html';

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
// The contents of this function only run in Node.js environments and
// do not have access to the DOM or browser APIs.

const APP_URL = 'https://kalkuyar.com';
const APP_NAME = 'KalkUyar';
const APP_DESCRIPTION = 'KalkUyar Saha Uygulaması - Teşkilat operasyonlarını yönetmek için geliştirilmiş profesyonel mobil uygulama.';
const APP_IMAGE = `${APP_URL}/assets/images/og-image.png`;

// JSON-LD Structured Data
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: APP_NAME,
  description: APP_DESCRIPTION,
  url: APP_URL,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web, Android, iOS',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'TRY'
  }
};

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />

        {/* Basic SEO Meta Tags */}
        <title>KalkUyar - Saha Operasyon Yönetim Uygulaması</title>
        <meta name="description" content={APP_DESCRIPTION} />
        <meta name="keywords" content="kalkuyar, saha uygulaması, teşkilat, operasyon, mobil uygulama, sahada takip" />
        <meta name="author" content="KalkUyar" />
        <link rel="canonical" href={APP_URL} />

        {/* Open Graph Meta Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={APP_URL} />
        <meta property="og:title" content="KalkUyar - Saha Operasyon Yönetim Uygulaması" />
        <meta property="og:description" content={APP_DESCRIPTION} />
        <meta property="og:image" content={APP_IMAGE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="tr_TR" />
        <meta property="og:site_name" content={APP_NAME} />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={APP_URL} />
        <meta name="twitter:title" content="KalkUyar - Saha Operasyon Yönetim Uygulaması" />
        <meta name="twitter:description" content={APP_DESCRIPTION} />
        <meta name="twitter:image" content={APP_IMAGE} />

        {/* PWA Meta Tags */}
        <meta name="theme-color" content="#ea2a33" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={APP_NAME} />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />

        {/* PWA Manifest & Icons */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/assets/images/icon.png" />
        <link rel="icon" type="image/png" href="/assets/images/icon.png" />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Disable body scrolling on web */}
        <ScrollViewStyleReset />

        {/* Background color styles */}
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />

        {/* Service Worker Registration */}
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(function(registration) {
                  console.log('SW registered:', registration.scope);
                }, function(err) {
                  console.log('SW registration failed:', err);
                });
              });
            }
          `
        }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveBackground = `
body {
  background-color: #fff;
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #000;
  }
}`;

