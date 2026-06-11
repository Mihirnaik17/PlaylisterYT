/**
 * TEST HELPERS  —  renderWithProviders & shared mock objects
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * Every component in this app depends on three "context providers":
 *   • ThemeProvider  (MUI dark theme)
 *   • AuthContext    (who is logged in)
 *   • GlobalStoreContext (playlist / song data)
 *   • MemoryRouter   (navigation / URL state)
 *
 * If you render a component without wrapping it in these providers React
 * throws "cannot read property of undefined" because useContext() returns
 * nothing. Instead of repeating the same four wrappers in every test file
 * we centralise them here.
 *
 * MOCKING STRATEGY
 * ----------------
 * We don't use the REAL auth or store objects. Instead we create plain
 * JavaScript objects (mockAuthLoggedIn, etc.) whose methods are vi.fn()
 * stubs. This means:
 *   • Tests run without a database or live server.
 *   • We can assert "was loginUser called?" via expect(fn).toHaveBeenCalled().
 *   • We can simulate any state (guest, logged in, error) by swapping objects.
 *
 * INTERVIEW TIP: "mocking" is the practice of replacing a real dependency
 * with a controlled fake. It lets you test a unit of code in isolation.
 */

import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { vi } from 'vitest';
import AuthContext from '../auth';
import { GlobalStoreContext } from '../store';

// Minimal dark theme that satisfies MUI's palette lookups in components.
const testTheme = createTheme({ palette: { mode: 'dark' } });

// ─── Mock auth states ─────────────────────────────────────────────────────────

/** Represents a fully authenticated user */
export const mockAuthLoggedIn = {
    user: { username: 'testuser', email: 'test@example.com', avatar: null },
    loggedIn: true,
    isGuest: false,
    errorMessage: null,
    getUserInitials: () => 'TU',
    logoutUser: vi.fn(),
    loginUser: vi.fn(),
    editUser: vi.fn(),
    clearError: vi.fn(),
    continueAsGuest: vi.fn(),
};

/** Represents a guest browsing without an account */
export const mockAuthGuest = {
    user: null,
    loggedIn: false,
    isGuest: true,
    errorMessage: null,
    getUserInitials: () => '',
    logoutUser: vi.fn(),
    loginUser: vi.fn(),
    editUser: vi.fn(),
    clearError: vi.fn(),
    continueAsGuest: vi.fn(),
};

/** Represents the initial state — no one is logged in, not a guest */
export const mockAuthLoggedOut = {
    user: null,
    loggedIn: false,
    isGuest: false,
    errorMessage: null,
    getUserInitials: () => '',
    logoutUser: vi.fn(),
    loginUser: vi.fn(),
    editUser: vi.fn(),
    clearError: vi.fn(),
    continueAsGuest: vi.fn(),
};

// ─── Mock store factory ───────────────────────────────────────────────────────
// A factory function (not a plain object) so each test gets a FRESH copy of
// the store with its own vi.fn() instances. If we used a shared object the
// call-count from one test would carry into the next.
export function createMockStore(overrides = {}) {
    return {
        idNamePairs: [],
        currentList: null,
        listMarkedForDeletion: null,   // MUIDeleteModal opens when this !== null
        songs: [],
        _pagination: null,
        errorMessage: null,
        // Navigation / loading
        createNewList: vi.fn(),
        loadPublishedPage: vi.fn().mockResolvedValue(undefined),
        loadIdNamePairs: vi.fn().mockResolvedValue([]),
        loadSongs: vi.fn().mockResolvedValue([]),
        searchPlaylists: vi.fn(),
        // Modals
        openEditPlaylistModal: vi.fn(),
        showCreateSongModal: vi.fn(),
        isEditSongModalOpen: vi.fn().mockReturnValue(false),
        isEditPlaylistModalOpen: vi.fn().mockReturnValue(false),
        isPlayPlaylistModalOpen: vi.fn().mockReturnValue(false),
        isDeletePlaylistModalOpen: vi.fn().mockReturnValue(false),
        hideModals: vi.fn(),
        markListForDeletion: vi.fn(),
        // Playlist actions
        copyPlaylist: vi.fn().mockResolvedValue({ success: true }),
        setIsListNameEditActive: vi.fn(),
        // Undo/redo (used by EditToolbar and some modals)
        canUndo: vi.fn().mockReturnValue(false),
        canRedo: vi.fn().mockReturnValue(false),
        undo: vi.fn(),
        redo: vi.fn(),
        // Likes / comments
        likePlaylist: vi.fn(),
        dislikePlaylist: vi.fn(),
        addComment: vi.fn(),
        ...overrides,
    };
}

// ─── Main render helper ───────────────────────────────────────────────────────
/**
 * renderWithProviders wraps a React element in all the contexts it needs
 * and delegates to @testing-library/render.
 *
 * Usage:
 *   renderWithProviders(<LoginScreen />)
 *   renderWithProviders(<Sidebar />, { auth: mockAuthGuest, route: '/home' })
 *
 * @param {React.ReactElement} ui       The component to render
 * @param {object}             options
 *   @param {object}  auth    Override the auth context (default: logged-in user)
 *   @param {object}  store   Override the store context (default: empty store)
 *   @param {string}  route   Initial URL path (default: '/home')
 */
export function renderWithProviders(ui, {
    auth = mockAuthLoggedIn,
    store = null,
    route = '/home',
} = {}) {
    const mockStore = store ?? createMockStore();
    return render(
        <ThemeProvider theme={testTheme}>
            <MemoryRouter initialEntries={[route]}>
                <AuthContext.Provider value={{ auth }}>
                    <GlobalStoreContext.Provider value={{ store: mockStore }}>
                        {ui}
                    </GlobalStoreContext.Provider>
                </AuthContext.Provider>
            </MemoryRouter>
        </ThemeProvider>
    );
}
