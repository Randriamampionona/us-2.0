"use server";

import cloudinary from "@/cloudinary";

export async function uploadAudio(files: string) {
  try {
    const result = await cloudinary.uploader.upload(files, {
      folder: "Us Audio",
      resource_type: "auto",
    });
    return result;
  } catch (error) {
    console.error("Error uploading audio:", error);
  }
}
