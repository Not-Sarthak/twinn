"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GridWrapper } from "../components/ui/grid-wrapper";
import { AnimatedText } from "../components/ui/animated-text";
import {
  FormField,
  FormLabel,
  FormInput,
  FormTextarea,
  Button,
} from "../components/ui/form-elements";
import { DatePicker } from "../components/ui/date-picker";
import {
  dropFormSchema,
  DropFormValues,
  CompressedNFTResponse,
} from "../lib/validations/drop-schema";
import { useCreateDropStore } from "../lib/stores/create-drop-store";
import { ArrowLeft } from "lucide-react";
import { uploadToIPFS } from "../lib/utils";
import { IPFSUploadResult } from "../lib/types";
import { createNFTToken } from "../lib/services/nft.service";
import { SuccessModal } from "../components/ui/success-modal";
import Image from "next/image";
import { usePrivy } from "@privy-io/react-auth";
import { getWalletAddress } from "../lib/payment-services/payment";
import { shortenAddress } from "../lib/utils";

export default function CreateDropPage() {
  const { formData, updateFormData } = useCreateDropStore();
  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingNFT, setIsCreatingNFT] = useState(false);
  const [ipfsResult, setIpfsResult] = useState<IPFSUploadResult | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [nftResponse, setNftResponse] = useState<CompressedNFTResponse | null>(
    null,
  );
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { user } = usePrivy();
  const walletAddress = getWalletAddress(user);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DropFormValues>({
    resolver: zodResolver(dropFormSchema) as any,
    defaultValues: {
      title: formData.title || "",
      description: formData.description || "",
      website: formData.website || "",
      dateRange: formData.dateRange || undefined,
      attendees: formData.attendees || 0,
      ipfsHash: formData.ipfsHash || "",
      symbol: formData.symbol || "",
      createNFT: true,
      recipientAddress: walletAddress || "",
    },
  });

  // Update recipient address when wallet changes
  useEffect(() => {
    if (walletAddress) {
      setValue("recipientAddress", walletAddress);
    }
  }, [walletAddress, setValue]);

  const description = watch("description");
  const title = watch("title");
  const [descriptionCount, setDescriptionCount] = useState(
    description?.length || 0,
  );

  useEffect(() => {
    setDescriptionCount(description?.length || 0);
  }, [description]);

  const handleWebsiteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.trim();

    if (value.startsWith("https://")) {
      value = value.substring(8);
    } else if (value.startsWith("http://")) {
      value = value.substring(7);
    }

    if (value.startsWith("www.")) {
      value = value.substring(4);
    }

    while (value.endsWith("/")) {
      value = value.slice(0, -1);
    }

    setValue("website", value);
  };

  const handleFileUpload = async (files: File[]) => {
    if (files && files.length > 0) {
      const file = files[0];
      setValue("artwork", file);
      setIsUploading(true);

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          setImagePreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);

      try {
        const result = await uploadToIPFS(file);
        if (result) {
          setIpfsResult(result);
          setValue("ipfsHash", result.hash);
        }
      } finally {
        setIsUploading(false);
      }
    }
  };

  const createCompressedNFT = async (
    data: DropFormValues,
  ): Promise<CompressedNFTResponse | null> => {
    if (!ipfsResult) {
      console.error("Cannot create NFT without artwork");
      return null;
    }

    try {
      setIsCreatingNFT(true);
      console.log("Creating NFT...");

      const nftData = {
        name: data.title,
        symbol: data.symbol || data.title.substring(0, 5).toUpperCase(),
        description: data.description,
        supply: data.attendees,
        recipientAddress: data.recipientAddress || "",
        image: ipfsResult.gateway_url,
      };

      console.log("Sending NFT creation request with data:", nftData);
      const response = await createNFTToken(nftData);
      setNftResponse(response);
      return response;
    } catch (error) {
      console.error("Error creating NFT:", error);
      return null;
    } finally {
      setIsCreatingNFT(false);
    }
  };

  const onSubmit = async (data: DropFormValues) => {
    if (data.website && data.website.trim() !== "") {
      data.website = `https://${data.website}`;
    }

    if (data.dateRange?.from) {
      setValue("startDate", data.dateRange.from);
      data.startDate = data.dateRange.from;
    }

    if (data.dateRange?.to) {
      setValue("endDate", data.dateRange.to);
      data.endDate = data.dateRange.to;
    } else if (data.dateRange?.from) {
      setValue("endDate", data.dateRange.from);
      data.endDate = data.dateRange.from;
    }

    let nftResult: CompressedNFTResponse | null = null;
    if (data.recipientAddress) {
      nftResult = await createCompressedNFT(data);
    }

    const submissionData = {
      ...data,
      ipfs: ipfsResult
        ? {
            ...ipfsResult,
            fileName: data.artwork ? (data.artwork as File).name : "unknown",
            fileType: data.artwork ? (data.artwork as File).type : "unknown",
            fileSize: data.artwork ? (data.artwork as File).size : 0,
          }
        : null,
      nftResponse: nftResult,
    };

    updateFormData(submissionData);
    console.log(
      "Form submitted with all fields:",
      JSON.stringify(submissionData, null, 2),
    );

    setShowSuccessModal(true);
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <GridWrapper>
        <div className="px-6 py-10 md:px-10">
          <div className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Gallery
          </div>
          <AnimatedText
            as="h1"
            delay={0}
            className="mx-auto mb-4 text-center font-garamond text-3xl font-medium italic tracking-normal text-text-primary md:text-4xl"
          >
            Create your Drop.
          </AnimatedText>

          <form
            onSubmit={handleSubmit(onSubmit as any)}
            className="mx-auto mt-8 max-w-4xl"
          >
            <div className="grid grid-cols-1 gap-x-10 md:grid-cols-2">
              <div className="md:order-1">
                <div className="relative flex h-80 w-full cursor-pointer items-center justify-center rounded-xl border-4 border-orange-300 bg-white">
                  <div
                    className="absolute inset-0 rounded-md"
                    style={{
                      backgroundImage: `radial-gradient(circle, #e4e4e7 1px, transparent 1px)`,
                      backgroundSize: `20px 20px`,
                    }}
                  ></div>

                  {imagePreview ? (
                    <div className="relative h-full w-full">
                      <Image
                        width={1200}
                        height={1200}
                        src={imagePreview}
                        alt="Upload Preview"
                        className="h-full w-full rounded-lg object-contain p-2"
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-2 rounded-full bg-white p-1 shadow-md"
                        onClick={() => {
                          setValue("artwork", null);
                          setValue("ipfsHash", "");
                          setImagePreview(null);
                          setIpfsResult(null);
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <>
                      <input
                        type="file"
                        id="artwork-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileUpload([e.target.files[0]]);
                          }
                        }}
                        disabled={isUploading}
                      />
                      <label
                        htmlFor="artwork-upload"
                        className={`relative z-10 flex flex-col items-center gap-2 p-4 text-center ${isUploading ? "cursor-wait opacity-70" : "cursor-pointer"}`}
                      >
                        <p className="rounded-md border-[1px] border-orange-500 bg-orange-200 p-2 font-garamond italic text-orange-500">
                          {isUploading ? (
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
                            "Upload Drop Artwork"
                          )}
                        </p>
                        <span className="text-xs text-gray-500">
                          Recommended size: 1200×1200px
                        </span>
                      </label>
                    </>
                  )}
                </div>

                {ipfsResult && (
                  <div className="mt-2 text-center">
                    <p className="text-xs text-gray-500">
                      IPFS:
                      <a
                        href={ipfsResult.pinata_gateway_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-1 text-orange-500 hover:underline"
                      >
                        {ipfsResult.hash.substring(0, 15)}...
                      </a>
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      View on:{" "}
                      <a
                        href={ipfsResult.gateway_url}
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

              <div className="md:order-2">
                <FormField>
                  <FormLabel htmlFor="title" required>
                    Drop Title
                  </FormLabel>
                  <FormInput
                    id="title"
                    placeholder=""
                    {...register("title")}
                    error={errors.title}
                    maxLength={150}
                  />
                  <div className="mt-1 text-right text-xs text-text-secondary">
                    {watch("title")?.length || 0}/150
                  </div>
                </FormField>

                <FormField>
                  <FormLabel htmlFor="description" required>
                    Drop Description
                  </FormLabel>
                  <FormTextarea
                    id="description"
                    placeholder=""
                    {...register("description")}
                    error={errors.description}
                    rows={6}
                    maxLength={1500}
                    characterCount={descriptionCount}
                  />
                </FormField>

                <FormField>
                  <FormLabel htmlFor="symbol" required>
                    Token Symbol
                  </FormLabel>
                  <FormInput
                    id="symbol"
                    placeholder="e.g., TWINN"
                    {...register("symbol")}
                    error={errors.symbol}
                    maxLength={10}
                  />
                  <div className="mt-1 text-right text-xs text-text-secondary">
                    {watch("symbol")?.length || 0}/10
                  </div>
                </FormField>

                <FormField>
                  <FormLabel htmlFor="website">Website</FormLabel>
                  <div className="flex items-center">
                    <div className="flex-shrink-0 rounded-s-lg border border-border-primary/50 bg-gray-50 p-3 py-2 text-text-secondary">
                      https://
                    </div>
                    <FormInput
                      id="website"
                      className="rounded-s-none"
                      placeholder=""
                      {...register("website", {
                        onChange: handleWebsiteChange,
                      })}
                      error={errors.website}
                    />
                  </div>
                </FormField>

                <div className="mb-6">
                  <FormField>
                    <FormLabel htmlFor="dateRange" required>
                      Select Date Range
                    </FormLabel>
                    <Controller
                      name="dateRange"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          id="dateRange"
                          dateRange={field.value}
                          onChange={(range) => field.onChange(range)}
                          error={
                            errors.dateRange ||
                            errors.startDate ||
                            errors.endDate
                          }
                          placeholder="Select Date Range"
                          minDate={new Date()}
                        />
                      )}
                    />
                  </FormField>
                </div>

                <FormField>
                  <FormLabel htmlFor="attendees" required>
                    Amount of Attendees
                  </FormLabel>
                  <FormInput
                    id="attendees"
                    type="number"
                    placeholder="000"
                    {...register("attendees", { valueAsNumber: true })}
                    error={errors.attendees}
                    min={1}
                  />
                </FormField>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <Button
                type="submit"
                className="mt-8 z-50 flex w-64 items-center justify-center bg-black font-garamond text-lg italic text-white hover:bg-black/80"
                disabled={isUploading || isCreatingNFT}
              >
                {isCreatingNFT ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin text-white"
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
                    Creating NFT...
                  </span>
                ) : (
                  "Create Drop"
                )}
              </Button>
            </div>
          </form>
        </div>
      </GridWrapper>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={closeSuccessModal}
        dropTitle={title || ""}
        nftResponse={nftResponse}
      />
    </div>
  );
}
