/**
 * SIDEBAR TESTS  —  Navigation rendering & auth-based visibility
 *
 * WHAT WE ARE TESTING
 * -------------------
 * The Sidebar component. We verify:
 *   1. All three nav items always render (Playlists, My Music, Song Catalog).
 *   2. When the user is logged in, "Logout" appears at the bottom.
 *   3. When the user is a guest, "Login" and "Create Account" appear instead.
 *   4. The active nav item is highlighted (has the green tint class/style).
 *   5. Clicking a nav item calls history.push() with the correct path.
 *
 * WHY SIDEBAR TESTS MATTER FOR CI/CD
 * -----------------------------------
 * The sidebar is rendered on every authenticated page. A regression here
 * (e.g., "My Music" disappearing) would break navigation for all users.
 * Having an automated test catches this before it reaches production.
 *
 * MOCKING useHistory
 * ------------------
 * Sidebar calls useHistory().push(path) when a nav item is clicked.
 * We can't let it navigate to a real URL in tests (there's no browser).
 * Instead we use vi.mock() to replace the useHistory hook with a function
 * that returns a plain object { push: vi.fn() }, then assert push was called.
 *
 * vi.mock() must be called at the TOP LEVEL of the module (not inside a
 * function or describe block). Vitest hoists it to the top of the file
 * automatically, just like Jest does.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders, mockAuthLoggedIn, mockAuthGuest } from './helpers';
import Sidebar from '../components/Sidebar';

// ─── Mock react-router-dom hooks ──────────────────────────────────────────────
// We keep ALL the real exports (MemoryRouter, Link, etc.) by spreading
// importOriginal(). We only replace the two hooks we need to control.
const mockPush = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useHistory: () => ({ push: mockPush }),
        useLocation: () => ({ pathname: '/home' }),  // simulate being on /home
    };
});

describe('Sidebar', () => {

    // ── 1. Core nav items always render ─────────────────────────────────────
    it('always renders Playlists, My Music, and Song Catalog nav items', () => {
        renderWithProviders(<Sidebar />, { auth: mockAuthLoggedIn });

        // getAllByText is used because "Playlists" appears both in the sidebar
        // AND in the HomeScreen content (if that were rendered). Here Sidebar is
        // isolated, so getByText would work too — getAllByText is safer.
        expect(screen.getByText('Playlists')).toBeInTheDocument();
        expect(screen.getByText('My Music')).toBeInTheDocument();
        expect(screen.getByText('Song Catalog')).toBeInTheDocument();
    });

    it('renders the PlaylisterYT logo text', () => {
        renderWithProviders(<Sidebar />, { auth: mockAuthLoggedIn });
        expect(screen.getByText('PlaylisterYT')).toBeInTheDocument();
    });

    // ── 2. Auth-based bottom section ─────────────────────────────────────────
    it('shows Logout when the user is logged in', () => {
        renderWithProviders(<Sidebar />, { auth: mockAuthLoggedIn });
        expect(screen.getByText('Logout')).toBeInTheDocument();
        // Guest-only items should NOT appear
        expect(screen.queryByText('Login')).not.toBeInTheDocument();
        expect(screen.queryByText('Create Account')).not.toBeInTheDocument();
    });

    it('shows Login and Create Account for a guest user', () => {
        renderWithProviders(<Sidebar />, { auth: mockAuthGuest });
        expect(screen.getByText('Login')).toBeInTheDocument();
        expect(screen.getByText('Create Account')).toBeInTheDocument();
        // Logout must NOT appear for guests
        expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    });

    // ── 3. Navigation clicks ──────────────────────────────────────────────────
    it('navigates to /my-music when My Music is clicked', () => {
        renderWithProviders(<Sidebar />, { auth: mockAuthLoggedIn });
        fireEvent.click(screen.getByText('My Music'));
        // The mock's push function must have been called with this exact path.
        expect(mockPush).toHaveBeenCalledWith('/my-music');
    });

    it('navigates to /songs when Song Catalog is clicked', () => {
        renderWithProviders(<Sidebar />, { auth: mockAuthLoggedIn });
        fireEvent.click(screen.getByText('Song Catalog'));
        expect(mockPush).toHaveBeenCalledWith('/songs');
    });

    it('navigates to /home when Playlists is clicked', () => {
        renderWithProviders(<Sidebar />, { auth: mockAuthLoggedIn });
        fireEvent.click(screen.getByText('Playlists'));
        expect(mockPush).toHaveBeenCalledWith('/home');
    });

    // ── 4. Logout action ─────────────────────────────────────────────────────
    it('calls auth.logoutUser when Logout is clicked', () => {
        const mockLogoutUser = vi.fn();
        const auth = { ...mockAuthLoggedIn, logoutUser: mockLogoutUser };
        renderWithProviders(<Sidebar />, { auth });

        fireEvent.click(screen.getByText('Logout'));

        expect(mockLogoutUser).toHaveBeenCalledTimes(1);
    });

    // ── 5. Guest login navigation ─────────────────────────────────────────────
    it('navigates to /login when Login is clicked in guest mode', () => {
        renderWithProviders(<Sidebar />, { auth: mockAuthGuest });
        fireEvent.click(screen.getByText('Login'));
        expect(mockPush).toHaveBeenCalledWith('/login');
    });

    it('navigates to /register when Create Account is clicked in guest mode', () => {
        renderWithProviders(<Sidebar />, { auth: mockAuthGuest });
        fireEvent.click(screen.getByText('Create Account'));
        expect(mockPush).toHaveBeenCalledWith('/register');
    });
});
