import * as z from "zod";

export const DEFAULT_CATEGORIES = [
  { id: "7bfa5ebc-d224-4fcb-8653-eabb2c033ada", name: "Apartment" },
  { id: "3221f106-cb21-4020-bb5b-283e52992653", name: "Luxury Villa" },
  { id: "4331092f-4b2e-401d-9add-0fd525787e5f", name: "Studio" },
];

export const propertySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long"),
  address: z.string().min(2, "Address is required"),
  location: z.string().min(2, "Location/City is required"),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  categoryId: z.string().min(1, "Please select a category"),
  isAvailable: z.boolean(),
  imageUrl: z
    .string()
    .url("Please enter a valid Image URL")
    .optional()
    .or(z.literal("")),
});

export type PropertyFormValues = z.infer<typeof propertySchema>;

export interface Category {
  id: string;
  name: string;
}
