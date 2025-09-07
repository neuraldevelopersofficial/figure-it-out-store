import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";

interface BulkImageUploadProps {
  onImagesUploaded: (imageMap: Record<string, string>) => void;
  maxFiles?: number;
  className?: string;
  onUploading?: (isUploading: boolean) => void;
}

const BulkImageUpload = ({
  onImagesUploaded,
  maxFiles = 50,
  className = "",
  onUploading
}: BulkImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files);
    }
  };

  const handleFileSelection = (files: FileList) => {
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      toast({
        title: "No valid images",
        description: "Please select image files only",
        variant: "destructive",
      });
      return;
    }

    if (imageFiles.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive",
      });
      return;
    }

    setSelectedFiles(imageFiles);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    setSelectedFiles([]);
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select files to upload",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    if (onUploading) onUploading(true);

    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('images', file);
      });

      const response = await apiClient.request('/upload/bulk-product', {
        method: 'POST',
        body: formData,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        }
      });

      if (response.success) {
        toast({
          title: "Images uploaded successfully",
          description: `${Object.keys(response.imageMap).length} images uploaded and ready for product import`,
        });
        onImagesUploaded(response.imageMap);
        setSelectedFiles([]);
      }
    } catch (error) {
      console.error('Bulk upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (onUploading) onUploading(false);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
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
          multiple
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
            Up to {maxFiles} product images • PNG, JPG, GIF up to 5MB each
          </p>
        </div>

        {uploading && (
          <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center">
            <div className="w-48 bg-gray-200 rounded-full h-2.5 mb-4 dark:bg-gray-700">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">Uploading... {uploadProgress}%</p>
          </div>
        )}
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-4 border rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-sm">{selectedFiles.length} files selected</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearFiles}
              disabled={uploading}
            >
              Clear All
            </Button>
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center mr-3">
                    <FileText className="h-5 w-5 text-gray-500" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium truncate" title={file.name}>{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          
          <Button 
            className="w-full mt-3" 
            onClick={uploadFiles}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} Files`}
          </Button>
        </div>
      )}

      <div className="mt-2 text-xs text-gray-500">
        Supported formats: JPG, PNG, GIF, WebP • Max size: 5MB per file
      </div>
    </div>
  );
};

export default BulkImageUpload;