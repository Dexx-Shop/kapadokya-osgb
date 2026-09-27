import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://kapadokyaosgb.com';

  return [
    { url: baseUrl, lastModified: new Date(), priority: 1.0 },
    { url: `${baseUrl}/kurumsal`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/referanslarimiz`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/galeri`, lastModified: new Date(), priority: 0.7 },
    { url: `${baseUrl}/iletisim`, lastModified: new Date(), priority: 0.9 },
    { url: `${baseUrl}/sss`, lastModified: new Date(), priority: 0.6 },
  ];
}