/**
 * GLOBAL TEST SETUP
 *
 * This file runs ONCE before every test file (configured via setupFiles in
 * vitest.config.js). Think of it as the "before school" routine — you do it
 * once and every class (test file) inherits the result.
 *
 * What we set up here:
 *  1. @testing-library/jest-dom  — adds extra matchers like toBeInTheDocument(),
 *     toBeDisabled(), toHaveTextContent(). Without this import those matchers
 *     don't exist and your assertions throw "not a function" errors.
 *
 *  2. A global fetch mock — our components call the real browser fetch() to
 *     hit the API. In tests there is no server, so we replace fetch with a
 *     vi.fn() (Vitest's version of jest.fn()) so the call succeeds silently
 *     and we can assert on what was requested.
 *
 *  3. A ResizeObserver stub — MUI components (like Dialog, Drawer) use
 *     ResizeObserver internally. jsdom doesn't ship with it, so tests crash
 *     without this one-line stub.
 *
 *  4. beforeEach cleanup — vi.clearAllMocks() resets call counts and return
 *     values between tests so earlier tests can't "bleed" state into later ones.
 */

import '@testing-library/jest-dom';
import { vi, beforeEach } from 'vitest';

// ─── Global fetch mock ───────────────────────────────────────────────────────
// Components call fetch() for API requests. We replace it with a no-op so
// tests don't make real HTTP calls. Individual tests can override this:
//   global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({...}) })
global.fetch = vi.fn(() =>
    Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
    })
);

// ─── ResizeObserver stub ─────────────────────────────────────────────────────
// jsdom doesn't implement ResizeObserver; MUI needs it. This empty class
// satisfies the API contract without doing anything.
global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
};

// ─── Reset between tests ─────────────────────────────────────────────────────
// vi.clearAllMocks() resets mock.calls, mock.instances, and mock.results but
// keeps the mock implementation. This prevents test order from mattering.
beforeEach(() => {
    vi.clearAllMocks();
});
