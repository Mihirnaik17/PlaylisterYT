import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export const PlaylistQueue = React.memo(function PlaylistQueue({
  songs,
  currentSongIndex,
  isPlaying,
  onSelectSong,
}) {
  return (
    <Box
      sx={{
        width: { xs: '38%', md: '32%' },
        borderRight: '1px solid rgba(255,255,255,0.06)',
        overflowY: 'auto',
        flexShrink: 0,
        bgcolor: '#181818',
        py: 1,
      }}
      aria-label="Song queue"
    >
      <Typography
        sx={{
          px: 2,
          py: 1,
          fontSize: '0.72rem',
          fontWeight: 700,
          color: '#B3B3B3',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        Queue
      </Typography>

      {songs.map((song, index) => (
        <Box
          key={`${song.youTubeId}-${index}`}
          onClick={() => onSelectSong(index)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 2,
            py: 1,
            cursor: 'pointer',
            bgcolor: index === currentSongIndex ? 'rgba(29,185,84,0.1)' : 'transparent',
            borderLeft: index === currentSongIndex ? '3px solid #1DB954' : '3px solid transparent',
            transition: 'all 0.12s',
            '&:hover': {
              bgcolor: index === currentSongIndex ? 'rgba(29,185,84,0.15)' : 'rgba(255,255,255,0.05)',
            },
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onSelectSong(index);
          }}
          aria-current={index === currentSongIndex ? 'true' : 'false'}
        >
          {index === currentSongIndex && isPlaying ? (
            <Box sx={{ width: 18, flexShrink: 0, display: 'flex', alignItems: 'flex-end', gap: '2px', height: 18 }}>
              {[1, 0.6, 0.85].map((h, i) => (
                <Box
                  key={i}
                  sx={{
                    width: 3,
                    bgcolor: '#1DB954',
                    borderRadius: 0.5,
                    animation: `eqBar${i} 0.8s ease-in-out ${i * 0.12}s infinite alternate`,
                    [`@keyframes eqBar${i}`]: {
                      from: { height: `${h * 6}px` },
                      to: { height: `${h * 18}px` },
                    },
                  }}
                />
              ))}
            </Box>
          ) : (
            <Typography
              sx={{
                width: 18,
                textAlign: 'center',
                fontSize: '0.78rem',
                color: index === currentSongIndex ? '#1DB954' : '#B3B3B3',
                flexShrink: 0,
              }}
            >
              {index + 1}
            </Typography>
          )}

          <Box sx={{ minWidth: 0 }}>
            <Typography
              noWrap
              sx={{
                fontSize: '0.85rem',
                fontWeight: index === currentSongIndex ? 700 : 400,
                color: index === currentSongIndex ? '#1DB954' : '#fff',
                lineHeight: 1.3,
              }}
            >
              {song.title}
            </Typography>
            <Typography noWrap sx={{ fontSize: '0.76rem', color: '#B3B3B3', lineHeight: 1.3 }}>
              {song.artist}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
});

