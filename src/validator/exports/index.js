const ExportSongsPlaylistPayloadSchema = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const ExportsValidator = {
  validateExportSongsPlaylistPayload: (payload) => {
    const validationResult = ExportSongsPlaylistPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = ExportsValidator;
