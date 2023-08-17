const Joi = require('joi');

const ExportSongsPlaylistPayloadSchema = Joi.object({
  targetEmail: Joi.string().email({ tlds: true }).required(),
});

module.exports = ExportSongsPlaylistPayloadSchema;
