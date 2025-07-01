"use server";

import cloudinary from "@/cloudinary";

const AUDIO_FOLDER_NAME =
  process.env.NODE_ENV === "development"
    ? process.env.NEXT_PUBLIC_AUDIO_FOLDER_NAME! + " --dev"
    : process.env.NEXT_PUBLIC_AUDIO_FOLDER_NAME!;

export async function uploadAudio(files: string) {
  try {
    const result = await cloudinary.uploader.upload(files, {
      folder: AUDIO_FOLDER_NAME,
      resource_type: "auto",
    });
    return result;
  } catch (error) {
    console.error("Error uploading audio:", error);
  }
}
