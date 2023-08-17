const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const { mapDBToModel } = require('../../utils/album');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const albumQuery = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };

    const albumResult = await this._pool.query(albumQuery);

    if (!albumResult.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }
    const albumResultMap = albumResult.rows.map(mapDBToModel)[0];
    return albumResultMap;
  }

  async getSongsByAlbumId(id) {
    const songQuery = {
      text: `SELECT songs.id , songs.title , songs.performer FROM songs 
      INNER JOIN albums ON albums.id = songs."albumId"
      WHERE songs."albumId" = $1`,
      values: [id],
    };

    const songsResult = await this._pool.query(songQuery);
    return songsResult.rows;
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('album gagal dihapus. Id tidak ditemukan');
    }
  }

  async addAlbumCoverUrl(url, id) {
    const query = {
      text: 'UPDATE albums SET "coverUrl" = $1 WHERE id = $2 RETURNING id',
      values: [url, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async verifyLikedOnAlbum(userId, albumId, action) {
    const query = {
      text: 'SELECT id FROM user_album_likes WHERE user_album_likes."userId" = $1 AND user_album_likes."albumId" = $2',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);
    if (action === 'add') {
      if (result.rowCount) throw new InvariantError('Gagal menambahkan like pada album. Anda sudah like album ini');
    } else if (!result.rowCount) throw new NotFoundError('Gagal menghapus like pada album ini, Anda belum like album ini');
  }

  async addLikeToAlbum(userId, albumId) {
    const id = `liked-${nanoid(7)}(${albumId})`;
    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1,$2,$3) RETURNING id',
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Like album gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async getLikedFromAlbum(albumId) {
    const query = {
      text: 'SELECT id FROM user_album_likes WHERE user_album_likes."albumId"= $1',
      values: [albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Like pada album ini tidak ditemukan');
    }
    return result.rowCount;
  }

  async deleteLikedFromAlbum(userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_album_likes."userId"= $1 AND user_album_likes."albumId"= $2',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Gagal Menghapus like album');
    }
  }
}

module.exports = AlbumsService;
