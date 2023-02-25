const { model, Schema } = require('mongoose');

const {
  models: { USER },
} = require('../utils/constants');

const TokenSet = new Schema({
  access_token: { type: String },
  refresh_token: { type: String },
  scope: { type: String },
  token_type: { type: String },
  expiry_date: { type: Number },
});

const UserSchema = new Schema(
  {
    emailAddress: { type: String, required: true, unique: true },
    messagesTotal: { type: Number },
    threadsTotal: { type: Number },
    historyId: { type: String },
    tokens: TokenSet,
  },
  { timestamps: true }
);

UserSchema.statics = {
  getUsers({ email, page = 1, perPage } = {}) {
    return this.find(
      { ...(email && { emailAddress: new RegExp(email, 'i') }) },
      {},
      { ...(perPage && { limit: perPage, skip: perPage * page - perPage }) }
    ).exec();
  },

  getUserByEmail(email) {
    return this.findOne({ emailAddress: email });
  },
};

UserSchema.methods = {
  updateTokens(tokens) {
    this.tokens = tokens;
    return this.save();
  },
};

const User = model(USER, UserSchema);

module.exports = User;
