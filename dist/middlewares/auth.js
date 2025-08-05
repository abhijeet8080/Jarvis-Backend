"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = (0, jwt_1.verifyJwt)(token);
    if (!decoded || typeof decoded !== 'object') {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
    req.user = {
        userId: decoded.userId,
        email: decoded.email,
    };
    console.log('User authenticated:', req.user);
    next();
};
exports.authenticate = authenticate;
