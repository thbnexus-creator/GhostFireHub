import React, { useState } from 'react';
import { Upload, AlertCircle, Trash2 } from 'lucide-react';
import { uploadFileToFirebase, deleteFileFromFirebase } from '../lib/firebase';

interface SecureImageUploadProps {
  imageUrl: string;
  onUploadSuccess: (url: string) => void;
  onClear: () => void;
  folder?: string;
  label?: string;
  accept?: string;
  maxSize?: number;
}

export default function SecureImageUpload({ 
  imageUrl, 
  onUploadSuccess, 
  onClear, 
  folder = 'uploads', 
  label = 'PNG / JPG PICTURE (Max 2MB)',
  accept = 'image/*',
  maxSize = 2 * 1024 * 1024
}: SecureImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');

  const handleFile = async (file: File) => {
    if (!file) return;
    if (file.size > maxSize) {
      setUploadError(`File size must be under ${(maxSize / (1024 * 1024)).toFixed(0)}MB.`);
      return;
    }
    setUploadError('');
    setUploading(true);
    setProgress(15);
    
    try {
      // Simulate fake progression to provide real-time visual responsiveness
      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(timer);
            return 90;
          }
          return prev + 15;
        });
      }, 100);

      const url = await uploadFileToFirebase(file, folder);
      clearInterval(timer);
      setProgress(100);
      onUploadSuccess(url);
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed.');
    } finally {
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 500);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDelete = async () => {
    if (imageUrl) {
      setUploading(true);
      await deleteFileFromFirebase(imageUrl);
      setUploading(false);
      onClear();
    }
  };

  return (
    <div className="space-y-2">
      {imageUrl ? (
        <div className="relative border border-slate-800 bg-slate-950 p-2.5 rounded-2xl flex items-center justify-between gap-3 overflow-hidden">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 overflow-hidden text-lg">
              {imageUrl.startsWith('data:') || imageUrl.startsWith('http') ? (
                <img src={imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="" />
              ) : (
                <span>{imageUrl || '🖼️'}</span>
              )}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-emerald-400 font-bold block">✓ SECURE IMAGE LINKED</span>
              <span className="text-[9px] text-slate-500 font-mono truncate block select-all">
                {imageUrl.startsWith('data:') ? 'Base64 Local Image Cache' : imageUrl}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            disabled={uploading}
            className="p-2 bg-red-950/40 hover:bg-red-900/40 text-red-400 hover:text-red-300 border border-red-900/30 rounded-xl transition-all font-mono text-[9px] font-bold uppercase shrink-0"
          >
            Delete File
          </button>
        </div>
      ) : (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`border border-dashed rounded-2xl p-4 text-center relative transition-all cursor-pointer ${isDragging ? 'border-orange-500 bg-orange-500/5' : 'border-slate-800 bg-slate-950/20 hover:border-slate-700'}`}
        >
          <input
            type="file"
            accept={accept}
            onChange={onChange}
            disabled={uploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          {uploading ? (
            <div className="space-y-2 py-1">
              <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-[10px] text-orange-400 font-mono">SECURELY SENDING ({progress}%)</p>
              <div className="w-24 h-1 bg-slate-900 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <Upload className="w-5 h-5 text-slate-600 mx-auto" />
              <p className="text-[10px] text-slate-400 font-sans font-semibold">DRAG & DROP OR CLICK TO CHOOSE</p>
              <p className="text-[9px] text-slate-500 font-mono uppercase">{label}</p>
            </div>
          )}
        </div>
      )}
      {uploadError && (
        <p className="text-[9.5px] font-mono text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {uploadError}
        </p>
      )}
    </div>
  );
}
