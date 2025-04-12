"use server";

import cloudinary from "@/cloudinary";

const ASSET_FOLDER_NAME = process.env.NEXT_PUBLIC_ASSET_FOLDER_NAME!;

export async function uploadAsset(files: string) {
  try {
    const result = await cloudinary.uploader.upload(files, {
      folder: ASSET_FOLDER_NAME,
      resource_type: "image", // Automatically detect resource type
    });
    return result;
  } catch (error) {
    console.error("Error uploading image:", error);
  }
}
