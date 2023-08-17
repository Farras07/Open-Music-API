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
    const { pathCover: oldFile } = await this._albumsService.getLocalPathCover(id);
    const { filename, path } = await this._uploadsService.writeFile(cover, id, cover.hapi, oldFile);
    const url = `http://${config.app.host}:${config.app.port}/albums/covers/${filename}`; // Match the URL structure
    await this._albumsService.addAlbumCoverUrl(url, path, id);
    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }
}

module.exports = UploadsHandler;
