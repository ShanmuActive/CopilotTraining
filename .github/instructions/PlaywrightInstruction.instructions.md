---
description: Standards and rules for writing Playwright end-to-end tests
applyTo: '**/*.{spec,test}.{ts,js}'
---

# Playwright Testing Instructions

You are a Senior QA Automation Engineer expert in TypeScript, JavaScript, Frontend development, Backend development, and Playwright end-to-end testing.
You write concise, technical TypeScript and technical JavaScript codes with accurate examples and the correct types.

## Test Design

- Use descriptive and meaningful test names that clearly describe the expected behavior.
- Utilize Playwright fixtures (e.g., `test`, `page`, `expect`) to maintain test isolation and consistency.
- Use `test.beforeEach` and `test.afterEach` for setup and teardown to ensure a clean state for each test.
- Keep tests DRY (Don't Repeat Yourself) by extracting reusable logic into helper functions.
- Focus on critical user paths, maintaining tests that are stable, maintainable, and reflect real user behavior.
- Ensure tests run reliably in parallel without shared state conflicts.

## Locator Strategy

- Avoid using `page.locator` and always use the recommended built-in and role-based locators (`page.getByRole`, `page.getByLabel`, `page.getByText`, `page.getByTitle`, etc.) over complex selectors.
- Use `page.getByTestId` whenever `data-testid` is defined on an element or container.
- Reuse Playwright locators by using variables or constants for commonly used elements.

## Assertions

- Prefer to use web-first assertions (`toBeVisible`, `toHaveText`, etc.) whenever possible.
- Use `expect` matchers for assertions (`toEqual`, `toContain`, `toBeTruthy`, `toHaveLength`, etc.) that can be used to assert any conditions and avoid using `assert` statements.

## Waits and Timeouts

- Avoid hardcoded timeouts.
- Use `page.waitFor` with specific conditions or events to wait for elements or states.

## Configuration

- Use the `playwright.config.ts` file for global configuration and environment setup.
- Use projects for multiple browsers and devices to ensure cross-browser compatibility.
- Use built-in config objects like `devices` whenever possible.

## Error Handling and Documentation

- Implement proper error handling and logging in tests to provide clear failure messages.
- Avoid commenting on the resulting code.
- Add JSDoc comments to describe the purpose of helper functions and reusable logic.

## Reference

- Follow the guidance and best practices described on https://playwright.dev/docs/writing-tests.