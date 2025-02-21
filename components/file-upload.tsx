'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';

interface FileWithPreview extends File {
  preview?: string;
}

export function FileUpload() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prevFiles => [
      ...prevFiles,
      ...acceptedFiles.map(file => 
        Object.assign(file, {
          preview: URL.createObjectURL(file)
        })
      )
    ]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'audio/*': ['.mp3']
    }
  });

  const removeFile = (name: string) => {
    setFiles(files => files.filter(file => file.name !== name));
  };

  const uploadFiles = async () => {
    setUploading(true);
    setProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 500);

    // Simulate API call
    setTimeout(() => {
      clearInterval(interval);
      setUploading(false);
      setProgress(100);
      toast({
        title: "Upload complete",
        description: "Your files have been successfully uploaded.",
      });
    }, 5000);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive ? 'border-[#4285f4] bg-blue-50/50' : 'border-gray-300'}
          hover:border-[#4285f4] hover:bg-blue-50/50
        `}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm font-medium text-gray-900">
          Drop your files here or click to upload
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Supported file types: PDF, TXT, Markdown, Audio (mp3)
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="space-y-2">
            {files.map(file => (
              <div
                key={file.name}
                className="flex items-center justify-between p-3 bg-white rounded-lg border"
              >
                <div className="flex items-center space-x-3">
                  <File className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium">{file.name}</span>
                </div>
                <button
                  onClick={() => removeFile(file.name)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>

          {uploading ? (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-gray-500 text-center">
                Uploading... {progress}%
              </p>
            </div>
          ) : progress === 100 ? (
            <div className="flex items-center justify-center text-green-500 space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Upload complete</span>
            </div>
          ) : (
            <button
              onClick={uploadFiles}
              className="w-full py-2 px-4 bg-[#4285f4] text-white rounded-lg hover:bg-[#3b77db] transition-colors"
            >
              Upload {files.length} file{files.length > 1 ? 's' : ''}
            </button>
          )}
        </div>
      )}
    </div>
  );
}