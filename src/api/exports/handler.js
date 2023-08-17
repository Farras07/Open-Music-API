class ExportsHandler {
  constructor(service, validator) {
    this._exportService = service[0];
    this._playlistService = service[1];
    this._validator = validator;
  }

  async postExportSongsPlaylistHandler(request, h) {
    this._validator.validateExportSongsPlaylistPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    await this._playlistService.verifyPlaylistOwner(request.params.playlistId, credentialId);
    const message = {
      userId: request.auth.credentials.id,
      playlistId: request.params.playlistId,
      targetEmail: request.payload.targetEmail,
    };
    await this._exportService.sendMessage('export:playlistSongs', JSON.stringify(message));
    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    });

    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
