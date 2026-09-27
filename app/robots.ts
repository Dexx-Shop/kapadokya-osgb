import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/yonetici-odasi/', '/rapor-girisi/'], // Özel sayfalar Google'da çıkmasın
    },
    sitemap: 'https://kapadokyaosgb.com/sitemap.xml',
  };
}