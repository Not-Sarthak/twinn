import { z } from "zod";

export const collectionFormSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters" })
    .max(150, { message: "Title cannot exceed 150 characters" }),

  type: z.string().min(1, { message: "Collection type is required" }),

  creator: z
    .string()
    .max(100, { message: "Creator name cannot exceed 100 characters" })
    .optional(),

  description: z
    .string()
    .max(1500, { message: "Description cannot exceed 1500 characters" }),

  link: z
    .string()
    .refine(
      (val) => {
        if (val === "") return true;
        try {
          new URL(val.startsWith("https://") ? val : `https://${val}`);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Please enter a valid URL" },
    )
    .optional(),

  coverImage: z.any().optional(),
  logoImage: z.any().optional(),

  // For storing drops associated with this collection
  drops: z.array(z.string()).default([]),
});

export type CollectionFormValues = z.infer<typeof collectionFormSchema>;
