import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { MessageService } from '../services/message.service';
import { AppDataSource } from '../database/db';
import { Ticket } from '../models/ticket.entities';
import logger from '../logger/app.logger';
import { UserService } from '../services/user.service';
import { User } from 'models/user.entities';

interface MessagePayload {
  ticketId: string;
  content: string;
}

interface SocketUser {
  userId: string;
  username: string;
  role?: string;
}

export class MessageSocketController {
  private messageService: MessageService;

  constructor(private io: Server, messageService: MessageService) {
    this.messageService = messageService;

    // Socket.IO middleware for authentication
    this.io.use((socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          logger.warn(`Socket connection attempt without token from ${socket.id}`);
          return next(new Error('Authentication token missing'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as SocketUser;
        logger.info(`Socket authenticated for user ${decoded.userId}`);

        // Assign the user object to socket.data.user after fetching from the database
        (async () => {
          socket.data.user = await new UserService().findOne(decoded.userId);
          next();
        })();
        return;

      } catch (error) {
        logger.error(`Socket authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        next(new Error('Invalid token'));
      }
    });

    // Handle new connections
    this.io.on('connection', this.handleConnection);
  }

  private handleConnection = (socket: Socket) => {
    console.log('New client connected:', socket.id, 'User:', socket.data.user?.name);

    // Join a ticket room with access verification
    socket.on('joinTicket', async (ticketId: string) => {
      try {
        if (!socket.data.user) {
          throw new Error('User not authenticated');
        }

        // Verify user has access to the ticket
        const ticketRepository = AppDataSource.getRepository(Ticket);
        const ticket = await ticketRepository.findOne({
          where: { id: ticketId },
          relations: ['opened_by'],
        });

        if (!ticket) {
          logger.warn(`Attempt to join non-existent ticket ${ticketId} by user ${socket.data.user.id}`);
          socket.emit('error', { message: 'Ticket not found' });
          return;
        }

        const hasAccess = ticket.opened_by.id === socket.data.user.id ||
          socket.data.user.role === 'admin';

        if (!hasAccess) {
          logger.warn(`Unauthorized ticket access attempt: ${socket.data.user.name} to ticket ${ticketId}`);
          socket.emit('error', { message: 'Unauthorized access to ticket' });
          return;
        }

        // Leave previous ticket rooms if any
        const rooms = socket.rooms;
        rooms.forEach(room => {
          if (room !== socket.id) {
            socket.leave(room);
          }
        });

        await socket.join(ticketId);
        logger.info(`User ${socket.data.user.name} joined ticket room: ${ticketId}`);

        // Notify user of successful join
        socket.emit('joinedTicket', {
          ticketId,
          message: 'Successfully joined ticket conversation'
        });
      } catch (error) {
        logger.error(`Error joining ticket: ${error instanceof Error ? error.message : 'Unknown error'}`);
        socket.emit('error', {
          message: 'Failed to join ticket',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Handle sending messages
    socket.on('sendMessage', async (data: MessagePayload) => {
      try {
        const { ticketId, content } = data;
        if (!socket.data.user) {
          throw new Error('User not authenticated');
        }

        // Create message using MessageService
        const message = await this.messageService.newMessage(
          socket.data.user,
          ticketId,
          content
        );

        // Broadcast to the ticket room
        this.io.to(ticketId).emit('receiveMessage', {
          id: message.id,
          message: message.message,
          userId: message.user.id,
          username: message.user.name,
          created_at: message.created_at
        });

        logger.info(`Message sent in ticket ${ticketId} by user ${socket.data.user.username}`);
      } catch (error) {
        logger.error(`Error sending message: ${error instanceof Error ? error.message : 'Unknown error'}`);
        socket.emit('error', {
          message: 'Failed to send message',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  };
}