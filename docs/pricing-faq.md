# Pricing FAQ (M9)

**What plans are available?** Starter ($49/mo or $490/yr), Pro ($149/mo or $1490/yr), and Agency ($399/mo or $3990/yr) with Agency extra brands at $30/mo each.

**What does an extra brand include?** Each extra brand adds one brand slot plus 20 videos and 100 images per month and is flagged as `isExtraBrand` in the brand record.

**How are brand limits enforced?** Brand creation goes through `manageBrandFlow`, which checks plan base limits plus `subscriptionMeta.extraBrandCount` and blocks non-agency overages.

**Where do I change billing?** CTA buttons route to `/register?plan=...` (or `/app/billing` when enabled). Yearly toggles adjust the plan ID and displayed price only.
