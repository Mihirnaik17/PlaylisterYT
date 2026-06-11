/**
 * PLAYLIST TESTS  —  HomeScreen playlist listing & creation
 *
 * WHAT WE ARE TESTING
 * -------------------
 * The HomeScreen component. We verify:
 *   1. The "New playlist" button appears for logged-in users.
 *   2. The "New playlist" button is ABSENT for guests.
 *   3. Clicking "New playlist" calls store.createNewList().
 *   4. Search fields render correctly.
 *   5. Clicking Search calls store.loadPublishedPage or store.searchPlaylists.
 *   6. When playlists exist they are rendered in the list.
 *
 * WHY TEST CONDITIONALLY RENDERED UI?
 * ------------------------------------
 * The "New playlist" button is a good example of "conditional rendering" —
 * the same component shows different UI based on state. These are easy to
 * miss during manual testing (you might always test as a logged-in user).
 * Automated tests cover both branches every single time.
 *
 * HOW WE MOCK THE STORE
 * ----------------------
 * HomeScreen calls store.loadPublishedPage() in a useEffect on mount.
 * If we didn't mock this, the component would try to hit the real API and
 * the test would either hang or throw a network error. Our mock returns a
 * resolved Promise immediately so the component's loading state clears fast.
 *
 * ASYNC TESTS & waitFor
 * ----------------------
 * Components often update their UI after async operations (API calls, state
 * updates in useEffect). waitFor() re-runs its callback until the assertion
 * passes or times out. Without it the assertion would fire before the state
 * update and fail intermittently ("flaky" tests).
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import HomeScreen from '../components/HomeScreen';
import { renderWithProviders, mockAuthLoggedIn, mockAuthGuest, createMockStore } from './helpers';

// HomeScreen uses useHistory internally (via NavigationBar is removed, but
// AIRecommendationsDialog still uses it). We mock it to prevent "no router"
// errors even though we already wrap with MemoryRouter.
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useHistory: () => ({ push: vi.fn() }),
        useLocation: () => ({ pathname: '/home', state: null }),
    };
});

describe('HomeScreen — playlist list', () => {

    // ── 1. New playlist button visibility ────────────────────────────────────
    it('shows the "New playlist" button for a logged-in user', async () => {
        const store = createMockStore();
        renderWithProviders(<HomeScreen />, { auth: mockAuthLoggedIn, store });

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /new playlist/i })).toBeInTheDocument();
        });
    });

    it('hides the "New playlist" button for a guest user', async () => {
        const store = createMockStore();
        renderWithProviders(<HomeScreen />, { auth: mockAuthGuest, store });

        // Wait for loading to settle, THEN assert absence.
        await waitFor(() => {
            expect(store.loadPublishedPage).toHaveBeenCalled();
        });

        expect(screen.queryByRole('button', { name: /new playlist/i })).not.toBeInTheDocument();
    });

    // ── 2. Calling createNewList ─────────────────────────────────────────────
    it('calls store.createNewList when "New playlist" is clicked', async () => {
        const store = createMockStore();
        renderWithProviders(<HomeScreen />, { auth: mockAuthLoggedIn, store });

        const newBtn = await screen.findByRole('button', { name: /new playlist/i });
        fireEvent.click(newBtn);

        expect(store.createNewList).toHaveBeenCalledTimes(1);
    });

    // ── 3. Search fields ────────────────────────────────────────────────────
    it('renders the five search fields', async () => {
        const store = createMockStore();
        renderWithProviders(<HomeScreen />, { auth: mockAuthLoggedIn, store });

        // findBy* is the async version of getBy* — it waits for the element
        // to appear (useful when the render is delayed by async effects).
        await screen.findByPlaceholderText(/by playlist name/i);
        expect(screen.getByPlaceholderText(/by user name/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/by song title/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/by song artist/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/by song year/i)).toBeInTheDocument();
    });

    it('renders the Search and Clear buttons', async () => {
        const store = createMockStore();
        renderWithProviders(<HomeScreen />, { auth: mockAuthLoggedIn, store });

        await screen.findByRole('button', { name: /^search$/i });
        expect(screen.getByRole('button', { name: /^clear$/i })).toBeInTheDocument();
    });

    // ── 4. loadPublishedPage is called on mount ───────────────────────────────
    it('calls store.loadPublishedPage(1) when the component mounts', async () => {
        const store = createMockStore();
        renderWithProviders(<HomeScreen />, { auth: mockAuthLoggedIn, store });

        await waitFor(() => {
            // Page 1 is the default — we assert that it is called with 1,
            // not just that it was called (which could be any page number).
            expect(store.loadPublishedPage).toHaveBeenCalledWith(1);
        });
    });

    // ── 5. Search triggers store call ─────────────────────────────────────────
    it('calls store.loadPublishedPage when Search is clicked with empty fields', async () => {
        const store = createMockStore();
        renderWithProviders(<HomeScreen />, { auth: mockAuthLoggedIn, store });

        const searchBtn = await screen.findByRole('button', { name: /^search$/i });
        fireEvent.click(searchBtn);

        await waitFor(() => {
            // No search params → falls through to loadPublishedPage(1).
            expect(store.loadPublishedPage).toHaveBeenCalledWith(1);
        });
    });

    it('calls store.searchPlaylists when a search term is provided', async () => {
        const store = createMockStore();
        renderWithProviders(<HomeScreen />, { auth: mockAuthLoggedIn, store });

        const nameField = await screen.findByPlaceholderText(/by playlist name/i);
        userEvent.type(nameField, 'Chill Vibes');

        fireEvent.click(screen.getByRole('button', { name: /^search$/i }));

        await waitFor(() => {
            expect(store.searchPlaylists).toHaveBeenCalledWith(
                expect.objectContaining({ name: 'Chill Vibes' })
            );
        });
    });

    // ── 6. Playlist cards render when data is loaded ─────────────────────────
    it('renders a playlist card for each item in store.idNamePairs', async () => {
        const store = createMockStore({
            idNamePairs: [
                { _id: '1', name: 'Morning Beats', ownerEmail: 'a@b.com', ownerUsername: 'alice', listens: 10, published: true },
                { _id: '2', name: 'Late Night Jazz', ownerEmail: 'c@d.com', ownerUsername: 'bob', listens: 5, published: true },
            ],
        });

        renderWithProviders(<HomeScreen />, { auth: mockAuthLoggedIn, store });

        // findByText waits until the text appears in the DOM.
        await screen.findByText('Morning Beats');
        expect(screen.getByText('Late Night Jazz')).toBeInTheDocument();
    });

    // ── 7. Empty state ───────────────────────────────────────────────────────
    it('shows "No playlists found" when the list is empty and not loading', async () => {
        const store = createMockStore({ idNamePairs: [] });
        renderWithProviders(<HomeScreen />, { auth: mockAuthLoggedIn, store });

        await screen.findByText(/no playlists found/i);
    });
});
