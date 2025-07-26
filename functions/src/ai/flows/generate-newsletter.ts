import { defineFlow } from '@genkit-ai/flow';
import { z } from 'zod';
import { geminiPro } from '@genkit-ai/googleai';
import { generate } from '@genkit-ai/ai';
import * as admin from 'firebase-admin';
import { Brand, MediaAsset } from '@/types/firestore';
import mjml2html from 'mjml';
import { trackAiCall } from '../utils/ai-usage-tracker';
import { moderateTextFlow } from './moderation';

// ... (Initialization and Zod schemas are unchanged)

export const generateNewsletterFlow = defineFlow(
  {
    name: 'generateNewsletterFlow',
    inputSchema: z.object({ /* ... schema unchanged ... */ }),
    outputSchema: z.object({ html: z.string() }),
    auth: { user: true },
  },
  async ({ brandId, topic, selectedAssetIds }, context) => {
    const uid = context.auth!.uid;
    // ... (logic for fetching brand/assets and creating prompt is unchanged)

    const llmResponse = await generate({
      model: geminiPro,
      prompt: designPrompt,
      output: { format: 'json', schema: NewsletterDesignSchema },
    });
    
    await trackAiCall(uid, llmResponse);

    const design = llmResponse.output();
    if (!design) throw new Error("AI failed to generate a newsletter design.");

    const allTextContent = design.sections.map(s => s.content || '').join(' ');
    const moderationResult = await runFlow(moderateTextFlow, allTextContent);
    if (!moderationResult.isSafe) {
        throw new Error(`Generated content violates safety policies (${moderationResult.categories.join(', ')}). Please try a different topic.`);
    }

    // 3. Render the JSON design to HTML using MJML directly as a string
    const mjmlString = `
      <mjml>
        <mj-body width="600px">
          <mj-section>
            <mj-column>
              <mj-image src="${brand.logoUrl}" width="150px" padding="10px 0"></mj-image>
            </mj-column>
          </mj-section>
          ${design.sections.map(section => {
            const imageAsset = section.imageId ? mediaAssets[section.imageId] : null;
            return `
              <mj-section background-color="#ffffff" padding="10px 20px">
                <mj-column>
                  ${section.title ? `<mj-text font-size="20px" font-weight="bold" color="${brand.colors[0] || '#333333'}">${section.title}</mj-text>` : ''}
                  ${imageAsset ? `<mj-image src="${imageAsset.url}" padding="10px 0"></mj-image>` : ''}
                  ${section.content ? `<mj-text font-size="16px" color="#555555" line-height="24px">${section.content}</mj-text>` : ''}
                </mj-column>
              </mj-section>
            `;
          }).join('')}
          <mj-section>
            <mj-column>
              <mj-text align="center" color="#999999" font-size="12px">© ${new Date().getFullYear()} ${brand.name}. All rights reserved.</mj-text>
            </mj-column>
          </mj-section>
        </mj-body>
      </mjml>
    `;
    
    const { html } = mjml2html(mjmlString, { validationLevel: 'soft' });
    
    return { html };
  }
);
