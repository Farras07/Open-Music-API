const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistsSongsService {
  constructor() {
    this._pool = new Pool();
  }

  async verifySongAvailabilityInSongsTable(songId) {
    const query = {
      text: 'SELECT id FROM songs WHERE id = $1',
      values: [songId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('ID Lagu tidak ditemukan');
    }
  }

  async addSongToPlaylistById(playlistId, { songId }) {
    const id = `playlist-${nanoid(16)}`;
    await this.verifySongAvailabilityInSongsTable(songId);
    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('Gagal menambahkan lagu ke playlist');
    }
  }

  async getSongsPlaylist(playlistId) {
    const songsQuery = {
      text: `SELECT playlist_songs.song_id as id,songs.title,songs.performer
            FROM playlist_songs
            LEFT JOIN songs ON songs.id = playlist_songs.song_id
            WHERE playlist_songs.playlist_id = $1 `,
      values: [playlistId],
    };
    const songsResult = await this._pool.query(songsQuery);
    if (!songsResult.rows.length) {
      throw new NotFoundError('Lagu Playlist tidak ditemukan');
    }
    return songsResult.rows;
  }

  async deleteSongFromPlaylist(playlistId, { songId }) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id= $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = PlaylistsSongsService;
