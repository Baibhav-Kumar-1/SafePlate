'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import CameraCapture from './CameraCapture';

export default function ImageUpload({ onUpload }) {
  const [showCamera, setShowCamera] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    if (!file) return;

    // Reset states
    setError(null);
    setLoading(true);

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image must be less than 5MB');
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Call onUpload callback
      if (onUpload) {
        await onUpload(file);
      }
    } catch (err) {
      setError(err.message);
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleChange}
        />

        <div className="text-center">
          {preview ? (
            <div className="relative w-full h-64 mb-4">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex justify-center gap-4">
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-500"
                    onClick={() => inputRef.current?.click()}
                  >
                    Upload a file
                  </button>
                  <span>or</span>
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-500"
                    onClick={() => setShowCamera(true)}
                  >
                    Take a photo
                  </button>
                </div>
                <p className="text-center">or drag and drop</p>
                <p className="text-xs text-gray-500 text-center">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>

              {showCamera && (
                <div className="mt-4">
                  <CameraCapture
                    onCapture={async (formData) => {
                      setShowCamera(false);
                      const file = formData.get('image');
                      if (file) {
                        await handleFile(file);
                      }
                    }}
                    onError={(errorMessage) => {
                      setError(errorMessage);
                      setShowCamera(false);
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {loading && (
            <div className="mt-4">
              <div className="animate-pulse text-gray-600">Processing...</div>
            </div>
          )}

          {error && (
            <div className="mt-4 text-red-500 text-sm">{error}</div>
          )}

          {preview && !loading && (
            <button
              type="button"
              onClick={() => {
                setPreview(null);
                inputRef.current.value = '';
              }}
              className="mt-4 text-sm text-red-600 hover:text-red-500"
            >
              Remove image
            </button>
          )}
        </div>
      </div>
    </div>
  );
}