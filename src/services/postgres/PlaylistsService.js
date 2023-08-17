const { Pool } = require('pg');
const { nanoid } = require('nanoid');

const { mapDBToModelPlaylist } = require('../../utils/playlist');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(collaborationService) {
    this._pool = new Pool();
    this._collaborationService = collaborationService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username
        FROM playlists
        LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
        LEFT JOIN users ON users.id = playlists.owner
        WHERE playlists.owner = $1 OR collaborations.user_Id = $1
        GROUP BY playlists.id, playlists.name ,users.username`,
      values: [owner],
    };
    const result = await this._pool.query(query);
    return result.rows.map(mapDBToModelPlaylist);
  }

  async getPlaylistById(playlistId, owner) {
    const playlistQuery = {
      text: `SELECT playlists.id, playlists.name, users.username
        FROM playlists
        LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
        LEFT JOIN users ON users.id = playlists.owner
        WHERE (playlists.owner = $1 AND playlists.id = $2) OR (collaborations.user_id = $1 AND collaborations.playlist_id = $2)
        GROUP BY playlists.id, playlists.name, users.username, users.id`,
      values: [owner, playlistId],
    };
    const playlistResult = await this._pool.query(playlistQuery);
    return playlistResult.rows.map(mapDBToModelPlaylist)[0];
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async addPlaylistActivities(playlistId, userId, action, { songId }) {
    const id = `activities-${nanoid(16)}`;
    const actionTime = new Date().toISOString();
    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, actionTime],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('Activity Playlist gagal ditambahkan');
    }
  }

  async getPlaylistIdInPlaylistActivitiesTableById(id) {
    const idQuery = {
      text: 'SELECT playlist_id FROM playlist_song_activities WHERE playlist_id = $1',
      values: [id],
    };
    const idResult = await this._pool.query(idQuery);

    if (!idResult.rows.length) {
      throw new NotFoundError('Id playlist tidak ditemukan');
    }

    return idResult.rows[0].playlist_id;
  }

  async getPlaylistActivitiesById(id) {
    const activityQuery = {
      text: `SELECT users.username, songs.title, playlist_song_activities.action, playlist_song_activities.time
      FROM playlist_song_activities
      INNER JOIN playlists ON playlists.id = playlist_song_activities.playlist_id
      INNER JOIN users ON users.id = playlists.owner
      INNER JOIN songs ON songs.id = playlist_song_activities.song_id 
      WHERE playlist_song_activities.playlist_id = $1
      ORDER BY playlist_song_activities.time ASC`,
      values: [id],
    };

    const activityResult = await this._pool.query(activityQuery);
    if (!activityResult.rows.length) {
      throw new InvariantError('Activity Playlist gagal didapatkan');
    }
    return activityResult.rows;
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistsService;
