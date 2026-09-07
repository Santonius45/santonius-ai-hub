'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client'; // Sesuaikan path helper supabase client kamu
import BoundingBoxViewer from '@/components/vision/BoundingBoxViewer';

interface DetectedObject {
  label: string;
  confidence: number;
  box_2d: [number, number, number, number];
}

interface AnalysisResult {
  id: string;
  image_url: string;
  summary: string;
  detected_objects: DetectedObject[];
}

export default function VisionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setResult(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Upload Gambar ke Supabase Storage (Bucket: vision-files)
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { data: storageData, error: uploadError } = await supabase.storage
        .from('vision-files')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`Gagal upload gambar: ${uploadError.message}`);
      }

      // 2. Dapatkan Public URL Gambar
      const { data: urlData } = supabase.storage
        .from('vision-files')
        .getPublicUrl(filePath);

      const imageUrl = urlData.publicUrl;

      // 3. Panggil API Vision Analyze yang sudah dibuat sebelumnya
      const response = await fetch('/api/v1/vision/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, imagePath: filePath }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'Gagal menganalisis gambar');
      }

      setResult(resData.data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Vision AI</h1>
        <p className="text-slate-400 text-sm">
          Unggah gambar untuk mendeteksi objek, label, dan ringkasan berbasis Computer Vision.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Panel Upload */}
        <div className="space-y-4">
          <div className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl p-6 text-center bg-slate-900/50 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="vision-upload"
            />
            <label htmlFor="vision-upload" className="cursor-pointer block space-y-2">
              <div className="text-slate-400">
                <span className="text-blue-400 font-semibold">Klik untuk memilih</span> atau drag gambar ke sini
              </div>
              <p className="text-xs text-slate-500">PNG, JPG, JPEG (Maks. 5MB)</p>
            </label>
          </div>

          {previewUrl && (
            <div className="space-y-4">
              <p className="text-xs font-semibold text-slate-400">PREVIEW GAMBAR:</p>
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-64 rounded-lg object-contain border border-slate-800 bg-black/40"
              />
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-medium rounded-lg transition-colors text-sm"
              >
                {loading ? 'Sedang Menganalisis Gambar...' : 'Proses Vision AI'}
              </button>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Panel Hasil Analisis */}
        <div className="space-y-6">
          {result ? (
            <>
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-2">HASIL DETEKSI VISUAL</h3>
                <BoundingBoxViewer
                  imageUrl={result.image_url}
                  detectedObjects={result.detected_objects}
                />
              </div>

              <div className="p-4 bg-slate-900 rounded-lg border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ringkasan AI</h4>
                <p className="text-sm text-slate-200 leading-relaxed">{result.summary}</p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Objek Terdeteksi ({result.detected_objects.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.detected_objects.map((obj, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-slate-800 text-slate-200 border border-slate-700 rounded-md text-xs flex items-center gap-1.5"
                    >
                      <span>{obj.label}</span>
                      <span className="text-blue-400 text-[10px]">
                        {Math.round(obj.confidence * 100)}%
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="h-full min-h-[300px] flex items-center justify-center border border-slate-800/50 rounded-xl bg-slate-900/20 text-slate-500 text-sm">
              Hasil analisis akan muncul di sini setelah diunggah.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}