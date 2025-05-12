import { z } from "zod";

export const dropFormSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters" })
    .max(150, { message: "Title cannot exceed 150 characters" }),

  description: z
    .string()
    .min(20, { message: "Description must be at least 20 characters" })
    .max(1500, { message: "Description cannot exceed 1500 characters" }),

  website: z
    .string()
    .refine(
      (val) => {
        if (val === "") return true;

        try {
          new URL(`https://${val}`);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Please enter a valid domain (e.g., example.com)" },
    )
    .optional(),

  dateRange: z
    .object({
      from: z.date(),
      to: z.date().optional(),
    })
    .optional()
    .refine(
      (data) => {
        if (!data) return false;
        return data.from > new Date();
      },
      {
        message: "Start date must be in the future",
      },
    )
    .refine(
      (data) => {
        if (!data || !data.to) return true;
        return data.to >= data.from;
      },
      {
        message: "End date must be after or equal to start date",
      },
    ),

  startDate: z.date().nullable().optional(),
  endDate: z.date().nullable().optional(),

  attendees: z
    .number({ required_error: "Number of attendees is required" })
    .min(1, { message: "At least 1 attendee is required" })
    .max(10000, { message: "Maximum 10,000 attendees allowed" }),

  artwork: z.any().optional(),
  ipfsHash: z.string().optional(),

  // NFT-specific fields
  symbol: z
    .string()
    .min(1, { message: "Symbol is required" })
    .max(10, { message: "Symbol cannot exceed 10 characters" })
    .optional(),

  recipientAddress: z
    .string()
    .refine(
      (val) => {
        if (!val || val === "") return true;
        return val.length === 43 || val.length === 44;
      },
      { message: "Recipient address must be 43-44 characters" },
    )
    .optional(),

  createNFT: z.boolean().default(false),
});

export type DropFormValues = z.infer<typeof dropFormSchema>;

// Compressed NFT response type
export interface CompressedNFTResponse {
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
