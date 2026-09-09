type CloudinaryUploadResponse = { secure_url: string };

export async function uploadAttendancePhoto(file: Blob) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset)
    throw new Error("Cloudinary upload configuration is missing.");
  const formData = new FormData();
  formData.append("file", file, "attendance-photo.jpg");
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", "salary-portal/attendance");
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData },
  );
  if (!response.ok) throw new Error("Photo upload failed. Please try again.");
  const result = (await response.json()) as CloudinaryUploadResponse;
  if (!result.secure_url)
    throw new Error("Cloudinary did not return an image URL.");
  return result.secure_url;
}

export async function uploadProfilePhoto(file: File) {
  if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
    throw new Error("Choose an image file up to 5 MB.");
  }
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary upload configuration is missing.");
  }
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", "salary-portal/profile-images");
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData },
  );
  if (!response.ok) throw new Error("Profile image upload failed.");
  const result = (await response.json()) as CloudinaryUploadResponse;
  if (!result.secure_url) throw new Error("Image URL was not returned.");
  return result.secure_url;
}

export async function uploadDocument(file: File) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset)
    throw new Error("Cloudinary upload configuration is missing.");
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  // Cloudinary handles PDF page previews as image assets; raw assets cannot be transformed for in-app preview.
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData },
  );
  if (!response.ok) throw new Error("Document upload failed.");
  const result = (await response.json()) as CloudinaryUploadResponse;
  if (!result.secure_url)
    throw new Error("Cloudinary did not return a document URL.");
  return result.secure_url;
}
