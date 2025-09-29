
const http = require('http');
const url = require('url');
const open = require('open');
const { execSync } = require('child_process');

// These values should be provided as environment variables or command line arguments
const CLIENT_ID = process.env.CHROME_CLIENT_ID;
const CLIENT_SECRET = process.env.CHROME_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ Error: CHROME_CLIENT_ID and CHROME_CLIENT_SECRET environment variables are required.');
  process.exit(1);
}

// Use an ephemeral port
const PORT = 0;
let server;

async function getRefreshToken() {
  return new Promise((resolve, reject) => {
    // Create a server to handle the OAuth callback
    server = http.createServer(async (req, res) => {
      try {
        const parsedUrl = url.parse(req.url, true);
        const { code } = parsedUrl.query;

        if (code) {
          // Send a simple response to the user
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body>
                <h1>Authorization Successful</h1>
                <p>You can close this window and return to the terminal.</p>
              </body>
            </html>
          `);

          // Close the server as we don't need it anymore
          server.close();

          try {
            // Exchange the code for tokens
            const tokenCommand = `curl -s -d "client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${code}&grant_type=authorization_code&redirect_uri=http://localhost:${server.address().port}" https://oauth2.googleapis.com/token`;
            const tokenResponse = JSON.parse(execSync(tokenCommand).toString());
            
            if (tokenResponse.refresh_token) {
              console.log('\n✅ Successfully obtained refresh token!\n');
              console.log('==================================================');
              console.log('Your refresh token (save this securely):');
              console.log(tokenResponse.refresh_token);
              console.log('==================================================\n');
              console.log('To use this token in GitHub Actions:');
              console.log('1. Go to your repo -> Settings -> Secrets and variables -> Actions');
              console.log('2. Create a new repository secret named CHROME_REFRESH_TOKEN');
              console.log('3. Paste the token as the value\n');
              resolve(tokenResponse.refresh_token);
            } else {
              console.error('❌ Error: No refresh token received.', tokenResponse);
              reject(new Error('No refresh token received'));
            }
          } catch (error) {
            console.error('❌ Error exchanging code for tokens:', error);
            reject(error);
          }
        } else {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end('<html><body><h1>Authorization Failed</h1><p>No authorization code was provided.</p></body></html>');
          reject(new Error('No authorization code was provided.'));
        }
      } catch (error) {
        console.error('❌ Error handling request:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        reject(error);
      }
    });

    // Start the server on a random available port
    server.listen(PORT, () => {
      const port = server.address().port;
      console.log(`Server listening on port ${port}`);

      // Construct the OAuth URL
      const scope = encodeURIComponent('https://www.googleapis.com/auth/chromewebstore');
      const redirectUri = encodeURIComponent(`http://localhost:${port}`);
      const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${CLIENT_ID}&response_type=code&scope=${scope}&redirect_uri=${redirectUri}`;

      console.log('\nOpening browser for Google OAuth authentication...');
      console.log('Please log in and authorize the application.\n');

      // Open the authorization URL in the default browser
      open(authUrl).catch(error => {
        console.error('❌ Error opening browser:', error);
        console.log('Please open this URL manually in your browser:');
        console.log(authUrl);
      });
    });
  });
}

// Execute if run directly
if (require.main === module) {
  getRefreshToken().catch(error => {
    console.error('❌ Error getting refresh token:', error);
    process.exit(1);
  });
}

module.exports = getRefreshToken;
