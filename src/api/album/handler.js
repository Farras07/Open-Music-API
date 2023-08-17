class AlbumsHandler {
  constructor(service, validator) {
    this._albumService = service[0];
    this._cacheService = service[1];
    this._validator = validator;
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name = 'untitled', year } = request.payload;
    const albumId = await this._albumService.addAlbum({ name, year });
    const response = h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: {
        albumId,
      },
    });

    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request, h) {
    const { id } = request.params;
    const album = await this._albumService.getAlbumById(id);
    const albumSongs = await this._albumService.getSongsByAlbumId(id);
    album.songs = albumSongs;
    const response = h.response({
      status: 'success',
      data: {
        album,
      },
    });
    response.code(200);
    return response;
  }

  async putAlbumByIdHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;
    await this._albumService.editAlbumById(id, request.payload);
    const response = h.response({
      status: 'success',
      message: 'Album berhasil diperbarui',
    });
    response.code(200);
    return response;
  }

  async deleteAlbumByIdHandler(request, h) {
    const { id } = request.params;
    await this._albumService.deleteAlbumById(id);
    const response = h.response({
      status: 'success',
      message: 'Album berhasil dihapus',
    });
    response.code(200);
    return response;
  }

  async postAlbumLikedByIdHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: albumId } = request.params;

    await this._albumService.getAlbumById(albumId);
    await this._albumService.verifyLikedOnAlbum(credentialId, albumId, 'add');
    const likedId = await this._albumService.addLikeToAlbum(credentialId, albumId);

    const response = h.response({
      status: 'success',
      message: `Berhasil menambahkan like pada album || ID ${likedId}`,
    });
    response.code(201);
    await this._cacheService.delete(`likesAlbum:${albumId}`);
    return response;
  }

  async getAlbumLikedByIdHandler(request, h) {
    const { id: albumId } = request.params;

    try {
      const number = await this._cacheService.get(`likesAlbum:${albumId}`);
      const response = h.response({
        status: 'success',
        data: {
          likes: JSON.parse(number),
        },
      });
      response.code(200);
      response.header('X-Data-Source', 'cache');
      return response;
    } catch (error) {
      const number = await this._albumService.getLikedFromAlbum(albumId);
      const response = h.response({
        status: 'success',
        data: {
          likes: number,
        },
      });
      response.code(200);
      await this._cacheService.set(`likesAlbum:${albumId}`, number);
      return response;
    }
  }

  async deleteAlbumLikedByIdHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: albumId } = request.params;

    await this._albumService.verifyLikedOnAlbum(credentialId, albumId, 'delete');
    await this._albumService.deleteLikedFromAlbum(credentialId, albumId);

    const response = h.response({
      status: 'success',
      message: 'Berhasil Unlike Album',
    });
    response.code(200);
    await this._cacheService.delete(`likesAlbum:${albumId}`);
    return response;
  }
}

module.exports = AlbumsHandler;
