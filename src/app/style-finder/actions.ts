"use server";

import { generateOutfitSuggestions } from "@/ai/flows/generate-outfit-suggestions";
import { z } from "zod";

const actionInputSchema = z.string().refine(
    (s) => s.startsWith('data:image/'), 
    "Input must be a data URI for an image."
);

export async function getOutfitSuggestions(photoDataUri: string) {
    const validation = actionInputSchema.safeParse(photoDataUri);

    if (!validation.success) {
        throw new Error("Invalid input: Not an image data URI.");
    }

    try {
        const result = await generateOutfitSuggestions({ photoDataUri: validation.data });
        return result;
    } catch (error) {
        console.error("Error in generateOutfitSuggestions flow:", error);
        throw new Error("Failed to generate outfit suggestions.");
    }
}
