"use client";

import { useState } from "react";
import { UploadButton } from "@/utils/uploadthing";

export function TestUploadDebug() {
  const [status, setStatus] = useState<string>("Ready to upload");
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-bold mb-4">UploadThing Debug Test</h3>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600">Status: <span className="font-semibold">{status}</span></p>
      </div>

      <UploadButton
        endpoint="imageUploader"
        onUploadBegin={() => {
          console.log("[DEBUG] onUploadBegin called");
          setStatus("Upload started...");
        }}
        onUploadProgress={(progress) => {
          console.log("[DEBUG] onUploadProgress:", progress);
          setStatus(`Uploading: ${progress}%`);
        }}
        onClientUploadComplete={(res) => {
          console.log("[DEBUG] onClientUploadComplete called with:", res);
          setStatus("Upload complete!");
          if (res) {
            const urls = res.map(file => file.url);
            setUploadedUrls(urls);
          }
        }}
        onUploadError={(error: Error) => {
          console.error("[DEBUG] onUploadError called with:", error);
          setStatus(`Error: ${error.message}`);
        }}
      />

      {uploadedUrls.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-semibold">Uploaded URLs:</p>
          <ul className="text-xs">
            {uploadedUrls.map((url, idx) => (
              <li key={idx} className="truncate">{url}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
