import { readdir } from 'fs/promises';
import { join } from 'path';
import GalleryClient from './gallery-client';

async function getPhotos(cabin: string): Promise<string[]> {
  try {
    const dir = join(process.cwd(), 'public', 'images', cabin);
    const files = await readdir(dir);
    return files
      .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
      .sort()
      .map((f) => `/images/${cabin}/${encodeURIComponent(f)}`);
  } catch {
    return [];
  }
}

export default async function GallerySection() {
  const [cabania1, cabania2] = await Promise.all([
    getPhotos('cabania1'),
    getPhotos('cabania2'),
  ]);

  return <GalleryClient cabania1={cabania1} cabania2={cabania2} />;
}
