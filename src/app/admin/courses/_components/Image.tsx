"use client";

import Image from "next/image";
import { getUrl } from "aws-amplify/storage";
import React, { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ImageComponentProps {
  path: string;
  altText: string;
  width?: number;
  height?: number;
  className?: string;
}

const ImageComponent = ({ path, altText, width, height, className }: ImageComponentProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    getUrl({ path })
      .then((result) => {
        if (isMounted) setImageUrl(result.url.href);
      })
      .catch((err: unknown) => {
        console.error("Error fetching image from storage:", err);
      });
    return () => {
      isMounted = false;
    };
  }, [path]);

  if (!imageUrl) {
    return (
      <Skeleton
        className="rounded-md"
        style={{
          width: width || 600,
          height: height || 400,
        }}
      />
    );
  }

  return (
    <Image
      priority={true}
      src={imageUrl}
      alt={altText}
      width={width || 600}
      height={height || 400}
      className={className}
    />
  );
};

export default ImageComponent;
