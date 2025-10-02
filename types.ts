
export interface UploadedImage {
  file: File;
  base64: string;
}

export interface GeneratedImage {
  id: string;
  prompt: string;
  base64: string | null;
  error?: string;
}
