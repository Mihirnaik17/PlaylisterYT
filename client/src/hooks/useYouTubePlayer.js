import { useCallback, useEffect, useRef } from 'react';

export function useYouTubePlayer({
  elementId,
  videoId,
  onEnded,
  onPlayingChange,
  shouldPlay,
  playerVars,
}) {
  const playerRef = useRef(null);
  const playerReadyRef = useRef(false);
  const ytReadyPromiseRef = useRef(null);

  const ensureYouTubeApi = useCallback(() => {
    if (window.YT && window.YT.Player) return Promise.resolve(true);
    if (ytReadyPromiseRef.current) return ytReadyPromiseRef.current;

    ytReadyPromiseRef.current = new Promise((resolve) => {
      const prior = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prior === 'function') prior();
        resolve(true);
      };

      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        if (firstScriptTag?.parentNode) firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        else document.head.appendChild(tag);
      }
    });

    return ytReadyPromiseRef.current;
  }, []);

  const destroy = useCallback(() => {
    if (playerRef.current && playerRef.current.destroy) {
      playerRef.current.destroy();
    }
    playerRef.current = null;
    playerReadyRef.current = false;
  }, []);

  const play = useCallback(() => {
    if (!playerRef.current || !playerReadyRef.current) return;
    playerRef.current.playVideo();
  }, []);

  const pause = useCallback(() => {
    if (!playerRef.current || !playerReadyRef.current) return;
    playerRef.current.pauseVideo();
  }, []);

  useEffect(() => {
    ensureYouTubeApi();
    return () => destroy();
  }, [ensureYouTubeApi, destroy]);

  useEffect(() => {
    if (!videoId) return;

    let cancelled = false;
    ensureYouTubeApi().then(() => {
      if (cancelled) return;
      if (!(window.YT && window.YT.Player)) return;

      playerReadyRef.current = false;
      destroy();

      playerRef.current = new window.YT.Player(elementId, {
        height: '100%',
        width: '100%',
        videoId,
        playerVars: playerVars || { autoplay: 0, controls: 1, modestbranding: 1, rel: 0 },
        events: {
          onReady: (event) => {
            playerReadyRef.current = true;
            if (shouldPlay) event.target.playVideo();
          },
          onStateChange: (event) => {
            // 0 ended, 1 playing, 2 paused
            if (event.data === 0) onEnded?.();
            else if (event.data === 1) onPlayingChange?.(true);
            else if (event.data === 2) onPlayingChange?.(false);
          },
        },
      });
    });

    return () => {
      cancelled = true;
    };
  }, [videoId, elementId, ensureYouTubeApi, destroy, onEnded, onPlayingChange, shouldPlay, playerVars]);

  return {
    ensureYouTubeApi,
    playerRef,
    playerReadyRef,
    destroy,
    play,
    pause,
  };
}

