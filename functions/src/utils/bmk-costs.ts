// functions/src/utils/bmk-costs.ts
// This file is the single source of truth for all billable actions.
// Formula: BMK Cost = (Our Cost in USD * 10) / 0.099
// 1 BMK = $0.099 USD

export const BMK_COSTS = {
  // Video Generation
  VIDEO_GENERATION_6S: 44.44, // ($0.44 * 10) / 0.099
  VIDEO_GENERATION_12S: 88.89, // ($0.88 * 10) / 0.099

  // Image Generation & Editing
  TEXT_TO_IMAGE_STANDARD: 0.40, // ($0.004 * 10) / 0.099
  IMAGE_TO_IMAGE: 0.40, // ($0.004 * 10) / 0.099
  INPAINTING: 0.61, // ($0.006 * 10) / 0.099
  SEEDREAM_PREMIUM: 3.03, // ($0.03 * 10) / 0.099
  REMOVE_BACKGROUND: 1.72, // ($0.017 * 10) / 0.099
  REPLACE_BACKGROUND: 2.58, // ($0.0255 * 10) / 0.099
  CLEANUP: 1.72, // ($0.017 * 10) / 0.099
  REMOVE_TEXT: 1.72, // ($0.017 * 10) / 0.099
  UPSCALE: 1.52, // ($0.015 * 10) / 0.099
  
  // LoRA Model Training
  LORA_TRAINING: 101.01, // ($1.00 * 10) / 0.099

  // Text & Strategy (Gemini Models)
  STRATEGIC_ANALYSIS: 1.61, // ($0.0159 * 10) / 0.099
  BRAND_AUDIT: 1.32, // ($0.0131 * 10) / 0.099
  BLOG_POST: 1.04, // ($0.0103 * 10) / 0.099
  NEWSLETTER_TEXT: 0.66, // ($0.00655 * 10) / 0.099
  AD_CAMPAIGN: 0.40, // ($0.00399 * 10) / 0.099
  SOCIAL_BURST: 0.07, // ($0.00065 * 10) / 0.099
  AI_CHAT_MESSAGE: 0.01, // ($0.00006 * 10) / 0.099

  // Email Services (Amazon SES)
  EMAIL_SEND_PER_1000: 1.01, // ($0.10 * 10) / 0.099
};
