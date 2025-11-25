import { getGalleryImages } from "@/action/get-gallery-images.action";
import GalleryGrid from "@/components/gallery/gallery-grid";

export default async function GalleryPage() {
  const { images, nextCursor } = await getGalleryImages();

  return <GalleryGrid initialImages={images} initialCursor={nextCursor} />;
}
