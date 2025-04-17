"use client";

import React, { useState } from "react";
import Uploady, { useItemProgressListener, useUploady } from "@rpldy/uploady";
import UploadButton from "@rpldy/upload-button";
import UploadPreview from "@rpldy/upload-preview";
import Icon from "../icon";
// import { Line } from 'rc-progress';
import { ImageUp } from "lucide-react";

type Props = {
  destinationUrl: string;
};
const UploadProgress: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const progressData = useItemProgressListener();

  if (progressData && progressData.completed > progress) {
    setProgress(progressData.completed);
  }

  return progressData ? (
    <div className="mt-4">
      <p className="text-sm text-gray-600 mt-2">Upload Progress: {progress}%</p>
    </div>
  ) : null;
};

const FileUploader = ({ destinationUrl = "" }: Props) => {
  const [uploadError, setUploadError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center justify-center   p-4 w-52">
      <Uploady
        destination={{ url: destinationUrl }}
        autoUpload
        accept="image/*,.pdf"
        multiple
        onError={(error) => {
          setUploadError("Upload failed. Please try again.");
          console.error("Upload Error:", error);
        }}
      >
        <div className="flex flex-col items-center space-y-4">
          <UploadButton
            autoUpload
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Select Files
          </UploadButton>
          <button
            onClick={() => {
              setUploadError(null);
              useUploady().processPending();
            }}
            className="px-4 py-2 flex gap-1 bg-green-500 text-white rounded hover:bg-green-600 transition "
          >
            Upload Files
          </button>
          <UploadPreview
            previewComponentProps={{
              className: "mt-4 w-40 rounded shadow flex items-center flex-wrap gap-2",
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
