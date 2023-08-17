class PlaylistsHandler {
  constructor(service, validator) {
    this._playlistService = service[0];
    this._playlistSongsService = service[1];

    this._playlistValidator = validator[0];
    this._playlistSongsValidator = validator[1];
  }

  async postPlaylistHandler(request, h) {
    this._playlistValidator.validatePlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    const playlistId = await this._playlistService.addPlaylist({ name, owner: credentialId });
    const response = h.response({
      status: 'success',
      data: {
        playlistId,
      },
    });

    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._playlistService.getPlaylists(credentialId);
    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistService.verifyPlaylistOwner(id, credentialId);
    await this._playlistService.deletePlaylistById(id);
    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postSongToPlaylistHandler(request, h) {
    this._playlistSongsValidator.validateSongAddedPayload(request.payload);
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistService.verifyPlaylistAccess(id, credentialId);
    await this._playlistSongsService.addSongToPlaylistById(id, request.payload);
    await this._playlistService.addPlaylistActivities(id, credentialId, 'add', request.payload);
    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan',
    });
    response.code(201);
    return response;
  }

  async getSongsInPlaylistByIdHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id } = request.params;
    await this._playlistService.verifyPlaylistAccess(id, credentialId);
    const playlist = await this._playlistService.getPlaylistById(id, credentialId);
    const songs = await this._playlistSongsService.getSongsPlaylist(id);
    playlist.songs = songs;
    const response = h.response({
      status: 'success',
      data: {
        playlist,
      },
    });
    return response;
  }

  async deleteSongFromPlaylistHandler(request) {
    this._playlistSongsValidator.validateSongDeletedPayload(request.payload);
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistService.verifyPlaylistAccess(id, credentialId);
    await this._playlistSongsService.deleteSongFromPlaylist(id, request.payload);
    await this._playlistService.addPlaylistActivities(id, credentialId, 'delete', request.payload);

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    };
  }

  async getPlaylistActivitiesHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistService.verifyPlaylistAccess(id, credentialId);
    const playlistId = await this._playlistService.getPlaylistIdInPlaylistActivitiesTableById(id);
    const activities = await this._playlistService.getPlaylistActivitiesById(id);
    const response = h.response({
      status: 'success',
      data: {
        playlistId,
        activities,
      },
    });
    return response;
  }
}

module.exports = PlaylistsHandler;
