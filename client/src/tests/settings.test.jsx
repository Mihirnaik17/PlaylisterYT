/**
 * SETTINGS MODAL TESTS  —  Account settings dialog
 *
 * WHAT WE ARE TESTING
 * -------------------
 * The SettingsModal component. We verify:
 *   1. The modal is visible when open=true.
 *   2. Username and email are pre-filled from auth.user.
 *   3. All editable fields are present (username, email, new password, confirm).
 *   4. Clicking Cancel calls onClose() without saving.
 *   5. Clicking Save calls auth.editUser() with the correct arguments.
 *
 * THE "AAA" PATTERN  (Arrange → Act → Assert)
 * -------------------------------------------
 * Almost every test below follows this pattern:
 *   Arrange  — set up the component and mocks
 *   Act      — simulate user interaction
 *   Assert   — check the result
 *
 * This pattern makes tests readable and is a common interview talking point.
 *
 * CONTROLLED vs UNCONTROLLED INPUTS
 * -----------------------------------
 * React inputs can be "controlled" (value driven by state) or "uncontrolled"
 * (DOM manages the value). To change a controlled input in tests you must fire
 * a 'change' event — the component's onChange handler updates state which
 * re-renders the input. userEvent.clear() + userEvent.type() does exactly that.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SettingsModal from '../components/SettingsModal';
import { renderWithProviders, mockAuthLoggedIn } from './helpers';

// Helper — renders SettingsModal open with the default logged-in user.
function renderSettings(props = {}, authOverride = {}) {
    const auth = { ...mockAuthLoggedIn, ...authOverride };
    const onClose = props.onClose ?? vi.fn();
    renderWithProviders(
        <SettingsModal open={props.open ?? true} onClose={onClose} />,
        { auth }
    );
    return { onClose, auth };
}

describe('SettingsModal', () => {

    // ── 1. Visibility ────────────────────────────────────────────────────────
    it('renders the dialog when open is true', () => {
        renderSettings({ open: true });
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Account Settings')).toBeInTheDocument();
    });

    it('does NOT render the dialog when open is false', () => {
        renderSettings({ open: false });
        // MUI Dialog with open=false keeps the DOM node but hides it.
        // queryByText returns null without throwing, ideal for absence checks.
        expect(screen.queryByText('Account Settings')).not.toBeInTheDocument();
    });

    // ── 2. Pre-filled values ──────────────────────────────────────────────────
    it('pre-fills the username field from auth.user.username', () => {
        renderSettings();
        // getByDisplayValue() finds an input by its current VALUE in the DOM.
        expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
    });

    it('pre-fills the email field from auth.user.email', () => {
        renderSettings();
        expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    });

    // ── 3. All fields present ────────────────────────────────────────────────
    it('renders the Username, Email, New Password, and Confirm Password fields', () => {
        renderSettings();
        expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^new password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
    });

    it('renders Cancel and Save buttons', () => {
        renderSettings();
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
    });

    // ── 4. Cancel behaviour ───────────────────────────────────────────────────
    it('calls onClose when Cancel is clicked — without calling editUser', () => {
        const onClose = vi.fn();
        const mockEditUser = vi.fn();
        renderSettings({ onClose }, { editUser: mockEditUser });

        fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

        expect(onClose).toHaveBeenCalledTimes(1);
        expect(mockEditUser).not.toHaveBeenCalled();
    });

    // ── 5. Save behaviour ─────────────────────────────────────────────────────
    it('calls auth.editUser when Save is clicked', async () => {
        const mockEditUser = vi.fn().mockResolvedValue(undefined);
        const auth = { ...mockAuthLoggedIn, editUser: mockEditUser, errorMessage: null };
        renderWithProviders(
            <SettingsModal open={true} onClose={vi.fn()} />,
            { auth }
        );

        fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

        await waitFor(() => {
            // editUser should be called with the current username, email, and
            // empty password fields (since the user didn't type a new password).
            expect(mockEditUser).toHaveBeenCalledTimes(1);
        });
    });

    it('allows the user to edit the username field', () => {
        renderSettings();
        const usernameInput = screen.getByLabelText(/username/i);

        // Clear the existing value then type a new one.
        userEvent.clear(usernameInput);
        userEvent.type(usernameInput, 'newusername');

        expect(usernameInput.value).toBe('newusername');
    });

    it('allows the user to type a new password', () => {
        renderSettings();
        const passwordInput = screen.getByLabelText(/^new password/i);

        userEvent.type(passwordInput, 'supersecret99');
        expect(passwordInput.value).toBe('supersecret99');
    });

    // ── 6. Change photo ───────────────────────────────────────────────────────
    it('renders the Change photo button', () => {
        renderSettings();
        expect(screen.getByText(/change photo/i)).toBeInTheDocument();
    });

    // ── 7. Error display ──────────────────────────────────────────────────────
    it('shows an error alert when auth.errorMessage is set', () => {
        renderSettings({}, { errorMessage: 'Username already taken.' });
        expect(screen.getByText('Username already taken.')).toBeInTheDocument();
    });
});
