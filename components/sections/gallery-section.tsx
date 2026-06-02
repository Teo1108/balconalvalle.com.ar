import { v2 as cloudinary } from 'cloudinary';
import GalleryClient from './gallery-client';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function getCloudinaryPhotos(folder: string): Promise<string[]> {
  try {
    const result = await cloudinary.search
      .expression(`folder:${folder}`)
      .sort_by('public_id', 'asc')
      .max_results(100)
      .execute();
    return result.resources.map(
      (r: { secure_url: string }) => r.secure_url
    );
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
