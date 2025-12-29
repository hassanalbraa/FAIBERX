'use server';

/**
 * @fileOverview An AI agent that suggests clothing items based on a user's photo.
 *
 * - generateOutfitSuggestions - A function that handles the outfit suggestion process.
 * - GenerateOutfitSuggestionsInput - The input type for the generateOutfitSuggestions function.
 * - GenerateOutfitSuggestionsOutput - The return type for the generateOutfitSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateOutfitSuggestionsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateOutfitSuggestionsInput = z.infer<typeof GenerateOutfitSuggestionsInputSchema>;

const GenerateOutfitSuggestionsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('An array of clothing item names that match the user style.'),
});
export type GenerateOutfitSuggestionsOutput = z.infer<typeof GenerateOutfitSuggestionsOutputSchema>;

export async function generateOutfitSuggestions(
  input: GenerateOutfitSuggestionsInput
): Promise<GenerateOutfitSuggestionsOutput> {
  return generateOutfitSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateOutfitSuggestionsPrompt',
  input: {schema: GenerateOutfitSuggestionsInputSchema},
  output: {schema: GenerateOutfitSuggestionsOutputSchema},
  prompt: `You are a personal stylist for an online clothing store.

  A user has uploaded a photo of themselves. Analyze their style in the photo and suggest clothing items from the store that match their style.
  Return only the names of the clothing items. Do not include any extra text.

  Photo: {{media url=photoDataUri}}`,
});

const generateOutfitSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateOutfitSuggestionsFlow',
    inputSchema: GenerateOutfitSuggestionsInputSchema,
    outputSchema: GenerateOutfitSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
