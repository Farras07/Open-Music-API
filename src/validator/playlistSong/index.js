const InvariantError = require('../../exceptions/InvariantError');
const { SongAddedPayloadSchema, SongDeletedPayloadSchema } = require('./schema');

const PlaylistSongsValidator = {
  validateSongAddedPayload: (payload) => {
    const validationResult = SongAddedPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateSongDeletedPayload: (payload) => {
    const validationResult = SongDeletedPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = PlaylistSongsValidator;
