/**
 * AI RECOMMENDATIONS TESTS  —  Dialog behaviour & API interaction
 *
 * WHAT WE ARE TESTING
 * -------------------
 * The AIRecommendationsDialog component. We verify:
 *   1. The dialog renders when open=true and is hidden when open=false.
 *   2. The mood text field accepts user input.
 *   3. Clicking a mood chip sets the mood field value.
 *   4. Submitting without a mood shows a validation error.
 *   5. Submitting with a mood calls the recommendSongs API.
 *   6. Successful API response renders song recommendations.
 *   7. Failed API response shows an error alert.
 *   8. The "Close" button calls onClose.
 *
 * HOW WE MOCK THE API MODULE
 * --------------------------
 * AIRecommendationsDialog imports { recommendSongs } from '../store/requests'.
 * In tests we don't want to hit a real AI endpoint (it's slow, costs money,
 * and is non-deterministic). We use vi.mock() to replace the entire module
 * with a version where recommendSongs is a vi.fn().
 *
 * Inside individual tests we can then control what the mock returns:
 *   recommendSongs.mockResolvedValueOnce({ data: { success: true, ... } })
 *
 * This is called "mocking a module" and is one of the most powerful testing
 * techniques. Interview tip: explain the difference between mocking a module
 * (vi.mock) and mocking a function call (vi.fn / vi.spyOn).
 *
 * waitFor vs findBy
 * -----------------
 * Both wait for an async condition. The difference:
 *   • findByText('x')   — convenience shorthand for waitFor(() => getByText('x'))
 *   • waitFor(callback) — for more complex assertions or when you need to wait
 *     for state that doesn't produce a single DOM element.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AIRecommendationsDialog from '../components/AIRecommendationsDialog';
import { renderWithProviders, mockAuthLoggedIn } from './helpers';

// ─── Mock the store/requests module ──────────────────────────────────────────
// We replace recommendSongs with a controllable stub. Tests that don't care
// about the return value get the default resolved value (successful empty list).
vi.mock('../store/requests', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        recommendSongs: vi.fn().mockResolvedValue({
            data: { success: true, recommendations: [] },
        }),
    };
});

// Import AFTER vi.mock() so we get the mocked version.
import { recommendSongs } from '../store/requests';

// Mock router hooks (dialog uses useHistory for "Find in catalog" navigation).
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useHistory: () => ({ push: vi.fn() }),
    };
});

// ─── Helper ──────────────────────────────────────────────────────────────────
function renderDialog(props = {}) {
    const onClose = props.onClose ?? vi.fn();
    renderWithProviders(
        <AIRecommendationsDialog
            open={props.open ?? true}
            onClose={onClose}
            playlistContext={props.playlistContext ?? []}
        />,
        { auth: mockAuthLoggedIn }
    );
    return { onClose };
}

describe('AIRecommendationsDialog', () => {

    // ── 1. Open / closed state ────────────────────────────────────────────────
    it('renders the dialog when open is true', () => {
        renderDialog({ open: true });
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText(/ai song picks/i)).toBeInTheDocument();
    });

    it('does NOT render the dialog content when open is false', () => {
        renderDialog({ open: false });
        expect(screen.queryByText(/ai song picks/i)).not.toBeInTheDocument();
    });

    // ── 2. Form fields ────────────────────────────────────────────────────────
    it('renders the mood text field', () => {
        renderDialog();
        expect(screen.getByLabelText(/mood or vibe/i)).toBeInTheDocument();
    });

    it('renders the genre (optional) field', () => {
        renderDialog();
        expect(screen.getByLabelText(/genre/i)).toBeInTheDocument();
    });

    it('renders the "Get recommendations" button', () => {
        renderDialog();
        expect(screen.getByRole('button', { name: /get recommendations/i })).toBeInTheDocument();
    });

    it('renders the Close button', () => {
        renderDialog();
        expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    });

    // ── 3. Mood chips ─────────────────────────────────────────────────────────
    it('renders mood preset chips', () => {
        renderDialog();
        // The component defines: ['Chill', 'Focus', 'Party', 'Workout', 'Melancholy', 'Happy']
        expect(screen.getByText('Chill')).toBeInTheDocument();
        expect(screen.getByText('Party')).toBeInTheDocument();
        expect(screen.getByText('Workout')).toBeInTheDocument();
    });

    it('sets the mood field when a chip is clicked', () => {
        renderDialog();
        fireEvent.click(screen.getByText('Chill'));
        // After clicking the chip, the text field should be updated to "Chill"
        expect(screen.getByLabelText(/mood or vibe/i).value).toBe('Chill');
    });

    // ── 4. Validation ─────────────────────────────────────────────────────────
    it('shows an error when Get Recommendations is clicked without a mood', async () => {
        renderDialog();
        fireEvent.click(screen.getByRole('button', { name: /get recommendations/i }));

        // The error message is set synchronously inside runRecommend().
        await screen.findByText(/describe your mood/i);
        // recommendSongs must NOT have been called — we never hit the API.
        expect(recommendSongs).not.toHaveBeenCalled();
    });

    // ── 5. Successful API call ────────────────────────────────────────────────
    it('calls recommendSongs with the mood when form is submitted', async () => {
        renderDialog();
        userEvent.type(screen.getByLabelText(/mood or vibe/i), 'rainy day');
        fireEvent.click(screen.getByRole('button', { name: /get recommendations/i }));

        await waitFor(() => {
            expect(recommendSongs).toHaveBeenCalledWith(
                expect.objectContaining({ mood: 'rainy day' })
            );
        });
    });

    it('renders song cards when the API returns recommendations', async () => {
        recommendSongs.mockResolvedValueOnce({
            data: {
                success: true,
                recommendations: [
                    { title: 'Bohemian Rhapsody', artist: 'Queen', year: 1975, reason: 'Epic.' },
                    { title: 'Hotel California', artist: 'Eagles', year: 1977, reason: 'Classic.' },
                ],
            },
        });

        renderDialog();
        userEvent.type(screen.getByLabelText(/mood or vibe/i), 'classic rock');
        fireEvent.click(screen.getByRole('button', { name: /get recommendations/i }));

        await screen.findByText('Bohemian Rhapsody');
        expect(screen.getByText('Hotel California')).toBeInTheDocument();
        // Artist + year are concatenated inside one element: "Queen · 1975"
        // Use a regex so we match regardless of the year separator.
        expect(screen.getByText(/Queen/)).toBeInTheDocument();
    });

    // ── 6. API failure ────────────────────────────────────────────────────────
    it('shows an error alert when the API call fails', async () => {
        recommendSongs.mockRejectedValueOnce(new Error('Network error'));

        renderDialog();
        userEvent.type(screen.getByLabelText(/mood or vibe/i), 'sad');
        fireEvent.click(screen.getByRole('button', { name: /get recommendations/i }));

        await screen.findByText(/network error/i);
    });

    it('shows error from API error response body', async () => {
        recommendSongs.mockRejectedValueOnce({
            response: { data: { errorMessage: 'AI service unavailable.' } },
        });

        renderDialog();
        userEvent.type(screen.getByLabelText(/mood or vibe/i), 'happy');
        fireEvent.click(screen.getByRole('button', { name: /get recommendations/i }));

        await screen.findByText('AI service unavailable.');
    });

    // ── 7. Close button ───────────────────────────────────────────────────────
    it('calls onClose when the Close button is clicked', () => {
        const { onClose } = renderDialog();
        fireEvent.click(screen.getByRole('button', { name: /close/i }));
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
