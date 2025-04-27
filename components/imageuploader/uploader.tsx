"use client";

import React, { useState, useEffect } from "react";
import Uploady, { useItemProgressListener, useUploady } from "@rpldy/uploady";
import UploadButton from "@rpldy/upload-button";
import UploadPreview from "@rpldy/upload-preview";

type Props = {
  destinationUrl: string;
};

// این کامپوننت برای نمایش پیشرفت آپلود
const UploadProgress: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const progressData = useItemProgressListener();

  // به‌جای setState درون render، از useEffect استفاده می‌کنیم
  useEffect(() => {
    if (progressData && progressData.completed > progress) {
      setProgress(progressData.completed);
    }
  }, [progressData, progress]);

  return progressData ? (
    <div className="mt-4">
      <p className="text-sm text-gray-600 mt-2">Upload Progress: {progress}%</p>
    </div>
  ) : null;
};

// این کامپوننت زمانی داخل <Uploady> رندر می‌شود و هوک useUploady مجاز است
const UploadActions: React.FC<{
  clearError: () => void;
}> = ({ clearError }) => {
  const uploady = useUploady();

  return (
    <button
      onClick={() => {
        clearError();
        uploady.processPending();
      }}
      className="px-4 py-2 flex gap-1 bg-green-500 text-white rounded hover:bg-green-600 transition "
    >
      Upload Files
    </button>
  );
};

const FileUploader: React.FC<Props> = ({ destinationUrl }) => {
  const [uploadError, setUploadError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center justify-center p-4 w-30 ">
      <Uploady
        destination={{ url: destinationUrl }}
        autoUpload
        accept="image/*,.pdf"
        multiple
      >
        <div className="flex flex-col items-center space-y-4">
          <UploadButton className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
            Select Files
          </UploadButton>

          {/* اینجا کامپوننتی داریم که هوک useUploady را در سطح معتبر فراخوانی می‌کند */}
          <UploadActions clearError={() => setUploadError(null)} />

          <UploadPreview
            previewComponentProps={{
              className:
                "mt-4  rounded shadow flex items-center flex-wrap gap-2 size-32",
            }}
          />

          <UploadProgress />

          {uploadError && <p className="text-red-500 mt-2">{uploadError}</p>}
        </div>
      </Uploady>
    </div>
  );
};

export default FileUploader;
