"use client";

import React, { useState, useRef, ChangeEvent, useEffect } from "react";
import axios from "axios";
import { Button } from "@nextui-org/react";
import Icon from "../icon";

type Props = {
  onUploadSuccess?: (response: any) => void;
  onUploadError?: (error: any) => void;
  maxFileSize?: number; // حداکثر حجم فایل به بایت
  allowedFileTypes?: string[]; // انواع فایل مجاز
  autoUpload?: boolean
};

const FileUploader: React.FC<Props> = ({
  onUploadSuccess,
  onUploadError,
  maxFileSize = 20 * 1024 * 1024, // 5MB پیش‌فرض
  allowedFileTypes = ["image/*", ".pdf"],
  autoUpload = false
}) => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFiles = (files: FileList): boolean => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // بررسی حجم فایل
      if (file.size > maxFileSize) {
        setError(`حجم فایل ${file.name} بیش از حد مجاز است (${maxFileSize / (1024 * 1024)}MB)`);
        return false;
      }

      // بررسی نوع فایل
      const fileType = file.type || file.name.split('.').pop() || '';
      if (!allowedFileTypes.some(type => {
        if (type.includes('*')) {
          return fileType.startsWith(type.replace('*', ''));
        }
        return fileType === type;
      })) {
        setError(`نوع فایل ${file.name} مجاز نیست`);
        return false;
      }
    }
    return true;
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (validateFiles(e.target.files)) {
        setFiles(e.target.files);
        setProgress(0);
        setError(null);
        
        // اگر autoUpload فعال باشد، بلافاصله آپلود را شروع می‌کنیم
        if (autoUpload) {
          upload();
        }
      } else {
        if (inputRef.current) inputRef.current.value = "";
        setFiles(null);
      }
    }
  };

  const upload = async () => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("files", file, file.name);
    });

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_UPLOADER_URL}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setProgress(progress);
            }
          },
        }
      );

      onUploadSuccess?.(res.data);

      // ریست ورودی فایل و استیت‌ها
      if (inputRef.current) inputRef.current.value = "";
      setFiles(null);
      setProgress(0);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "خطا در آپلود فایل";
      setError(errorMessage);
      onUploadError?.(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <input
        ref={inputRef}
        type="file"
        hidden
        accept={allowedFileTypes.join(",")}
        multiple
        onChange={onFileChange}
        className="mb-4"
        disabled={isUploading}
      />
      <Button color="primary" onPress={() => inputRef.current?.click()}><Icon name='image-up'></Icon>
        Upload
      </Button>
      {files && files.length > 0 && !autoUpload && (
        <div className="flex flex-col items-center gap-2">
          <Button
            color="primary"
            onPress={upload}
            isDisabled={isUploading}
          >
            {isUploading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⌛</span>
                در حال آپلود...
              </span>
            ) : (
              `آپلود ${files.length} فایل`
            )}
          </Button>

          {progress > 0 && (
            <div className="w-full max-w-md">
              <div className="w-full bg-gray-200 rounded h-2 mb-2">
                <div
                  className="h-2 rounded bg-blue-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 text-center">
                {progress}% آپلود شده
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-red-500 mt-2 text-center" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default FileUploader;
