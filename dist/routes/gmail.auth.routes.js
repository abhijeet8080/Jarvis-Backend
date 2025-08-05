"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const gmail_auth_controller_1 = require("../controllers/gmail.auth.controller");
const router = (0, express_1.Router)();
router.get('/login', gmail_auth_controller_1.googleOAuthRedirect);
router.get('/callback', gmail_auth_controller_1.googleOAuthCallback);
exports.default = router;
