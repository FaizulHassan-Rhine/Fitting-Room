"use client";

import { useState, useEffect } from "react";


const PHOTOS_STORAGE_KEY = "vto_user_photos";

export default function UserPhotosModal({ isOpen, onClose, onSelectPhoto, currentPhoto }) {
  const [photos, setPhotos] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadPhotos();
    }
  }, [isOpen]);

  const loadPhotos = () => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(PHOTOS_STORAGE_KEY);
    if (stored) {
      try {
        setPhotos(JSON.parse(stored));
      } catch (e) {
        setPhotos([]);
      }
    }
  };

  const savePhoto = (photoData) => {
    if (typeof window === "undefined") return;
    const updatedPhotos = [...photos, photoData];
    localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(updatedPhotos));
    setPhotos(updatedPhotos);
  };

  const deletePhoto = (photoId) => {
    if (typeof window === "undefined") return;
    const updatedPhotos = photos.filter(p => p.id !== photoId);
    localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(updatedPhotos));
    setPhotos(updatedPhotos);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageData = reader.result;
      const newPhoto = {
        id: Date.now().toString(),
        imageData,
        uploadedAt: new Date().toISOString(),
        name: file.name,
      };
      savePhoto(newPhoto);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPhoto = (imageData) => {
    onSelectPhoto(imageData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-lg max-w-4xl w-full max-h-[85vh] flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gray-900 text-white p-6 rounded-t-lg flex items-center justify-between border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold mb-1">Your Photos</h2>
            <p className="text-sm text-gray-300">Select a saved photo</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Saved Photos Grid */}
          {photos.length > 0 ? (
            <>
              <h3 className="text-base font-semibold mb-4 flex items-center gap-2 text-gray-900">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Saved Photos ({photos.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                      currentPhoto === photo.imageData
                        ? "border-gray-900 shadow-md"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <div className="aspect-[3/4] bg-gray-100">
                      <img
                        src={photo.imageData}
                        alt="User photo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => handleSelectPhoto(photo.imageData)}
                        className="bg-white text-gray-700 p-2.5 rounded hover:bg-gray-900 hover:text-white transition-all shadow-md"
                        title="Use this photo"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deletePhoto(photo.id)}
                        className="bg-white text-gray-700 p-2.5 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-md"
                        title="Delete photo"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    {/* Current Photo Badge */}
                    {currentPhoto === photo.imageData && (
                      <div className="absolute top-2 right-2 bg-gray-900 text-white text-xs font-semibold px-2.5 py-1 rounded shadow-md">
                        Current
                      </div>
                    )}

                    {/* Upload Date */}
                    <div className="absolute bottom-2 left-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {new Date(photo.uploadedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">No saved photos yet</h3>
              <p className="text-gray-600 text-sm">You don't have any saved photos</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-xs text-gray-600">
              <p className="font-semibold mb-1.5 text-gray-900">Tips for best results:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Use a full-body photo with good lighting</li>
                <li>Stand straight and face the camera</li>
                <li>Wear fitted clothing for accurate try-on</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

