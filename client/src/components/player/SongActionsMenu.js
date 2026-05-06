import React from 'react';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

export const SongActionsMenu = React.memo(function SongActionsMenu({
  songMenuAnchor,
  playlistMenuAnchor,
  onCloseSongMenu,
  onShowPlaylistMenu,
  onHidePlaylistMenu,
  onLikeSong,
  userPlaylists,
  idNamePairsLoading,
  onAddToPlaylist,
}) {
  return (
    <>
      <Menu
        anchorEl={songMenuAnchor}
        open={Boolean(songMenuAnchor)}
        onClose={onCloseSongMenu}
        PaperProps={{
          sx: {
            bgcolor: '#282828',
            border: '1px solid rgba(255,255,255,0.1)',
            '& .MuiMenuItem-root': {
              color: '#FFFFFF',
              fontSize: '0.9rem',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
            },
          },
        }}
      >
        <MenuItem onClick={onShowPlaylistMenu}>Add to Playlist →</MenuItem>
        <MenuItem onClick={onLikeSong}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FavoriteBorderIcon sx={{ fontSize: 18 }} />
            Like Song
          </Box>
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={playlistMenuAnchor}
        open={Boolean(playlistMenuAnchor)}
        onClose={onHidePlaylistMenu}
        PaperProps={{
          sx: {
            bgcolor: '#282828',
            border: '1px solid rgba(255,255,255,0.1)',
            '& .MuiMenuItem-root': {
              color: '#FFFFFF',
              fontSize: '0.9rem',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
            },
          },
        }}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        {userPlaylists.length > 0 ? (
          userPlaylists.map((pair) => (
            <MenuItem key={pair._id} onClick={(e) => onAddToPlaylist(e, pair._id)} sx={{ minWidth: 220 }}>
              {pair.name}
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>{idNamePairsLoading ? 'Loading...' : 'No playlists available'}</MenuItem>
        )}
      </Menu>
    </>
  );
});

