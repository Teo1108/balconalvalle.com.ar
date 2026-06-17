import { v2 as cloudinary } from 'cloudinary';
import GalleryClient from './gallery-client';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

type AllowedFolder = 'cabania1' | 'cabania2';

type CloudinaryResource = { secure_url: string; display_name: string };

function sortByDisplayName(photos: CloudinaryResource[]): string[] {
  return photos
    .sort((a, b) => {
      const numA = parseInt(a.display_name.match(/\d+/)?.[0] ?? '0');
      const numB = parseInt(b.display_name.match(/\d+/)?.[0] ?? '0');
      if (numA !== numB) return numA - numB;
      return a.display_name.localeCompare(b.display_name);
    })
    .map((r) => r.secure_url);
}

async function getCloudinaryPhotos(folder: AllowedFolder): Promise<string[]> {
  try {
    const result = await cloudinary.search
      .expression(`folder:${folder}`)
      .sort_by('display_name', 'asc')
      .max_results(100)
      .execute();
    return sortByDisplayName(result.resources);
  } catch {
    return [];
  }
}

export default async function GallerySection() {
  const [cabania1, cabania2] = await Promise.all([
    getCloudinaryPhotos('cabania1'),
    getCloudinaryPhotos('cabania2'),
  ]);

  return <GalleryClient cabania1={cabania1} cabania2={cabania2} />;
}
