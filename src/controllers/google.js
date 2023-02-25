const http = require('http');
const destroyer = require('server-destroy');
const { google } = require('googleapis');

const { setClient, Gmail } = require('../utils/google');
const config = require('../../config');
const User = require('../models/user');

const consent = (req, res) => {
  const oAuth2Client = new google.auth.OAuth2(
    config.google.client.id,
    config.google.client.secret,
    config.google.redirect_uri
  );
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: config.google.scope,
  });
  const server = http
    .createServer(async (request, response) => {
      if (request.url.indexOf('/oauth2callback') > -1) {
        const url = new URL(request.url, 'http://localhost:3000');
        const qs = url.searchParams;
        const code = qs.get('code');

        response.end('Authentication successful!');

        server.destroy();

        const { tokens } = await oAuth2Client.getToken(code);

        oAuth2Client.setCredentials(tokens);

        const client = new Gmail(oAuth2Client);
        const user = await client.getProfile();

        setClient(user.emailAddress, client);

        const existingUser = await User.getUserByEmail(user.emailAddress);

        if (existingUser) {
          await existingUser.updateTokens(tokens);
        } else {
          await User.create({ ...user, tokens });
        }
      }
    })
    .listen(3000, () => {
      res.redirect(authUrl);
    });
  destroyer(server);
};

module.exports = {
  consent,
};
