const fs = require('fs');
const path = require('path');
const process = require('process');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

const credentials = {
  web: {
    client_id: process.env.GOOGLE_OAUTH2_CLIENT_ID,
    project_id: process.env.GOOGLE_PROJECT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_secret: process.env.GOOGLE_OAUTH2_CLIENT_SECRET,
    redirect_uris: [process.env.GOOGLE_REDIRECT_URI],
  },
};

const userId = 'me';

function createCredentialsFromEnv() {
  if (fs.existsSync(CREDENTIALS_PATH)) {
    return;
  }

  const content = JSON.stringify(credentials);
  fs.writeFileSync(CREDENTIALS_PATH, content);
}

function loadSavedCredentialsIfExist() {
  try {
    const content = fs.readFileSync(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

function saveCredentials(client) {
  const content = fs.readFileSync(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  fs.writeFileSync(TOKEN_PATH, payload);
}

async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

async function listMessages(auth, pageToken) {
  const gmail = google.gmail({ version: 'v1', auth });
  const inbox = await gmail.users.messages.list({
    userId,
    ...(pageToken && { pageToken }),
    q: 'label:inbox',
  });
  return inbox.data;
}

async function getMessage(auth, messageId) {
  const gmail = google.gmail({ version: 'v1', auth });
  const message = await gmail.users.messages.get({
    userId,
    id: messageId,
  });
  return message.data;
}

async function getAllMessages(auth) {
  let pageToken;
  let messages = [];

  do {
    const inbox = await listMessages(auth, pageToken);
    const result = await Promise.allSettled(
      inbox.messages.map((message) => getMessage(auth, message.id))
    );
    const messageDetails = result
      .filter((r) => r.status === 'fulfilled')
      .map((r) => r.value);

    messages = [...messages, ...messageDetails];

    pageToken = inbox.nextPageToken;
  } while (pageToken);

  console.log(JSON.stringify(messages));

  return messages;
}

module.exports = {
  authorize,
  createCredentialsFromEnv,
  getAllMessages,
  getMessage,
  listMessages,
  loadSavedCredentialsIfExist,
  saveCredentials,
};
