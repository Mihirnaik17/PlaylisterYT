import React from 'react';
import { render, act } from '@testing-library/react';
import { usePlaylistPlayer } from './usePlaylistPlayer';

function HookProbe({ playlist, onValue }) {
  const value = usePlaylistPlayer(playlist);
  onValue(value);
  return null;
}

describe('usePlaylistPlayer', () => {
  it('clamps currentSongIndex when playlist shrinks', () => {
    const playlistA = { songs: [{ youTubeId: 'a' }, { youTubeId: 'b' }, { youTubeId: 'c' }] };
    const playlistB = { songs: [{ youTubeId: 'a' }] };

    let v;
    const { rerender } = render(<HookProbe playlist={playlistA} onValue={(x) => (v = x)} />);

    act(() => v.selectSong(2));
    expect(v.currentSongIndex).toBe(2);

    rerender(<HookProbe playlist={playlistB} onValue={(x) => (v = x)} />);
    expect(v.currentSongIndex).toBe(0);
  });

  it('stops at last song when repeat is off', () => {
    const playlist = { songs: [{ youTubeId: 'a' }, { youTubeId: 'b' }] };
    let v;
    render(<HookProbe playlist={playlist} onValue={(x) => (v = x)} />);

    act(() => v.selectSong(1));
    expect(v.currentSongIndex).toBe(1);
    expect(v.isPlaying).toBe(true);

    act(() => v.handleVideoEnd());
    expect(v.currentSongIndex).toBe(1);
    expect(v.isPlaying).toBe(false);
  });

  it('wraps to start when repeat is on', () => {
    const playlist = { songs: [{ youTubeId: 'a' }, { youTubeId: 'b' }] };
    let v;
    render(<HookProbe playlist={playlist} onValue={(x) => (v = x)} />);

    act(() => v.setRepeat(true));
    act(() => v.selectSong(1));
    act(() => v.handleVideoEnd());

    expect(v.currentSongIndex).toBe(0);
    expect(v.isPlaying).toBe(true);
  });
});

