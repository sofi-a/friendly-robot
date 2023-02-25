const { google } = require('googleapis');

const scopes = ['https://www.googleapis.com/auth/gmail.readonly'];

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_OAUTH2_CLIENT_ID,
  process.env.GOOGLE_OAUTH2_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

exports.generateAuthUrl = () =>
  oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });

exports.getToken = (code) => oAuth2Client.getToken(code);

exports.setCredentials = (tokens) => oAuth2Client.setCredentials(tokens);

function Gmail(auth = oAuth2Client, version = 'v1') {
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

exports.Gmail = Gmail;
