import { createLogger, format, transports, Logger } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

// Define log format
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.json(),
  format.errors({ stack: true }) // Include stack traces for errors
);

// Configure logger
const logger: Logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [
    // Console transport for development
    new transports.Console({
      format: process.env.NODE_ENV === 'production'
        ? logFormat
        : format.combine(format.colorize(), format.simple()),
    }),
    // File transport with rotation for production
    new DailyRotateFile({
      filename: 'logs/app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m', // Rotate if file exceeds 20MB
      maxFiles: '14d', // Keep logs for 14 days
    }),
    // Separate file for errors
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      level: 'error',
    }),
  ],
});

// Add a transport for uncaught exceptions
logger.exceptions.handle(
  new transports.File({ filename: 'logs/exceptions.log' })
);

// Add a transport for unhandled promise rejections
logger.rejections.handle(
  new transports.File({ filename: 'logs/rejections.log' })
);

export default logger;