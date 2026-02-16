'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ServiceIconPickerProps {
  value: string | null;
  onChange: (url: string | null) => void;
  category?: string;
  onUploading?: (isUploading: boolean) => void;
}

export function ServiceIconPicker({
  value,
  onChange,
  category,
  onUploading,
}: ServiceIconPickerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview when value changes externally
  useEffect(() => {
    setPreview(value);
  }, [value]);

  const handleFileSelect = async (file: File) => {
    console.log('📁 File selected:', file.name, file.type, file.size);
    setError(null);

    // Validate file type
    const validTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/svg+xml',
      'image/gif',
    ];
    
    if (!validTypes.includes(file.type)) {
      const errorMsg = 'Invalid file type. Use JPG, PNG, WebP, SVG, or GIF.';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      const errorMsg = 'File size must be less than 5MB';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    // Create preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      console.log('📷 Preview created');
      setPreview(reader.result as string);
    };
    reader.onerror = () => {
      console.error('❌ FileReader error');
      toast.error('Failed to read file');
    };
    reader.readAsDataURL(file);

    // Upload file
    console.log('☁️ Starting upload...');
    setIsUploading(true);
    onUploading?.(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('🚀 Sending request to /api/upload/service-icon');
      
      const res = await fetch('/api/upload/service-icon', {
        method: 'POST',
        body: formData,
      });

      console.log('📡 Response status:', res.status);

      if (!res.ok) {
        const errorData = await res.json();
        console.error('❌ Upload failed:', errorData);
        throw new Error(errorData.error || `Upload failed with status ${res.status}`);
      }

      const result = await res.json();
      console.log('✅ Upload result:', result);

      if (result.success && result.data?.url) {
        console.log('✅ Image URL:', result.data.url);
        onChange(result.data.url);
        toast.success('Icon uploaded successfully!');
        setError(null);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      const errorMsg = error.message || 'Upload failed';
      setError(errorMsg);
      toast.error(errorMsg);
      setPreview(value); // Revert preview on error
    } finally {
      setIsUploading(false);
      onUploading?.(false);
      console.log('🏁 Upload process finished');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log('🎯 Input change event:', file?.name || 'no file');
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    console.log('📦 File dropped:', file?.name || 'no file');
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    console.log('🗑️ Removing icon');
    onChange(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClickUpload = () => {
    console.log('🖱️ Upload button clicked');
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <Label>Service Icon</Label>

      {/* Hidden file input - always rendered */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
        onChange={handleInputChange}
        className="hidden"
        disabled={isUploading}
      />

      <div
        className={cn(
          'relative border-2 border-dashed rounded-xl transition-all duration-200',
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : preview
            ? 'border-slate-200 bg-white'
            : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50',
          error && 'border-red-300 bg-red-50/30'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {preview ? (
          // Preview Mode
          <div className="p-4">
            <div className="flex items-center gap-4">
              {/* Icon Preview */}
              <div className="relative w-20 h-20 rounded-xl border-2 border-slate-200 bg-white shadow-sm overflow-hidden flex items-center justify-center">
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="text-xs text-slate-500">Uploading...</span>
                  </div>
                ) : (
                  <img
                    src={preview}
                    alt="Service icon preview"
                    className="w-full h-full object-contain p-2"
                  />
                )}
              </div>

              {/* Actions */}
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900 mb-1">
                  {isUploading ? 'Uploading...' : 'Icon Selected'}
                </p>
                <p className="text-xs text-slate-500 mb-3">
                  Click below to change or remove
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleClickUpload}
                    disabled={isUploading}
                  >
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                    Change
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemove}
                    disabled={isUploading}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
                  >
                    <X className="w-3.5 h-3.5 mr-1.5" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Upload Mode
          <button
            type="button"
            onClick={handleClickUpload}
            disabled={isUploading}
            className="w-full p-6 cursor-pointer hover:bg-blue-50/50 transition-colors rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                {isUploading ? (
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                ) : (
                  <Upload className="w-6 h-6 text-blue-600" />
                )}
              </div>
              <p className="text-sm font-medium text-slate-700 mb-1">
                {isUploading
                  ? 'Uploading...'
                  : dragActive
                  ? 'Drop image here'
                  : 'Upload service icon'}
              </p>
              <p className="text-xs text-slate-500 mb-3">
                Drag & drop or click to browse
              </p>
              <p className="text-[10px] text-slate-400">
                PNG, JPG, WebP, SVG, GIF • Max 5MB
              </p>
            </div>
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Optional tip */}
      {!preview && !error && (
        <p className="text-xs text-slate-500 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5" />
          Recommended: Square image (512×512px) with transparent background
        </p>
      )}
    </div>
  );
}