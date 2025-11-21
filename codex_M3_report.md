# M3 – Master AI Chat MVP – Report

## 1. Summary

- Added initial data models for Master AI Chat, including chat sessions, chat messages, and content requests.
- Implemented parsing and document-building helpers for Master AI responses with unit coverage.
- Hardened Firestore rules to protect chat and content request collections and introduced regression tests.

## 2. Data model & Firestore

- Final interfaces:
  - `ContentRequest` with goal, channels, requested outputs, brief, and status fields.
  - `ChatSession` with owner, brand linkage, timestamps, and last request pointer.
  - `ChatMessage` with session linkage, role, content, and timestamps.
- Collections & relations:
  - `chatSessions/{sessionId}`, `chatMessages/{messageId}`, `contentRequests/{id}` are un-nested and connected via `sessionId`/`brandId`.
- Firestore rules:
  - Chat sessions/messages restricted to the owning user; assistant writes allowed only for the session owner.
  - Content requests require authenticated brand owners and enforce matching `userId`.

## 3. Backend – Master AI endpoint

- Endpoint path/type:
  - Placeholder for `/api/master-chat` to be completed in follow-up.
- Brief description:
  - Helpers added to parse structured AI JSON (`assistant_reply` and optional `maybe_content_request`).
  - Parsing extracts assistant reply and optional structured request payload for persistence.

## 4. Frontend – Chat & Requests

- `/app/brands/{brandId}/chat`:
  - Not yet implemented in this iteration.
- `/app/brands/{brandId}/requests` (+ detail page):
  - Not yet implemented in this iteration.

## 5. Tests

- Test commands:
  - `pnpm test:unit`
- New test files:
  - `src/__tests__/master-chat/response.test.ts`
  - `tests/app/firestore-rules.test.ts`
- What they cover:
  - LLM response parsing and content request document builder defaults.
  - Firestore rules for chat sessions/messages and content requests ownership constraints.

## 6. Manual QA

- Manual scenario not executed in this iteration.

## 7. Known limitations & Next steps

- Master AI endpoint and chat/requests UI remain to be implemented.
- Future work: wire API to LLM with BrandMemory context, build chat UI and request listing/detail pages, and connect creation flow end-to-end.
