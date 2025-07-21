import { Request, Response } from 'express';
import { google } from 'googleapis';
import { signJwt } from '../utils/jwt';
import { prisma } from '../lib/client'; // or wherever your Prisma client is


const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export const googleOAuthRedirect = (req: Request, res: Response) => {
  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'openid'
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });

  res.redirect(url);
};

export const googleOAuthCallback = async (req: Request, res: Response) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('Code not found');

  const { tokens } = await oauth2Client.getToken(code as string);
  oauth2Client.setCredentials(tokens);

  // Get user info
  const oauth2ClientInstance = google.oauth2('v2');
  const userinfo = await oauth2ClientInstance.userinfo.get({
    auth: oauth2Client,
  });

  const { email, name, picture } = userinfo.data;
  if (!email) return res.status(400).send('Email not found');

  // Store or update user in database
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      accessToken: tokens.access_token || '',
      refreshToken: tokens.refresh_token || '',
      name: name || '',
      avatar: picture || '',
    },
    create: {
      email,
      accessToken: tokens.access_token || '',
      refreshToken: tokens.refresh_token || '',
      name: name || '',
      avatar: picture || '',
    },
  });

  // Create JWT
  const jwtToken = signJwt({ userId: user.id, email: user.email });
  console.log("Usr authenticated:", user.email);
  // Send token to frontend
  res.json({
    message: 'Authenticated successfully!',
    token: jwtToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    },
  });
};
