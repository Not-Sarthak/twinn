import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";

interface CompressedNFTResponse {
  mintAddress: string;
  createTxId: string;
  poolTxId: string;
  mintTxId: string;
  compressTxId: string;
  metadataUri: string;
  uniqueCode: string;
  transferAmount: number;
  transferTxId?: string;
}

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  dropTitle: string;
  nftResponse?: CompressedNFTResponse | null;
  dropId?: string | null;
}

export function SuccessModal({
  isOpen,
  onClose,
  dropTitle,
  nftResponse,
  dropId,
}: SuccessModalProps) {
  const claimUrl = nftResponse
    ? `${window.location.origin}/mint?mintAddress=${nftResponse.mintAddress}&uniqueCode=${nftResponse.uniqueCode}`
    : "";

  const shareOnTwitter = () => {
    const text = nftResponse
      ? `I just created a Compressed NFT with code: ${nftResponse.uniqueCode} #Solana #CompressedNFT`
      : `I just created a new drop on my local environment!`;

    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      "_blank",
    );
  };

  const downloadQR = () => {
    const canvas = document.getElementById("qr-canvas") as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `compressed-nft-${nftResponse?.uniqueCode || "drop"}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const openInExplorer = (type: "address" | "tx", value: string) => {
    const baseUrl = "https://explorer.solana.com";
    const cluster = "devnet"; // or 'mainnet-beta' depending on your environment
    const url =
      type === "address"
        ? `${baseUrl}/address/${value}?cluster=${cluster}`
        : `${baseUrl}/tx/${value}?cluster=${cluster}`;

    window.open(url, "_blank");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="m-4 w-full max-w-lg overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl md:m-0"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
              duration: 0.3,
            }}
          >
            <div className="relative flex flex-col">
              <div className="absolute right-4 top-4">
                <button
                  onClick={onClose}
                  className="group flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-all hover:bg-orange-100"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-gray-500 transition-colors group-hover:text-orange-500"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <div className="p-6 text-center">
                <motion.div
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-orange-500"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900">
                    Drop Created Successfully!
                  </h3>
                  <p className="mt-1 text-gray-600">{dropTitle}</p>
                </motion.div>

                {nftResponse && (
                  <motion.div
                    className="mt-6 space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-gray-50">
                      <table className="w-full divide-y divide-gray-200 text-left">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-xs font-medium uppercase tracking-wider text-gray-500">
                              Property
                            </th>
                            <th className="px-4 py-2 text-xs font-medium uppercase tracking-wider text-gray-500">
                              Value
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          <tr>
                            <td className="px-4 py-3 text-sm font-medium text-gray-700">
                              Mint Address
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              <button
                                className="flex cursor-pointer items-center font-mono transition-colors hover:text-orange-500"
                                onClick={() =>
                                  openInExplorer(
                                    "address",
                                    nftResponse.mintAddress,
                                  )
                                }
                                title="View on Solana Explorer"
                              >
                                {nftResponse.mintAddress.length > 20
                                  ? `${nftResponse.mintAddress.substring(0, 10)}...${nftResponse.mintAddress.substring(nftResponse.mintAddress.length - 10)}`
                                  : nftResponse.mintAddress}
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="ml-1"
                                >
                                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                  <polyline points="15 3 21 3 21 9"></polyline>
                                  <line x1="10" y1="14" x2="21" y2="3"></line>
                                </svg>
                              </button>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-sm font-medium text-gray-700">
                              Unique Code
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              <span className="font-mono">
                                {nftResponse.uniqueCode}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-sm font-medium text-gray-700">
                              Compression Tx
                            </td>
                            <td className="max-w-[200px] truncate px-4 py-3 text-sm text-gray-700">
                              <button
                                className="flex cursor-pointer items-center font-mono transition-colors hover:text-orange-500"
                                onClick={() =>
                                  openInExplorer("tx", nftResponse.compressTxId)
                                }
                                title="View on Solana Explorer"
                              >
                                {nftResponse.compressTxId.length > 20
                                  ? `${nftResponse.compressTxId.substring(0, 10)}...${nftResponse.compressTxId.substring(nftResponse.compressTxId.length - 10)}`
                                  : nftResponse.compressTxId}
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="ml-1"
                                >
                                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                  <polyline points="15 3 21 3 21 9"></polyline>
                                  <line x1="10" y1="14" x2="21" y2="3"></line>
                                </svg>
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <motion.div
                      className="mt-6 flex flex-col items-center justify-center"
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <p className="mb-3 text-sm font-medium text-gray-800">
                        Scan QR Code to Mint Automatically
                      </p>
                      <div className="mb-4 rounded-xl border border-gray-200 bg-white p-2 shadow-sm transition-shadow hover:shadow-md">
                        {claimUrl && (
                          <div className="bg-white p-2">
                            <QRCodeSVG
                              id="qr-canvas"
                              value={claimUrl}
                              size={180}
                              level="H"
                              includeMargin={true}
                              className="mx-auto"
                              bgColor="#FFFFFF"
                              fgColor="#000000"
                            />
                          </div>
                        )}
                      </div>

                      <div className="mt-2 flex flex-wrap justify-center gap-3">
                        <button
                          onClick={downloadQR}
                          className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gray-800 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-gray-700"
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
                            className="mr-2"
                          >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                          </svg>
                          Download QR
                        </button>

                        <button
                          onClick={shareOnTwitter}
                          className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-orange-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-orange-600"
                        >
                          <span className="absolute inset-0 bg-gradient-to-b from-white/20 opacity-0 transition-opacity group-hover:opacity-100"></span>
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
                            className="mr-2"
                          >
                            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                          </svg>
                          Share
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
