const { google } = require('googleapis');

const config = require('../../config');
const User = require('../models/user');

const clients = {};

function Gmail(auth, version = 'v1') {
  this.gmail = google.gmail({ auth, version });
}

Gmail.prototype.listMessages = async function listMessages({
  maxResults = 100,
  pageToken,
  userId,
}) {
  const inbox = await this.gmail.users.messages.list({
    userId,
    maxResults,
    ...(pageToken && { pageToken }),
    q: 'label:inbox',
  });
  return inbox.data;
};

Gmail.prototype.getMessage = async function getMessage({ userId, messageId }) {
  const message = await this.gmail.users.messages.get({
    userId,
    id: messageId,
  });
  return message.data;
};

Gmail.prototype.getProfile = async function getProfile() {
  const profile = await this.gmail.users.getProfile({
    userId: 'me',
  });
  return profile.data;
};

exports.Gmail = Gmail;

exports.getClient = async (email) => clients[email];

exports.setClient = async (email, client) => {
  clients[email] = client;
};

exports.initialize = async () => {
  const users = await User.getUsers();
  users.forEach(async (user) => {
    if (user.tokens) {
      const oAuth2Client = new google.auth.OAuth2(
        config.google.client.id,
        config.google.client.secret,
        config.google.redirect_uri
      );

      oAuth2Client.setCredentials(user.tokens);

      clients[user.emailAddress] = new Gmail(oAuth2Client);
    }
  });
};
