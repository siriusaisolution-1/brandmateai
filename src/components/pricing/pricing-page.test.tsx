import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';

import PricingPage from './pricing-page';

describe('PricingPage', () => {
  it('renders agency extra brand pricing note', () => {
    const html = renderToString(<PricingPage />);
    expect(html).toContain('+30 USD / month per extra brand');
  });
});
