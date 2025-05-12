"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormField,
  FormLabel,
  FormInput,
  FormTextarea,
  Button,
} from "../components/ui/form-elements";
import { X, ArrowLeft, ChevronDown } from "lucide-react";
import {
  collectionFormSchema,
  CollectionFormValues,
} from "../lib/validations/collection-schema";
import { useCreateCollectionStore } from "../lib/stores/create-collection-store";
import { useAuthStatus } from "../lib/hooks/use-auth-status";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../components/ui/dropdown";
import { uploadToIPFS } from "../lib/utils";
import { IPFSUploadResult } from "../lib/types";
import Image from "next/image";

const COLLECTION_TYPES = [
  "Organization",
  "Artist",
  "Event",
  "Community",
  "Personal",
  "Other",
];

export default function CreateCollectionPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStatus();
  const {
    formData,
    updateFormData,
    addDropToCollection,
    removeDropFromCollection,
  } = useCreateCollectionStore();
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    null,
  );
  const [logoImagePreview, setLogoImagePreview] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [userDrops, setUserDrops] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoIpfsResult, setLogoIpfsResult] = useState<IPFSUploadResult | null>(
    null,
  );
  const [coverIpfsResult, setCoverIpfsResult] =
    useState<IPFSUploadResult | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/collections");
    }
  }, [isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionFormSchema) as any,
    defaultValues: {
      title: formData.title || "",
      type: formData.type || "",
      creator: formData.creator || "",
      description: formData.description || "",
      link: formData.link || "",
      drops: formData.drops || [],
    },
  });

  const description = watch("description");
  const selectedType = watch("type");
  const [descriptionCount, setDescriptionCount] = useState(
    description?.length || 0,
  );

  useEffect(() => {
    setDescriptionCount(description?.length || 0);
  }, [description]);

  const handleLogoUpload = async (files: File[]) => {
    if (files && files.length > 0) {
      const file = files[0];
      setValue("logoImage", file);
      setUploadingLogo(true);

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          setLogoImagePreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);

      try {
        const result = await uploadToIPFS(file);
        if (result) {
          setLogoIpfsResult(result);
        }
      } finally {
        setUploadingLogo(false);
      }
    }
  };

  const handleCoverUpload = async (files: File[]) => {
    if (files && files.length > 0) {
      const file = files[0];
      setValue("coverImage", file);
      setUploadingCover(true);

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          setCoverImagePreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);

      try {
        const result = await uploadToIPFS(file);
        if (result) {
          setCoverIpfsResult(result);
        }
      } finally {
        setUploadingCover(false);
      }
    }
  };

  useEffect(() => {
    const mockUserDrops = [
      {
        id: "1",
        title: "ETH Global 2023",
        image: "https://placehold.co/400x400/purple/white?text=Drop1",
      },
      {
        id: "2",
        title: "Devcon VI",
        image: "https://placehold.co/400x400/blue/white?text=Drop2",
      },
      {
        id: "3",
        title: "NFT NYC 2023",
        image: "https://placehold.co/400x400/green/white?text=Drop3",
      },
    ];
    setUserDrops(mockUserDrops);
  }, []);

  const filteredDrops = userDrops.filter((drop) =>
    drop.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const onSubmit = (data: CollectionFormValues) => {
    setIsSubmitting(true);

    const submissionData = {
      ...data,
      link: data.link ? `https://${data.link.replace(/^https?:\/\//, "")}` : "",
      ipfs: {
        logo: logoIpfsResult || null,
        cover: coverIpfsResult || null,
      },
    };

    updateFormData(submissionData);

    console.log(
      "Collection submission data:",
      JSON.stringify(submissionData, null, 2),
    );

    // In a real app, this would submit the form to an API using axios
    // Example:
    // axios.post('/api/collections', submissionData)
    //   .then((response) => {
    //     router.push(`/collections/${response.data.id}`);
    //   })
    //   .catch((error) => {
    //     console.error('Error creating collection:', error);
    //   });

    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/collections");
    }, 1000);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 md:py-8 lg:px-8">
      <div
        className="mb-4 flex cursor-pointer items-center gap-2"
        onClick={() => router.push("/collections")}
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Collections</span>
      </div>

      <h1 className="mx-auto mb-6 max-w-2xl text-center font-garamond text-3xl font-medium italic text-text-primary sm:text-4xl md:mb-8 md:text-5xl lg:text-6xl lg:leading-[64px]">
        Create Collection
      </h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mx-auto max-w-4xl space-y-6 sm:space-y-8">
          {/* Section 1: Collection Details */}
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 p-1 shadow-md sm:rounded-3xl sm:p-1.5">
            <div className="relative z-10 w-full rounded-xl bg-white p-6 sm:rounded-2xl sm:p-8">
              <div className="space-y-6">
                <h2 className="text-lg font-medium">Collection Details</h2>

                {/* Title */}
                <FormField>
                  <FormLabel htmlFor="title" required>
                    Collection Name
                  </FormLabel>
                  <FormInput
                    id="title"
                    placeholder="Give your collection a name"
                    {...register("title")}
                    error={errors.title}
                    maxLength={150}
                    className="h-10 rounded-lg border-gray-200 bg-gray-50 text-sm shadow-sm transition focus:border-orange-500 focus:bg-white focus:ring-[1px] focus:ring-orange-500 disabled:opacity-70 sm:h-12 sm:text-base"
                  />
                </FormField>

                {/* Collection Type */}
                <FormField>
                  <FormLabel htmlFor="type" required>
                    Collection Type
                  </FormLabel>
                  <div className="relative">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className={`flex h-10 w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm shadow-sm transition focus:border-orange-500 focus:bg-white focus:ring-[1px] focus:ring-orange-500 sm:h-12 sm:text-base ${!selectedType ? "text-gray-400" : "text-gray-900"}`}
                        >
                          {selectedType || "Select a collection type"}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        className="z-50 w-[98%] min-w-[200px] bg-white"
                      >
                        {COLLECTION_TYPES.map((type) => (
                          <DropdownMenuItem
                            key={type}
                            onClick={() => setValue("type", type)}
                            className="cursor-pointer"
                          >
                            {type}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <input
                      type="hidden"
                      {...register("type")}
                      value={selectedType || ""}
                    />
                  </div>
                  {errors.type && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.type.message as string}
                    </p>
                  )}
                </FormField>

                {/* Description */}
                <FormField>
                  <FormLabel htmlFor="description" required>
                    Description
                  </FormLabel>
                  <FormTextarea
                    id="description"
                    placeholder="Describe what this collection is about"
                    {...register("description")}
                    error={errors.description}
                    rows={4}
                    maxLength={1500}
                    characterCount={descriptionCount}
                    className="rounded-lg border-gray-200 bg-gray-50 text-sm shadow-sm transition focus:border-orange-500 focus:bg-white focus:ring-[1px] focus:ring-orange-500 disabled:opacity-70 sm:text-base"
                  />
                </FormField>
              </div>
            </div>
          </section>

          {/* Section 2: Images & Optional Info */}
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 p-1 shadow-md sm:rounded-3xl sm:p-1.5">
            <div className="relative z-10 w-full rounded-xl bg-white p-6 sm:rounded-2xl sm:p-8">
              <div className="space-y-6">
                <h2 className="text-lg font-medium">Collection Images</h2>

                {/* Logo Image */}
                <div className="mb-6">
                  <FormLabel htmlFor="logoImage" required>
                    Logo
                  </FormLabel>
                  <div className="flex justify-center">
                    <div className="relative flex h-40 w-full max-w-xl cursor-pointer items-center justify-center rounded-xl border-4 border-orange-300 bg-white">
                      <div
                        className="absolute inset-0 rounded-md"
                        style={{
                          backgroundImage: `radial-gradient(circle, #e4e4e7 1px, transparent 1px)`,
                          backgroundSize: `20px 20px`,
                        }}
                      ></div>
                      <input
                        type="file"
                        id="logo-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleLogoUpload([e.target.files[0]]);
                          }
                        }}
                        disabled={uploadingLogo}
                      />
                      <label
                        htmlFor="logo-upload"
                        className={`relative z-10 flex flex-col items-center gap-2 p-4 text-center ${uploadingLogo ? "cursor-wait opacity-70" : "cursor-pointer"}`}
                      >
                        <p className="rounded-md border-[1px] border-orange-500 bg-orange-200 p-2 font-garamond italic text-orange-500">
                          {uploadingLogo ? (
                            <span className="flex items-center gap-2">
                              <svg
                                className="h-4 w-4 animate-spin text-orange-500"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Uploading to IPFS...
                            </span>
                          ) : (
                            "Upload Logo Image"
                          )}
                        </p>
                        <span className="text-xs text-gray-500">
                          Recommended size: 400×400px
                        </span>
                      </label>
                    </div>
                  </div>

                  {logoImagePreview && (
                    <div className="mt-4 flex justify-center">
                      <div className="relative h-40 w-40">
                        <Image
                          src={logoImagePreview}
                          alt="Logo Preview"
                          className="h-full w-full rounded-lg border-2 border-orange-300 object-cover"
                          width={160}
                          height={160}
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-2 rounded-full bg-white p-1 shadow-md"
                          onClick={() => {
                            setValue("logoImage", null);
                            setLogoImagePreview(null);
                            setLogoIpfsResult(null);
                          }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  )}

                  {logoIpfsResult && (
                    <div className="mt-2 text-center">
                      <p className="text-xs text-gray-500">
                        IPFS:
                        <a
                          href={logoIpfsResult.pinata_gateway_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-1 text-orange-500 hover:underline"
                        >
                          {logoIpfsResult.hash.substring(0, 15)}...
                        </a>
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        View on:{" "}
                        <a
                          href={logoIpfsResult.gateway_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-500 hover:underline"
                        >
                          IPFS Gateway
                        </a>
                      </p>
                    </div>
                  )}
                </div>

                {/* Cover Image */}
                <div className="mb-6">
                  <FormLabel htmlFor="coverImage" required>
                    Cover Image
                  </FormLabel>
                  <div className="relative mb-2 w-full">
                    <div className="flex w-full justify-center pb-4">
                      <div className="relative flex h-40 w-full max-w-xl cursor-pointer items-center justify-center rounded-xl border-4 border-orange-300 bg-white">
                        <div
                          className="absolute inset-0 rounded-md"
                          style={{
                            backgroundImage: `radial-gradient(circle, #e4e4e7 1px, transparent 1px)`,
                            backgroundSize: `20px 20px`,
                          }}
                        ></div>
                        <input
                          type="file"
                          id="cover-upload"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleCoverUpload([e.target.files[0]]);
                            }
                          }}
                          disabled={uploadingCover}
                        />
                        <label
                          htmlFor="cover-upload"
                          className={`relative z-10 flex flex-col items-center gap-2 p-4 text-center ${uploadingCover ? "cursor-wait opacity-70" : "cursor-pointer"}`}
                        >
                          <p className="rounded-md border-[1px] border-orange-500 bg-orange-200 p-2 font-garamond italic text-orange-500">
                            {uploadingCover ? (
                              <span className="flex items-center gap-2">
                                <svg
                                  className="h-4 w-4 animate-spin text-orange-500"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                Uploading to IPFS...
                              </span>
                            ) : (
                              "Upload Cover Image"
                            )}
                          </p>
                          <span className="text-xs text-gray-500">
                            Recommended size: 1224×140px
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Cover Image Preview */}
                    {coverImagePreview && (
                      <div className="mt-4 flex justify-center">
                        <div className="relative h-40 w-full max-w-xl">
                          <Image
                            width={160}
                            height={160}
                            src={coverImagePreview}
                            alt="Cover Preview"
                            className="h-full w-full rounded-lg border-2 border-orange-300 object-cover"
                          />
                          <button
                            type="button"
                            className="absolute right-2 top-2 rounded-full bg-white p-1 shadow-md"
                            onClick={() => {
                              setValue("coverImage", null);
                              setCoverImagePreview(null);
                              setCoverIpfsResult(null);
                            }}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  {coverIpfsResult && (
                    <div className="mt-2 text-center">
                      <p className="text-xs text-gray-500">
                        IPFS:
                        <a
                          href={coverIpfsResult.pinata_gateway_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-1 text-orange-500 hover:underline"
                        >
                          {coverIpfsResult.hash}
                        </a>
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        View on:{" "}
                        <a
                          href={coverIpfsResult.gateway_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-500 hover:underline"
                        >
                          IPFS Gateway
                        </a>
                      </p>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <h3 className="text-md mb-4 font-medium text-gray-700">
                    Optional Information
                  </h3>

                  {/* Creator */}
                  <FormField>
                    <FormLabel htmlFor="creator">Creator</FormLabel>
                    <FormInput
                      id="creator"
                      placeholder="Creator name"
                      {...register("creator")}
                      error={errors.creator}
                      className="h-10 rounded-lg border-gray-200 bg-gray-50 text-sm shadow-sm transition focus:border-orange-500 focus:bg-white focus:ring-[1px] focus:ring-orange-500 disabled:opacity-70 sm:h-12 sm:text-base"
                    />
                  </FormField>

                  {/* Link */}
                  <FormField>
                    <FormLabel htmlFor="link">Link</FormLabel>
                    <div className="flex items-center">
                      <div className="h-10 flex-shrink-0 rounded-s-lg border border-gray-200 bg-gray-50 p-2 py-2 text-gray-500">
                        https://
                      </div>
                      <FormInput
                        id="link"
                        className="h-10 rounded-s-none border-gray-200 bg-gray-50 p-2 py-2 text-sm shadow-sm transition focus:border-orange-500 focus:bg-white focus:ring-[1px] focus:ring-orange-500 disabled:opacity-70 sm:text-base"
                        placeholder="example.com"
                        {...register("link")}
                        error={errors.link}
                      />
                    </div>
                  </FormField>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Add Drops */}
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 p-1 shadow-md sm:rounded-3xl sm:p-1.5">
            <div className="relative z-10 w-full rounded-xl bg-white p-6 sm:rounded-2xl sm:p-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium">Add Drops</h2>
                  <span className="rounded-lg border-[1px] border-dashed border-orange-500 bg-orange-100 px-3 py-1.5 text-sm">
                    {watch("drops")?.length || 0} selected
                  </span>
                </div>

                {/* Drop Search */}
                <div className="mb-4">
                  <FormInput
                    placeholder="Find drops by name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10 rounded-lg border-gray-200 bg-gray-50 text-sm shadow-sm transition focus:border-orange-500 focus:bg-white focus:ring-[1px] focus:ring-orange-500 disabled:opacity-70 sm:h-12 sm:text-base"
                  />
                </div>

                {/* User's Drops */}
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {filteredDrops.map((drop) => (
                    <div
                      key={drop.id}
                      className="cursor-pointer rounded-lg border border-gray-200 p-2 transition-colors hover:border-orange-500"
                      onClick={() => {
                        const currentDrops = watch("drops") || [];
                        const dropExists = currentDrops.includes(drop.id);

                        if (dropExists) {
                          removeDropFromCollection(drop.id);
                          setValue(
                            "drops",
                            currentDrops.filter((id) => id !== drop.id),
                          );
                        } else {
                          addDropToCollection(drop.id);
                          setValue("drops", [...currentDrops, drop.id]);
                        }
                      }}
                    >
                      <div className="relative mb-2 aspect-square w-full overflow-hidden rounded-lg">
                        <Image
                          width={160}
                          height={160}
                          src={drop.image}
                          alt={drop.title}
                          className="h-full w-full object-cover"
                        />
                        {watch("drops")?.includes(drop.id) && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <div className="rounded-full bg-white p-1">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-orange-500"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="truncate text-center text-xs">
                        {drop.title}
                      </p>
                    </div>
                  ))}
                </div>

                {filteredDrops.length === 0 && (
                  <div className="py-6 text-center text-sm text-gray-500">
                    No drops found matching your search.
                  </div>
                )}

                {userDrops.length === 0 && (
                  <div className="py-6 text-center text-sm text-gray-500">
                    <p>You don&apos;t have any Drops Yet.</p>
                    <button
                      type="button"
                      onClick={() => router.push("/create-drop")}
                      className="mt-2 text-orange-500 hover:underline"
                    >
                      Create a new drop
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Submit button */}
          <div className="mt-8 flex justify-center">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex h-12 w-64 items-center justify-center bg-black px-8 py-3 font-garamond text-lg italic text-white hover:bg-black/80 disabled:opacity-70"
            >
              {isSubmitting ? "Creating..." : "Create Collection"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
