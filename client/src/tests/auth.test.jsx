/**
 * AUTH TESTS  —  Login form behaviour
 *
 * WHAT WE ARE TESTING
 * -------------------
 * The LoginScreen component.  We want to verify:
 *   1. It renders the correct form fields.
 *   2. Submitting the form calls auth.loginUser() with the right arguments.
 *   3. When auth.errorMessage is set the error dialog appears.
 *   4. The "register" link is visible.
 *
 * WHY NOT TEST THE REAL API?
 * --------------------------
 * Unit tests test one thing at a time. The LoginScreen's job is to collect
 * form data and call auth.loginUser(). It does NOT know or care whether the
 * server accepts that email — that's the server's job and belongs in a
 * separate integration test. By mocking loginUser we isolate the component.
 *
 * KEY TESTING-LIBRARY CONCEPTS USED HERE
 * ---------------------------------------
 * • screen.getByLabelText()  — finds an input by its <label> text. This is
 *   the recommended way because it mirrors how a screen-reader user finds
 *   a field: by its label, not by a CSS class or test-id.
 * • screen.getByRole()       — finds by ARIA role ('button', 'dialog', …).
 *   Prefer this over getByTestId() because it also validates accessibility.
 * • fireEvent.submit()       — triggers a synthetic form submit event.
 * • userEvent.type()         — simulates a real user typing character by
 *   character (fires keydown, keypress, keyup, change per character).
 *   More realistic than fireEvent.change() which fires a single change event.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import LoginScreen from '../components/LoginScreen';
import { renderWithProviders, mockAuthLoggedOut } from './helpers';

// ─── describe groups related tests ───────────────────────────────────────────
// Think of describe() as a chapter heading. It groups tests for the same
// component or feature so the output is easy to scan.

describe('LoginScreen', () => {

    // ── 1. Rendering ────────────────────────────────────────────────────────
    it('renders the email field, password field, and submit button', () => {
        renderWithProviders(<LoginScreen />, { auth: mockAuthLoggedOut });

        // getByLabelText finds the input whose <label> matches the regex.
        // We use /email/i so it's case-insensitive (Email, EMAIL, email all pass).
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

        // getByRole('button') looks for <button> elements. 'name' is the
        // accessible name (the visible text or aria-label).
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('renders the "Sign in" heading', () => {
        renderWithProviders(<LoginScreen />, { auth: mockAuthLoggedOut });
        expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    });

    it('shows a link to the registration page', () => {
        renderWithProviders(<LoginScreen />, { auth: mockAuthLoggedOut });
        expect(screen.getByText(/need an account/i)).toBeInTheDocument();
    });

    // ── 2. Form submission ───────────────────────────────────────────────────
    it('calls auth.loginUser with the typed email and password', () => {
        const mockLoginUser = vi.fn();
        const auth = { ...mockAuthLoggedOut, loginUser: mockLoginUser };
        renderWithProviders(<LoginScreen />, { auth });

        // userEvent.type() simulates realistic keyboard input.
        userEvent.type(screen.getByLabelText(/email/i), 'user@test.com');
        userEvent.type(screen.getByLabelText(/password/i), 'mypassword');

        // Submit the form — we find the form element via the button inside it.
        const form = screen.getByRole('button', { name: /sign in/i }).closest('form');
        fireEvent.submit(form);

        // toHaveBeenCalledWith() asserts the mock was called with exact args.
        // This is the key assertion: the component must forward whatever the
        // user typed to the auth layer unchanged.
        expect(mockLoginUser).toHaveBeenCalledWith('user@test.com', 'mypassword');
    });

    it('calls auth.loginUser exactly once per submit', () => {
        const mockLoginUser = vi.fn();
        const auth = { ...mockAuthLoggedOut, loginUser: mockLoginUser };
        renderWithProviders(<LoginScreen />, { auth });

        userEvent.type(screen.getByLabelText(/email/i), 'a@b.com');
        userEvent.type(screen.getByLabelText(/password/i), 'pass1234');
        fireEvent.submit(screen.getByRole('button', { name: /sign in/i }).closest('form'));

        // toHaveBeenCalledTimes(1) guards against accidental double-calls.
        expect(mockLoginUser).toHaveBeenCalledTimes(1);
    });

    // ── 3. Error state ───────────────────────────────────────────────────────
    it('shows an error dialog (Notice) when auth.errorMessage is set', () => {
        const auth = {
            ...mockAuthLoggedOut,
            errorMessage: 'Wrong email or password provided.',
            clearError: vi.fn(),
        };
        renderWithProviders(<LoginScreen />, { auth });

        // MUIErrorModal renders a Dialog with title "Notice" when errorMessage != null.
        // getByRole('dialog') finds it in the DOM.
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Notice')).toBeInTheDocument();
        expect(screen.getByText('Wrong email or password provided.')).toBeInTheDocument();
    });

    it('does NOT show an error dialog when errorMessage is null', () => {
        renderWithProviders(<LoginScreen />, { auth: { ...mockAuthLoggedOut, errorMessage: null } });
        // queryByRole returns null instead of throwing when the element isn't found.
        // Use it whenever you're asserting something is ABSENT.
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
});
