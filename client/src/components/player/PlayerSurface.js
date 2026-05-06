import React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import RepeatIcon from '@mui/icons-material/Repeat';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

export const PlayerSurface = React.memo(function PlayerSurface({
  currentSong,
  isPlaying,
  repeat,
  onToggleRepeat,
  onPrevious,
  onPlayPause,
  onNext,
  onOpenSongMenu,
  playButtonRef,
}) {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, md: 4 },
        bgcolor: '#121212',
        gap: 3,
      }}
      aria-label="Player"
    >
      {currentSong && (
        <Box sx={{ textAlign: 'center', width: '100%' }}>
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#1DB954', letterSpacing: '0.1em', textTransform: 'uppercase', mb: 0.5 }}>
            Now Playing
          </Typography>
          <Typography noWrap sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
            {currentSong.title}
          </Typography>
          <Typography noWrap sx={{ fontSize: '0.85rem', color: '#B3B3B3' }}>
            {currentSong.artist} · {currentSong.year}
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          width: '100%',
          maxWidth: 560,
          aspectRatio: '16/9',
          bgcolor: '#000',
          borderRadius: 1,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
        }}
      >
        {currentSong ? (
          <div id="youtube-player" style={{ width: '100%', height: '100%' }} />
        ) : (
          <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MusicNoteIcon sx={{ fontSize: 56, color: '#535353' }} />
          </Box>
        )}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title={repeat ? 'Repeat: On' : 'Repeat: Off'}>
          <IconButton
            aria-label={repeat ? 'Turn repeat off' : 'Turn repeat on'}
            onClick={onToggleRepeat}
            sx={{
              color: repeat ? '#1DB954' : '#B3B3B3',
              '&:hover': { color: repeat ? '#1ed760' : '#fff' },
            }}
          >
            <RepeatIcon />
          </IconButton>
        </Tooltip>

        <IconButton
          aria-label="Previous song"
          onClick={onPrevious}
          sx={{
            color: '#B3B3B3',
            '&:hover': { color: '#fff' },
            width: 44,
            height: 44,
          }}
        >
          <SkipPreviousIcon sx={{ fontSize: 28 }} />
        </IconButton>

        <IconButton
          aria-label={isPlaying ? 'Pause' : 'Play'}
          onClick={onPlayPause}
          ref={playButtonRef}
          sx={{
            bgcolor: '#1DB954',
            color: '#000',
            width: 52,
            height: 52,
            '&:hover': { bgcolor: '#1ed760', transform: 'scale(1.06)' },
            transition: 'all 0.15s',
          }}
        >
          {isPlaying ? <PauseIcon sx={{ fontSize: 28 }} /> : <PlayArrowIcon sx={{ fontSize: 28 }} />}
        </IconButton>

        <IconButton
          aria-label="Next song"
          onClick={onNext}
          sx={{
            color: '#B3B3B3',
            '&:hover': { color: '#fff' },
            width: 44,
            height: 44,
          }}
        >
          <SkipNextIcon sx={{ fontSize: 28 }} />
        </IconButton>

        <IconButton
          aria-label="Song actions"
          onClick={onOpenSongMenu}
          sx={{
            color: '#B3B3B3',
            '&:hover': { color: '#fff' },
            width: 44,
            height: 44,
          }}
        >
          <MoreVertIcon />
        </IconButton>
      </Box>
    </Box>
  );
});

