// frontend/src/components/FileUpload.jsx
import React, { useState } from "react";

export default function FileUpload({ onFileUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result.split(",")[1]; // Strip data:*/*;base64,
        const response = await fetch("/api/uploadToVectorStore", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            base64Data,
          }),
        });

        const text = await response.text();
        let result;

        try {
          result = JSON.parse(text);
        } catch (err) {
          throw new Error("Server returned invalid JSON: " + text);
        }

        if (!response.ok) {
          throw new Error(result.error || "Upload failed");
        }

        if (onFileUploaded && result.fileId) {
          onFileUploaded(result.fileId);
        }

        alert("✅ File uploaded successfully: " + result.fileId);
      } catch (err) {
        console.error("Upload error:", err);
        setError(err.message);
        alert("Upload error: " + err.message);
      } finally {
        setUploading(false);
        setFile(null);
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <div style={{ marginTop: 12 }}>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        disabled={uploading}
      />
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        style={{ marginLeft: 8 }}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
      {error && (
        <div style={{ color: "red", marginTop: 8 }}>
          ❌ {error}
        </div>
      )}
    </div>
  );
}
