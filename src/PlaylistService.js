// const { methodInfoAccessRequest } = require('amqplib/lib/defs');
const { Pool } = require('pg');

class PlaylistService {
  constructor() {
    this.pool = new Pool();

    // this.getPlaylistById = this.getPlaylistById.bind(this);
    // this.getPlaylistSongs = this.getPlaylistSongs.bind(this);
    // this.getSongsFromPlaylist = this.getSongsFromPlaylist.bind(this);
  }

  async getPlaylistById(playlistId) {
    const result = await this.pool.query({
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists 
              LEFT JOIN users ON users.id = playlists.owner 
              WHERE playlists.id = $1`,
      values: [playlistId],
    });
    if (!result.rows.length) {
      throw new Error('Playlists tidak ditemukan');
    }
    return result.rows[0];
  }

  async getPlaylistSongs(playlistId) {
    const query = {
      text: `SELECT songs.song_id, songs.title, songs.performer FROM songs
              LEFT JOIN playlist_songs ON songs.song_id = playlist_songs.songs_id 
              WHERE playlist_songs.playlist_id = $1`,
      values: [playlistId],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new Error('Playlist kosong');
    }

    return result.rows;
  }

  async getSongsFromPlaylist(playlistId) {
    try {
      const playlistDetails = await this.getPlaylistById(playlistId);
      const playlistSongs = await this.getPlaylistSongs(playlistId);

      return {
        playlist: {
          ...playlistDetails,
          songs: playlistSongs.map((song) => ({
            id: song.song_id,
            title: song.title,
            performer: song.performer,
          })),
        },

      };
    } catch (error) {
      return {
        status: 'fail',
        message: error.message,
      };
    }
  }
}

module.exports = PlaylistService;
