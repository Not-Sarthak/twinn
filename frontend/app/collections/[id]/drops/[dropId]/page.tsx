"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function CollectionDropRedirect() {
  const params = useParams();
  const router = useRouter();
  const collectionId = params.id as string;
  const dropId = params.dropId as string;

  useEffect(() => {
    router.replace(`/drops/${dropId}?collectionId=${collectionId}`);
  }, [router, collectionId, dropId]);

  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="text-lg text-text-secondary">Redirecting</div>
    </div>
  );
}
