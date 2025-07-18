import { defineFlow, run } from '@genkit-ai/flow';
import { z } from 'zod';
import { geminiPro } from '@genkit-ai/googleai';
import { getAuth } from 'firebase/auth';

const ScrapeDataSchema = z.object({
  logoUrl: z.string().url().nullable(),
  colors: z.array(z.string()),
  textContent: z.string(),
});

const BrandKitSchema = z.object({
    name: z.string().describe("The name of the company, extracted from the text."),
    brandVoice: z.string().describe("A one-sentence summary of the brand's tone of voice."),
    keyInfo: z.string().describe("A short paragraph summarizing the key products or services offered."),
    suggestedColors: z.array(z.string()).describe("An array of up to 5 hex color codes suggested for the brand."),
});


export const performBrandAuditFlow = defineFlow(
  {
    name: 'performBrandAuditFlow',
    inputSchema: z.string().url("Please provide a valid URL."),
    outputSchema: BrandKitSchema,
  },
  async (url) => {
    // 1. Get auth token to authenticate with the scraper service
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to perform an audit.');
    }
    const idToken = await user.getIdToken();

    // 2. Call the external scraper service
    // IMPORTANT: Replace this with your deployed Cloud Run URL
    const scraperServiceUrl = 'https://scraper-service-ttdoohacpq-uc.a.run.app'; // Placeholder URL
    
    let scrapedData;
    try {
        const response = await fetch(scraperServiceUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
            body: JSON.stringify({ url }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Scraper service failed with status ${response.status}: ${errorBody}`);
        }
        scrapedData = ScrapeDataSchema.parse(await response.json());
    } catch (e) {
        console.error("Error calling scraper service:", e);
        throw new Error("Could not retrieve data from the website. It might be protected or temporarily unavailable.");
    }
    
    // 3. Use AI to analyze the scraped text
    const analysisPrompt = `Analyze the following website text to generate a brand kit. Extract the company name, summarize its brand voice in one sentence, and describe its key products/services in a short paragraph. Website Text: "${scrapedData.textContent}"`;
    
    const llmResponse = await run('extractBrandKit', async () =>
        geminiPro.generate({
            prompt: analysisPrompt,
            output: { format: 'json', schema: BrandKitSchema },
        })
    );
    
    const brandKit = llmResponse.output();
    if (!brandKit) throw new Error("The AI failed to generate a brand kit from the provided text.");

    // Supplement with scraped data
    brandKit.suggestedColors = scrapedData.colors;

    return brandKit;
  }
);
