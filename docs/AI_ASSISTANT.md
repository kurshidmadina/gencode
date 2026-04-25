# Genie AI Assistant

Genie is Gencode's contextual technical mentor. It supports mentor, hint, debugging, concept, interviewer, coach, Socratic, code review, SQL review, Linux command coach, motivation, and VR modes.

## Providers

- `MockAssistantProvider`: default local provider with deterministic guardrails.
- `OpenAICompatibleAssistantProvider`: uses `OPENAI_COMPATIBLE_API_KEY`, `OPENAI_COMPATIBLE_BASE_URL`, and `OPENAI_COMPATIBLE_MODEL`.

## Guardrails

Genie avoids dumping full solutions unless explicitly allowed by platform policy. On challenge pages, it first provides hints, invariants, debugging questions, and edge-case guidance. Secret-looking content is blocked from external provider calls.

## Context

The assistant can receive challenge slug, mode, session history, and request context. Logged-in conversations persist through `ChatSession` and `ChatMessage`.
