import { Server } from 'socket.io';
import http from 'http';
import { MessageSocketController } from '../controllers/message.socket.ontroller';
import { MessageService } from '../services/message.service';
import { FRONTEND_URL } from '../config/env';
import logger from '../logger/app.logger';

let io: Server | null = null;

export const initializeSocket = (server: http.Server) => {
    if (io) {
        return io;
    }

    io = new Server(server, {
        cors: {
            origin: [
                'http://localhost:3000',
                `${FRONTEND_URL}`
            ],
            methods: ['GET', 'POST'],
            credentials: true
        },
        pingTimeout: 60000,
        pingInterval: 25000,
    });

    const messageService = new MessageService();
    new MessageSocketController(io, messageService);

    io.on('connect', (socket) => {
        logger.info(`Socket connected: ${socket.id}`);
    });

    io.on('disconnect', (socket) => {
        logger.info(`Socket disconnected: ${socket.id}`);
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO not initialized');
    }
    return io;
};

export const closeSocket = () => {
    if (io) {
        io.close();
        io = null;
    }
};
