import morgan from 'morgan';
import logger from './app.logger';

// Custom Morgan token for request body (optional, use cautiously)
morgan.token('body', (req: any) => JSON.stringify(req.body));

// Define a stream to pipe Morgan logs to Winston
const morganStream: morgan.StreamOptions = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

export const morganMiddleware = morgan(
  ':method :url :status :response-time ms - :res[content-length]',
  {
    stream: morganStream,
    skip: (req) => process.env.NODE_ENV !== 'production' && req.url === '/health',
  }
);