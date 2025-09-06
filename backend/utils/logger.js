const winston = require('winston');
const path = require('path');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Add colors to winston
winston.addColors(colors);

// Define format for logs
const format = winston.format.combine(
  // Add timestamp
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  // Add colors
  winston.format.colorize({ all: true }),
  // Define the format of the message showing the timestamp, the level and the message
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define which transports the logger must use to print out messages
const transports = [
  // Allow the use the console to print the messages
  new winston.transports.Console(),
  // Allow to print all the error level messages inside the error.log file
  new winston.transports.File({
    filename: path.join(__dirname, '..', 'logs', 'error.log'),
    level: 'error',
  }),
  // Allow to print all the error message inside the all.log file
  new winston.transports.File({
    filename: path.join(__dirname, '..', 'logs', 'all.log'),
  }),
];

// Create the logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
  levels,
  format,
  transports,
});

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Export logger functions for easy use
const logRequest = (req, res, next) => {
  logger.http(`${req.method} ${req.url} - ${req.ip}`);
  next();
};

const logError = (error, req, res, next) => {
  logger.error(`${error.message} - ${req.method} ${req.url} - ${req.ip}`);
  next(error);
};

module.exports = {
  logger,
  logRequest,
  logError
};
