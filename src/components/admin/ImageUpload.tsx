import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  multiple?: boolean;
  maxFiles?: number;
  className?: string;
}

const ImageUpload = ({ 
  onImageUploaded, 
  multiple = false, 
  maxFiles = 1,
  className = "" 
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    if (files.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} file${maxFiles > 1 ? 's' : ''} allowed`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      if (multiple) {
        // Multiple file upload
        const formData = new FormData();
        Array.from(files).forEach((file) => {
          formData.append('images', file);
        });

        const response = await apiClient.request('/upload/multiple', {
          method: 'POST',
          body: formData
        });

        if (response.success) {
          response.images.forEach((img: any) => {
            onImageUploaded(img.url);
          });
          toast({
            title: "Images uploaded successfully",
            description: `${response.images.length} image${response.images.length > 1 ? 's' : ''} uploaded`,
          });
        }
      } else {
        // Single file upload
        const formData = new FormData();
        formData.append('image', files[0]);

        const response = await apiClient.request('/upload/single', {
          method: 'POST',
          body: formData
        });

        if (response.success) {
          onImageUploaded(response.imageUrl);
          toast({
            title: "Image uploaded successfully",
            description: "Image has been uploaded and is ready to use",
          });
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center space-y-2">
          <ImageIcon className="h-12 w-12 text-gray-400" />
          <div className="text-sm text-gray-600">
            <span className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer" onClick={openFileDialog}>
              Click to upload
            </span>{" "}
            or drag and drop
          </div>
          <p className="text-xs text-gray-500">
            {multiple ? `Up to ${maxFiles} images` : "Single image"} • PNG, JPG, GIF up to 5MB
          </p>
        </div>

        {uploading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 text-xs text-gray-500">
        Supported formats: JPG, PNG, GIF, WebP • Max size: 5MB per file
      </div>
    </div>
  );
};

export default ImageUpload;
