const {
  generateAuthUrl,
  getToken,
  setCredentials,
} = require('../utils/google');

const consent = (req, res) => {
  const authUrl = generateAuthUrl();
  res.redirect(authUrl);
};

const oauth2callback = async (req, res) => {
  const { code } = req.query;
  const { tokens } = await getToken(code);
  setCredentials(tokens);
  res.end('Authentication successful!');
};

module.exports = {
  consent,
  oauth2callback,
};
