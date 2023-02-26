/* eslint-disable no-await-in-loop */
const { decode } = require('js-base64');
const { model, Schema } = require('mongoose');

const Email = require('./email');

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
  async fetchEmails() {
    // eslint-disable-next-line global-require
    const { getClient } = require('../utils/google');
    const user = this;
    const client = getClient(user.emailAddress);
    let pageToken;

    if (client) {
      const getFieldName = (key) => {
        switch (key) {
          case 'Delivered-To':
            return 'deliveredTo';
          case 'Sender':
            return 'sender';
          case 'To':
            return 'to';
          case 'From':
            return 'from';
          case 'Message-ID':
            return 'messageId';
          case 'Subject':
            return 'subject';
          default:
            return 'date';
        }
      };

      do {
        const inbox = await client.listMessages({});
        const result = await Promise.allSettled(
          inbox.messages.map((message) =>
            client.getMessage({ messageId: message.id })
          )
        );
        const messages = result
          .filter(({ status }) => status === 'fulfilled')
          .map(({ value: message }) => {
            const {
              id,
              threadId,
              labelIds,
              historyId,
              internalDate,
              snippet,
              payload: { headers, body },
            } = message;
            const messageDetails = headers.reduce((email, header) => {
              if (
                [
                  'Delivered-To',
                  'Sender',
                  'To',
                  'From',
                  'Message-ID',
                  'Subject',
                  'Date',
                ].includes(header.name)
              )
                return { ...email, [getFieldName(header.name)]: header.value };
              return email;
            }, {});
            return {
              emailId: id,
              labels: labelIds,
              threadId,
              historyId,
              internalDate,
              snippet,
              // eslint-disable-next-line no-underscore-dangle
              user: user._id,
              ...(body.size && {
                body: decode(body.data).replace(/-/g, '+').replace(/_/g, '/'),
              }),
              ...messageDetails,
            };
          });

        await Email.insertMany(messages);

        pageToken = inbox.nextPageToken;
      } while (pageToken);
    }
  },

  updateTokens(tokens) {
    this.tokens = tokens;
    return this.save();
  },
};

const User = model(USER, UserSchema);

module.exports = User;
