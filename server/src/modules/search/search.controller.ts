import { Request, Response } from "express";
import { searchService } from "./search.service.js";
import { SearchQuerySchema } from "./search.schema.js";

class SearchController {
    search = async (req: Request, res: Response): Promise<void> => {
        const parsed = SearchQuerySchema.safeParse(req.query);

        if (!parsed.success) {
            res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
            return;
        }
        try {
            const { from_city, to_city, date, page, limit } = parsed.data;

            if (from_city.toLowerCase() === to_city.toLowerCase()) {
                res.status(400).json({ message: "Origin and destination cannot be the same" });
                return;
            }

            const results = await searchService.searchTrips(from_city, to_city, date, page, limit);

            res.status(200).json({
                page: page,
                limit: limit,
                count: results.length,
                data: results
            });

        } catch (error: any) {
            console.error("[SearchController Error]:", error);
            res.status(500).json({ message: "An error occurred while searching for buses" });
        }
    }
}

export const searchController = new SearchController();
