// COVER BELUM KEGANTI KALO DIUBAH
const config = require('../../utils/config');
class UploadsHandler {
  constructor(service, validator) {
    this._uploadsService = service[0];
    this._albumsService = service[1];
    this._validator = validator;
  }

  async postUploadCoverHandler(request, h) {
    const { cover } = request.payload;
    const id = request.params.id;
    this._validator.validateImageHeaders(cover.hapi.headers);
    const filename = await this._uploadsService.writeFile(cover, id, cover.hapi);
    const url = `http://${process.env.HOST}:${process.env.PORT}/albums/${id}/covers/${filename}`;
    await this._albumsService.addAlbumCoverUrl(url, id);
    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }
}

module.exports = UploadsHandler;
