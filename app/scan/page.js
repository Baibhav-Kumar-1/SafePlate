'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ImageUpload from '../components/ImageUpload';
import ScanResults from '../components/ScanResults';

export default function ScanPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    router.replace('/auth/signin');
    return null;
  }

  const handleUpload = async (file) => {
    setScanning(true);
    setError(null);
    setScanResult(null);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('image', file);

      // Upload and scan image
      const response = await fetch('/api/scan/menu', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to scan menu');
      }

      const result = await response.json();
      setScanResult(result);
    } catch (err) {
      setError(err.message);
      console.error('Scan error:', err);
    } finally {
      setScanning(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Menu Scanner
          </h1>
          <p className="mt-2 text-gray-600">
            Upload a menu photo to scan for allergens and ingredients
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <ImageUpload onUpload={handleUpload} />

          {scanning && (
            <div className="mt-6">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              </div>
              <p className="text-center mt-2 text-gray-600">
                Scanning menu and analyzing ingredients...
              </p>
            </div>
          )}

          {error && (
            <div className="mt-6 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {scanResult && !scanning && (
            <div className="mt-8">
              <ScanResults results={scanResult} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}