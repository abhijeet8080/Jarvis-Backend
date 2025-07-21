import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
import authRoutes from './routes/gmail.auth.routes';
app.use('/api/auth', authRoutes);

import chatRoute from './routes/chat.routes';
app.use('/api/', chatRoute);



export default app;
