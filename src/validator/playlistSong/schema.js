const Joi = require('joi');

const SongAddedPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

const SongDeletedPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

module.exports = { SongAddedPayloadSchema, SongDeletedPayloadSchema };
