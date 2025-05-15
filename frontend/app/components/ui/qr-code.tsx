"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { cn } from "../../lib/utils";
import Image from "next/image";

interface QRCodeProps {
  url: string;
  size?: number;
  className?: string;
  logoUrl?: string;
  title?: string;
  description?: string;
}

export function QRCodeComponent({
  url,
  size = 200,
  className,
  logoUrl,
  title,
  description,
}: QRCodeProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setError("URL is required to generate QR code");
      return;
    }

    const generateQRCode = async () => {
      try {
        const dataUrl = await QRCode.toDataURL(url, {
          width: size,
          margin: 1,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });
        setQrCodeDataUrl(dataUrl);
        setError(null);
      } catch (err) {
        console.error("Error generating QR code:", err);
        setError("Failed to generate QR code");
      }
    };

    generateQRCode();
  }, [url, size]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!qrCodeDataUrl) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative">
        <div className="overflow-hidden rounded-lg bg-white p-2 shadow-md">
          <Image 
            src={qrCodeDataUrl} 
            alt="QR Code" 
            width={size} 
            height={size} 
            unoptimized
          />
        </div>
        
        {logoUrl && (
          <div 
            className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full bg-white p-1 shadow-md"
          >
            <Image 
              src={logoUrl} 
              alt="Logo" 
              className="h-full w-full rounded-full object-cover"
              width={48}
              height={48}
              unoptimized
            />
          </div>
        )}
      </div>
      
      {title && <h3 className="mt-3 font-medium">{title}</h3>}
      {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
    </div>
  );
} 