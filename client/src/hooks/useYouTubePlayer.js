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
  // The container is the React-rendered div (elementId). YT must NEVER be
  // given that node directly: new YT.Player(el) REPLACES el with an iframe,
  // which breaks React's DOM bookkeeping and crashes the next commit with
  // "Failed to execute 'insertBefore'/'removeChild' on 'Node'". Instead we
  // create a throwaway child div imperatively and hand THAT to YT.
  const containerRef = useRef(null);

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
      try { playerRef.current.destroy(); } catch (e) { /* already gone */ }
    }
    playerRef.current = null;
    playerReadyRef.current = false;
    // Remove whatever YT left behind (iframe or restored mount div) so the
    // container is empty for the next player instance.
    const container = containerRef.current;
    if (container) {
      while (container.firstChild) container.removeChild(container.firstChild);
    }
    containerRef.current = null;
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

      const container = document.getElementById(elementId);
      if (!container) return;
      containerRef.current = container;

      // Imperative child div — YT replaces this node, not React's container.
      const mount = document.createElement('div');
      mount.style.width = '100%';
      mount.style.height = '100%';
      container.appendChild(mount);

      playerRef.current = new window.YT.Player(mount, {
        height: '100%',
        width: '100%',
        videoId,
        playerVars: playerVars || {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          enablejsapi: 1,
          origin: window.location.origin,
        },
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

