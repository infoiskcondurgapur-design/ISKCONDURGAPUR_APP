'use client';

export interface UploadedFile {
  url: string;
  name: string;
  size: number;
}

export function useUploadThing(_config?: string) {
  const startUpload = async (files: File[]): Promise<UploadedFile[] | undefined> => {
    if (!files || files.length === 0) return [];
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    const res = await fetch('/api/public-upload', { method: 'POST', body: formData });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || 'File upload failed');
    }
    return result.data.urls as UploadedFile[];
  };

  return { startUpload, isUploading: false };
}
