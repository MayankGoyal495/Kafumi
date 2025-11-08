const { google } = require("googleapis");
const readline = require("readline");
require("dotenv").config({ path: ".env.local" });

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: SCOPES,
});

console.log("\n🔐 Authorize this app by visiting this URL:\n");
console.log(authUrl);
console.log("\n");

const rl = readline.createInterface({ 
  input: process.stdin, 
  output: process.stdout 
});

rl.question("Enter the authorization code here: ", async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log("\n✅ Tokens received!\n");
    console.log("Add this to your .env.local file:\n");
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`);
  } catch (error) {
    console.error("❌ Error retrieving tokens:", error.message);
  }
  rl.close();
});
