import { describe, expect, it } from 'vitest';
import { buildContentRequestDocument, parseMasterAIResponse } from '@/lib/master-chat/response';

describe('parseMasterAIResponse', () => {
  it('parses valid response with content request', () => {
    const payload = {
      assistant_reply: 'Evo plana za tvoje objave!',
      maybe_content_request: {
        should_create: true,
        title: 'Black Friday Reels',
        description: 'Serija kratkih promotivnih videa',
        goal: 'increase_sales',
        channels: ['instagram_reels'],
        requestedOutputs: { video: 4, image: 2 },
        masterBrief: { key_points: ['promo', 'hitni popust'] },
      },
    };

    const result = parseMasterAIResponse(JSON.stringify(payload));

    expect(result.assistantReply).toContain('Evo plana');
    expect(result.contentRequest?.title).toBe('Black Friday Reels');
    expect(result.contentRequest?.channels).toEqual(['instagram_reels']);
  });

  it('returns only assistant reply when no request suggested', () => {
    const payload = { assistant_reply: 'Spremna sam da počnemo!' };

    const result = parseMasterAIResponse(JSON.stringify(payload));

    expect(result.assistantReply).toBe(payload.assistant_reply);
    expect(result.contentRequest).toBeUndefined();
  });

  it('falls back gracefully on invalid JSON', () => {
    const result = parseMasterAIResponse('not-json');

    expect(result.assistantReply).toContain('not-json');
    expect(result.contentRequest).toBeUndefined();
  });
});

describe('buildContentRequestDocument', () => {
  it('applies defaults and wiring for new content request', () => {
    const parsed = {
      title: 'Test request',
      description: 'Opis',
      goal: 'engagement' as const,
      channels: ['tiktok'],
      requestedOutputs: { video: 2 },
      masterBrief: { summary: 'Sažetak' },
    };

    const doc = buildContentRequestDocument({
      parsed,
      brandId: 'b1',
      userId: 'u1',
      sessionId: 's1',
    });

    expect(doc.status).toBe('draft');
    expect(doc.brandId).toBe('b1');
    expect(doc.userId).toBe('u1');
    expect(doc.createdFromChatId).toBe('s1');
    expect(doc.channels).toEqual(['tiktok']);
    expect(doc.requestedOutputs.video).toBe(2);
    expect(doc.createdAt).toBeTruthy();
    expect(doc.updatedAt).toBeTruthy();
  });
});
