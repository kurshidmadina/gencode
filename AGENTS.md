# Gencode Agent Instructions

Gencode is a premium gamified technical-learning platform. It is not a generic coding-practice website.

Gencode is a futuristic RPG-style platform for mastering:

- Linux
- SQL
- Data structures
- Algorithms
- Coding languages
- Debugging
- Git
- Bash
- APIs
- System design basics
- DevOps fundamentals

## Product Standard

Every feature should support the core loop:

1. User learns.
2. User solves challenges.
3. User gets feedback.
4. User earns XP, coins, and badges.
5. User unlocks harder content.
6. User receives AI mentorship.
7. User returns to continue progression.

## Design Standard

The UI should feel:

- Premium
- Futuristic
- Developer-focused
- Game-like
- Dark-first
- Accessible
- Responsive
- Polished

Avoid generic SaaS dashboards. Use strong visual hierarchy, smooth interactions, excellent spacing, meaningful animations, and product-specific microcopy.

## Engineering Standard

Code must be:

- Type-safe
- Modular
- Maintainable
- Secure
- Tested where practical
- Production-minded
- Free of fake main flows
- Free of hardcoded secrets
- Free of unsafe code execution

## Challenge Engine Standard

Challenge data must be meaningful. Avoid filler challenges.

Every challenge should have:

- Clear title
- Scenario
- Difficulty
- Category
- Instructions
- Hints
- Tests or validation rules
- Solution
- Explanation
- XP reward
- Tags

## AI Assistant Standard

The assistant is named Genie.

Genie should act as:

- Mentor
- Debugger
- Interviewer
- Hint provider
- Code reviewer
- SQL reviewer
- Linux command coach
- Motivation coach
- VR voice companion

Genie should be contextual and should not instantly leak full answers unless the app explicitly allows it.

## Security Standard

Never execute arbitrary user code directly in the main app process.

Use:

- Runner abstraction
- Mock runner for local development
- Containerized runner design for production
- Zod validation
- Authorization checks
- Rate limiting
- Sanitization
- Safe SQL validation
- Safe Linux simulation

## When Improving the App

Do not only suggest. Implement.

Do not leave placeholder critical pages. Do not create fake buttons. Do not break existing flows. Do not ignore tests.

Run lint, typecheck, tests, and build when possible.

## Final Response Expectations

Always report:

- What changed
- Files modified
- Commands run
- Build/test status
- Remaining limitations
- Recommended next steps
