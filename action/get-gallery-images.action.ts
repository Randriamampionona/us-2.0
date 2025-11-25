"use server";

import cloudinary from "@/cloudinary";

const ASSET_FOLDER_NAME = process.env.NEXT_PUBLIC_ASSET_FOLDER_NAME!;

export async function getGalleryImages(nextCursor?: string) {
  try {
    // The ONLY correct expression for a folder with spaces:
    const expression = `resource_type:image AND folder="${ASSET_FOLDER_NAME}"`;

    const result = await cloudinary.search
      .expression(expression)
      .sort_by("created_at", "desc")
      .max_results(1)
      .next_cursor(nextCursor)
      .execute();

    const images = result.resources;

    return {
      images,
      nextCursor: result.next_cursor ?? null,
    };
  } catch (error) {
    console.error("Error fetching Cloudinary images:", error);
    return { images: [], nextCursor: null };
  }
}
