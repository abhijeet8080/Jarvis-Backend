"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chat_controller_1 = require("../controllers/chat.controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.post('/chat', auth_1.authenticate, chat_controller_1.chatWithAI);
exports.default = router;
