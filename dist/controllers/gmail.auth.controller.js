"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleOAuthCallback = exports.googleOAuthRedirect = void 0;
const googleapis_1 = require("googleapis");
const jwt_1 = require("../utils/jwt");
const client_1 = require("../lib/client");
const oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
const googleOAuthRedirect = (req, res) => {
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
exports.googleOAuthRedirect = googleOAuthRedirect;
const googleOAuthCallback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code } = req.query;
        if (!code)
            return res.status(400).send('Code not found');
        const { tokens } = yield oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        const oauth2ClientInstance = googleapis_1.google.oauth2('v2');
        const userinfo = yield oauth2ClientInstance.userinfo.get({ auth: oauth2Client });
        const { email, name, picture } = userinfo.data;
        if (!email)
            return res.status(400).send('Email not found');
        const user = yield client_1.prisma.user.upsert({
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
        const jwtToken = (0, jwt_1.signJwt)({ userId: user.id, email: user.email });
        console.log('User authenticated:', user.email);
        const frontendRedirectUrl = `${process.env.FRONTEND_REDIRECT_URI}/auth/callback` || 'http://localhost:3000/auth/callback';
        const redirectUrl = `${frontendRedirectUrl}?token=${jwtToken}&name=${encodeURIComponent(user.name || '')}&email=${encodeURIComponent(user.email)}&avatar=${encodeURIComponent(user.avatar || '')}`;
        res.redirect(redirectUrl);
    }
    catch (error) {
        console.error('OAuth callback error:', error);
        res.status(500).send('Authentication failed');
    }
});
exports.googleOAuthCallback = googleOAuthCallback;
