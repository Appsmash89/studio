'use server';

/**
 * @fileOverview AI-driven encouragement and casino-style catchphrases for user engagement.
 *
 * - getEncouragement - A function that returns an encouraging message.
 * - AiEncouragementInput - The input type for the getEncouragement function.
 * - AiEncouragementOutput - The return type for the getEncouragement function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiEncouragementInputSchema = z.object({
  gameEvent: z
    .enum(['win', 'loss', 'spin'])
    .describe('The event that triggered the encouragement.'),
  betAmount: z.number().describe('The amount the user bet.'),
  winAmount: z.number().optional().describe('The amount the user won, if applicable.'),
});
export type AiEncouragementInput = z.infer<typeof AiEncouragementInputSchema>;

const AiEncouragementOutputSchema = z.object({
  message: z.string().describe('An encouraging message or casino-style catchphrase.'),
  encouragementLevel: z
    .enum(['low', 'medium', 'high'])
    .describe('The level of encouragement to provide.'),
});
export type AiEncouragementOutput = z.infer<typeof AiEncouragementOutputSchema>;

export async function getEncouragement(input: AiEncouragementInput): Promise<AiEncouragementOutput> {
  return aiEncouragementFlow(input);
}

const aiEncouragementPrompt = ai.definePrompt({
  name: 'aiEncouragementPrompt',
  input: {schema: AiEncouragementInputSchema},
  output: {schema: AiEncouragementOutputSchema},
  prompt: `You are a casino host, providing encouraging messages to players.

  The player has experienced the following event: {{{gameEvent}}}
  They bet: {{{betAmount}}}
  They won: {{#if winAmount}}{{{winAmount}}}{{else}}nothing{{/if}}

  Generate an encouraging message appropriate for the event.
  Also, determine the encouragementLevel (low, medium, or high) based on the event and the amounts involved.  High encouragement should be used for big wins or close losses.
  The message should sound like it is coming from a real person.
  The message should be 1-2 sentences.
`,
});

const aiEncouragementFlow = ai.defineFlow(
  {
    name: 'aiEncouragementFlow',
    inputSchema: AiEncouragementInputSchema,
    outputSchema: AiEncouragementOutputSchema,
  },
  async input => {
    const {output} = await aiEncouragementPrompt(input);
    return output!;
  }
);
