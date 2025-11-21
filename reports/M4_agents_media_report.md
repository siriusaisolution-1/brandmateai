# M4 – Agents & Media Generation – Implementation Report

## 1. Summary

- Added Output model and repository utilities to persist generated media and copy for each content request.
- Implemented Copy, Visual, and Video agents with Genkit prompts/adapters plus an orchestrator flow to process requests end-to-end.
- Updated Firestore rules and documentation for the new outputs collection and added rules/unit tests to keep coverage green.

## 2. Data model & rules

### 2.1. Output model

- Type definition location:
  - `functions/src/types/firestore.ts`
- Collection structure:
  - `outputs/{outputId}` (global) with explicit `brandId` and `requestId` fields.
- Notes on how Outputs link to ContentRequest and Brand.

### 2.2. Firestore rules

- Files changed:
  - `firestore.rules`
- Access policy for Outputs:
  - Read/write permitted for authenticated brand owners (backend pattern for writes).
- Rules tests:
  - `tests/firestore.outputs.rules.test.ts`

## 3. Agents & Orchestrator

### 3.1. Copy Agent

- Implementation file(s):
  - `functions/src/ai/agents/copyAgent.ts`
- Responsibilities:
  - Build prompts from a `ContentBrief`, call Genkit, parse structured JSON (scenarios, hooks, captions, CTAs).
- How it is tested (mocks, sample payloads).
  - `functions/src/ai/agents/copyAgent.test.ts` mocks `ai.generate` and asserts parsing and prompt content.

### 3.2. Visual Agent

- Implementation file(s):
  - `functions/src/ai/agents/visualAgent.ts`
- Provider adapter:
  - `functions/src/ai/providers/novitaImageProvider.ts`
- How Outputs are created for images.
  - Generates prompts, calls the provider adapter, persists via `createOutputsBatch`.

### 3.3. Video Agent

- Implementation file(s):
  - `functions/src/ai/agents/videoAgent.ts`
- Provider adapter:
  - `functions/src/ai/providers/novitaVideoProvider.ts`
- Video limits / constraints (e.g. 1 video per ContentRequest).
  - Enforces a single video per request in this milestone.

### 3.4. Orchestrator flow

- Flow name & file:
  - `processContentRequest` in `functions/src/ai/flows/processContentRequestFlow.ts`
- Input/output schema:
  - Input: `{ contentRequestId, userId }`; Output: `{ requestId, outputsCount, status }`.
- Execution steps:
  - Load ContentRequest + Brand → build brief → run Copy/Visual/Video agents → write Output docs → update request status.

## 4. Tests

- Test command:
  - `pnpm test:unit`
- New/updated test files:
  - `functions/src/ai/agents/copyAgent.test.ts`
  - `functions/src/ai/agents/visualAgent.test.ts`
  - `functions/src/ai/agents/videoAgent.test.ts`
  - `functions/src/ai/repositories/outputRepo.test.ts`
  - `functions/src/ai/flows/processContentRequestFlow.test.ts`
  - `tests/firestore.outputs.rules.test.ts`
- What is covered:
  - Prompt building, provider/result mapping, repository interactions, orchestrator wiring, and Firestore rules for outputs.

## 5. Project state

- M4 status: done
- `codex.currentMilestoneId`: M4
- If M4 is not fully done:
  - n/a
  - Suggested follow-up tasks.

## 6. Risks & next steps

- Known limitations (e.g. single video per request, no direct publishing).
- Recommended focus for next milestones (e.g. M5 – Library & Requests UI).
