import { z } from "zod";

export const SearchQuerySchema = z.object({
    from_city: z.string().min(1, "Origin city is required"),
    to_city: z.string().min(1, "Destination city is required"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format"),

    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(20)
});


export type SearchQuery = z.infer<typeof SearchQuerySchema>;
