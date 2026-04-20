const STORAGE_KEY = "vto_user_photos";
const LAST_USED_PHOTO_ID_KEY = "vto_last_used_photo_id";

export function getUserPhotos() {
  if (typeof window === "undefined") return [];

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveUserPhoto(imageData) {
  const photos = getUserPhotos();
  const newPhoto = {
    id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    imageData,
    uploadedAt: new Date().toISOString(),
  };
  photos.push(newPhoto);
  
  // Limit to last 10 photos to prevent quota issues
  const photosToKeep = photos.slice(-10);
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(photosToKeep));
  } catch (error) {
    // If quota exceeded, try to save with fewer photos
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      // Keep only the last 5 photos
      const fewerPhotos = photos.slice(-5);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fewerPhotos));
        // Update the newPhoto to be in the kept photos
        const keptPhoto = fewerPhotos.find(p => p.id === newPhoto.id);
        if (keptPhoto) {
          return keptPhoto;
        }
      } catch (e) {
        // If still failing, clear all and save just this one
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem(STORAGE_KEY, JSON.stringify([newPhoto]));
      }
    } else {
      throw error;
    }
  }
  
  return newPhoto;
}

export function getLastUsedPhotoId() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LAST_USED_PHOTO_ID_KEY);
}

export function setLastUsedPhotoId(photoId) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LAST_USED_PHOTO_ID_KEY, photoId);
}

export function getLastUsedPhoto() {
  const photoId = getLastUsedPhotoId();
  if (!photoId) return null;
  
  const photos = getUserPhotos();
  return photos.find(p => p.id === photoId) || null;
}

export function deleteUserPhoto(photoId) {
  const photos = getUserPhotos();
  const filtered = photos.filter((p) => p.id !== photoId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function clearAllUserPhotos() {
  localStorage.removeItem(STORAGE_KEY);
}

