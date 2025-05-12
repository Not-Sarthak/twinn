"use client";
import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import FormData from "form-data";
import { JWT } from "@/app/lib/constants";
import Image from "next/image";

const fadeInVariant = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
};

export default function FileUpload({
  onChange,
}: {
  onChange?: (files: File[], ipfsHash?: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");
  const [ipfsHash, setIpfsHash] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (newFiles: File[]) => {
    if (newFiles.length > 0) {
      const selectedFile = newFiles[0];

      if (!selectedFile.type.startsWith("image/")) {
        setStatus("Only image files are allowed.");
        return;
      }

      setFile(selectedFile);
      onChange && onChange([selectedFile]);

      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);

      const img = document.createElement("img");
      img.onload = () => {
        setDimensions({
          width: img.width,
          height: img.height,
        });
      };
      img.src = objectUrl;

      uploadToIPFS(selectedFile);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setPreviewUrl(null);
    setDimensions(null);
    setIpfsHash(null);
    setStatus("");
  };

  const uploadToIPFS = async (fileToUpload: File) => {
    const formData = new FormData();
    formData.append("file", fileToUpload);

    const pinataMetadata = JSON.stringify({ name: fileToUpload.name });
    formData.append("pinataMetadata", pinataMetadata);

    const pinataOptions = JSON.stringify({ cidVersion: 0 });
    formData.append("pinataOptions", pinataOptions);

    try {
      setStatus("Uploading...");
      const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            "Content-Type": `multipart/form-data; boundary=${
              (formData as any)._boundary
            }`,
            Authorization: `Bearer ${JWT}`,
          },
          maxBodyLength: Infinity,
        },
      );
      setStatus("Upload successful!");
      const hash = response.data.IpfsHash;
      setIpfsHash(hash);
      onChange && onChange([fileToUpload], hash);
      console.log(response.data);
    } catch (error) {
      setStatus("Upload failed.");
      console.error(error);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const { getRootProps, isDragActive } = useDropzone({
    multiple: false,
    accept: {
      "image/*": [],
    },
    noClick: true,
    onDrop: handleFileChange,
    onDropRejected: (error: any) => {
      console.log(error);
      setStatus("File Rejected.");
    },
  });

  return (
    <div className="w-full" {...getRootProps()} onClick={handleClick}>
      <input
        ref={fileInputRef}
        id="file-upload-handle"
        type="file"
        accept="image/*"
        onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
        className="hidden"
      />
      <div className="flex flex-col items-center justify-center">
        {file && previewUrl ? (
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInVariant}
            className="relative z-40 mx-auto w-full overflow-hidden rounded-md bg-bg-primary p-4 shadow-code-shadow"
          >
            <div className="absolute right-2 top-2 z-50">
              <button
                onClick={clearFile}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-dark-primary hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-3 flex w-full justify-center">
              <Image
                src={previewUrl}
                alt="Preview"
                className="max-h-72 max-w-full rounded-md object-contain"
                width={288}
                height={288}
              />
            </div>

            <div className="flex w-full flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <p className="max-w-xs truncate text-sm font-medium text-text-primary">
                {file.name}
              </p>
              <p className="rounded bg-white px-2 py-1 font-mono text-xs text-text-secondary">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>

            <div className="mt-2 flex w-full flex-wrap gap-2 text-xs text-text-secondary">
              <p className="rounded bg-white px-2 py-1 font-mono">
                {file.type}
              </p>

              {dimensions && (
                <p className="rounded bg-white px-2 py-1 font-mono">
                  {dimensions.width} × {dimensions.height} px
                </p>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="relative flex h-64 w-64 cursor-pointer items-center justify-center rounded-xl border-4 border-orange-300 bg-white">
            <div
              className="absolute inset-0 rounded-md"
              style={{
                backgroundImage: `radial-gradient(circle, #e4e4e7 1px, transparent 1px)`,
                backgroundSize: `20px 20px`,
              }}
            ></div>
            <div className="relative z-10 flex flex-col items-center gap-2 p-4 text-center">
              <p className="font-garamond rounded-md border-[1px] border-orange-500 bg-orange-200 p-2 italic text-orange-500">
                {isDragActive ? "Drop Image Here" : "Upload"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
