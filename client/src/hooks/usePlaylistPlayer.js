import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export function usePlaylistPlayer(playlist) {
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [repeat, setRepeat] = useState(false);

  const repeatRef = useRef(repeat);
  const playlistRef = useRef(null);

  const songsLength = playlist?.songs?.length ?? 0;

  useEffect(() => {
    repeatRef.current = repeat;
  }, [repeat]);

  useEffect(() => {
    playlistRef.current = playlist || null;
    const len = playlist?.songs?.length ?? 0;
    setCurrentSongIndex((prev) => (len === 0 ? 0 : Math.min(prev, len - 1)));
    if (len === 0) setIsPlaying(false);
  }, [playlist]);

  const currentSong = useMemo(() => playlist?.songs?.[currentSongIndex] || null, [playlist, currentSongIndex]);

  const handleVideoEnd = useCallback(() => {
    const pl = playlistRef.current;
    const len = pl?.songs?.length ?? 0;
    if (len === 0) return;

    setCurrentSongIndex((prev) => {
      const isLast = prev >= len - 1;
      const nextIndex = isLast ? (repeatRef.current ? 0 : prev) : prev + 1;
      const nextPlaying = !(isLast && !repeatRef.current);
      setIsPlaying(nextPlaying);
      return nextIndex;
    });
  }, []);

  const playPause = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  const previous = useCallback(() => {
    const len = songsLength;
    if (len > 0) {
      setCurrentSongIndex((prev) => (prev === 0 ? len - 1 : prev - 1));
      setIsPlaying(true);
    }
  }, [songsLength]);

  const next = useCallback(() => {
    const len = songsLength;
    if (len > 0) {
      setCurrentSongIndex((prev) => (prev >= len - 1 ? 0 : prev + 1));
      setIsPlaying(true);
    }
  }, [songsLength]);

  const selectSong = useCallback((index) => {
    setCurrentSongIndex(index);
    setIsPlaying(true);
  }, []);

  const reset = useCallback(() => {
    setCurrentSongIndex(0);
    setIsPlaying(false);
    setRepeat(false);
  }, []);

  return {
    currentSongIndex,
    setCurrentSongIndex,
    currentSong,
    isPlaying,
    setIsPlaying,
    repeat,
    setRepeat,
    handleVideoEnd,
    playPause,
    previous,
    next,
    selectSong,
    reset,
  };
}

