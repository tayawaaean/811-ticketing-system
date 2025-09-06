const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Nova Underground LLC API',
    version: '1.0.0',
    description: 'A comprehensive backend system for managing underground utility tickets with authentication and role-based access',
    contact: {
      name: 'Nova Underground LLC',
      email: 'support@novaunderground.com'
    },
    license: {
      name: 'ISC'
    }
  },
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and authorization endpoints'
    },
    {
      name: 'Tickets',
      description: 'Ticket management endpoints'
    },
    {
      name: 'Import',
      description: 'Data import endpoints'
    },
    {
      name: 'Health',
      description: 'System health monitoring endpoints'
    }
  ],
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Development server',
    },
    {
      url: 'https://api.novaunderground.com',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'User ID'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address'
          },
          firstName: {
            type: 'string',
            description: 'User first name'
          },
          lastName: {
            type: 'string',
            description: 'User last name'
          },
          role: {
            type: 'string',
            enum: ['Admin', 'Contractor'],
            description: 'User role'
          },
          isActive: {
            type: 'boolean',
            description: 'Whether the user account is active'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Account creation timestamp'
          }
        }
      },
      Ticket: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Ticket ID'
          },
          ticketNumber: {
            type: 'string',
            description: 'Unique ticket number'
          },
          organization: {
            type: 'string',
            description: 'Organization name'
          },
          status: {
            type: 'string',
            enum: ['Open', 'Closed', 'Expired'],
            description: 'Ticket status'
          },
          expirationDate: {
            type: 'string',
            format: 'date-time',
            description: 'Ticket expiration date'
          },
          location: {
            type: 'string',
            description: 'Ticket location'
          },
          notes: {
            type: 'string',
            description: 'Additional notes'
          },
          renewals: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                date: {
                  type: 'string',
                  format: 'date-time'
                },
                extendedBy: {
                  type: 'number',
                  description: 'Days extended'
                }
              }
            }
          },
          assignedTo: {
            $ref: '#/components/schemas/User'
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address'
          },
          password: {
            type: 'string',
            minLength: 6,
            description: 'User password'
          }
        }
      },
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password', 'firstName', 'lastName'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address'
          },
          password: {
            type: 'string',
            minLength: 6,
            description: 'User password'
          },
          firstName: {
            type: 'string',
            description: 'User first name'
          },
          lastName: {
            type: 'string',
            description: 'User last name'
          },
          role: {
            type: 'string',
            enum: ['Admin', 'Contractor'],
            default: 'Contractor',
            description: 'User role (optional, defaults to Contractor)'
          }
        }
      },
      TicketRequest: {
        type: 'object',
        required: ['ticketNumber', 'organization', 'expirationDate', 'location', 'assignedTo'],
        properties: {
          ticketNumber: {
            type: 'string',
            description: 'Unique ticket number'
          },
          organization: {
            type: 'string',
            description: 'Organization name'
          },
          expirationDate: {
            type: 'string',
            format: 'date-time',
            description: 'Ticket expiration date'
          },
          location: {
            type: 'string',
            description: 'Ticket location'
          },
          notes: {
            type: 'string',
            description: 'Additional notes'
          },
          assignedTo: {
            type: 'string',
            description: 'User ID to assign the ticket to'
          }
        }
      },
      RenewRequest: {
        type: 'object',
        properties: {
          days: {
            type: 'number',
            default: 15,
            minimum: 1,
            maximum: 365,
            description: 'Number of days to extend (optional, defaults to 15)'
          }
        }
      },
      ApiResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Whether the request was successful'
          },
          message: {
            type: 'string',
            description: 'Response message'
          },
          data: {
            type: 'object',
            description: 'Response data'
          }
        }
      },
      PaginatedResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean'
          },
          count: {
            type: 'number',
            description: 'Number of items returned'
          },
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'number' },
              limit: { type: 'number' },
              total: { type: 'number' },
              pages: { type: 'number' }
            }
          },
          data: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Ticket'
            }
          }
        }
      },
      HealthCheckResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'OK'
          },
          message: {
            type: 'string',
            example: 'Nova Underground LLC Ticketing System API is running'
          },
          timestamp: {
            type: 'string',
            format: 'date-time'
          },
          environment: {
            type: 'string',
            example: 'development'
          },
          documentation: {
            type: 'string',
            format: 'uri'
          }
        }
      },
      DatabaseHealthResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'OK'
          },
          message: {
            type: 'string',
            example: 'Database connection is healthy'
          },
          timestamp: {
            type: 'string',
            format: 'date-time'
          },
          database: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'ticketing_system' },
              host: { type: 'string', example: 'localhost' },
              readyState: { type: 'number', example: 1 }
            }
          }
        }
      },
      SystemHealthResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'OK'
          },
          message: {
            type: 'string',
            example: 'System health check'
          },
          timestamp: {
            type: 'string',
            format: 'date-time'
          },
          system: {
            type: 'object',
            properties: {
              uptime: { type: 'string', example: '2h 15m' },
              memory: {
                type: 'object',
                properties: {
                  rss: { type: 'string', example: '85MB' },
                  heapUsed: { type: 'string', example: '65MB' },
                  heapTotal: { type: 'string', example: '120MB' }
                }
              },
              platform: { type: 'string', example: 'win32' },
              nodeVersion: { type: 'string', example: 'v18.17.0' },
              environment: { type: 'string', example: 'development' }
            }
          }
        }
      },
      ComprehensiveHealthResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'OK'
          },
          timestamp: {
            type: 'string',
            format: 'date-time'
          },
          checks: {
            type: 'object',
            properties: {
              database: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'OK' },
                  message: { type: 'string', example: 'Connected' }
                }
              },
              system: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'OK' },
                  memoryUsage: { type: 'string', example: '65MB' }
                }
              },
              application: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'OK' },
                  environment: { type: 'string', example: 'development' },
                  version: { type: 'string', example: '1.0.0' }
                }
              }
            }
          }
        }
      },
      AuthHealthResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'OK'
          },
          message: {
            type: 'string',
            example: 'Authentication system is healthy'
          },
          timestamp: {
            type: 'string',
            format: 'date-time'
          },
          auth: {
            type: 'object',
            properties: {
              totalUsers: { type: 'number', example: 15 },
              adminUsers: { type: 'number', example: 2 },
              jwtSecretConfigured: { type: 'boolean', example: true },
              jwtExpireConfigured: { type: 'boolean', example: true }
            }
          }
        }
      },
      BusinessHealthResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'OK'
          },
          message: {
            type: 'string',
            example: 'Business logic is healthy'
          },
          timestamp: {
            type: 'string',
            format: 'date-time'
          },
          business: {
            type: 'object',
            properties: {
              totalTickets: { type: 'number', example: 45 },
              activeTickets: { type: 'number', example: 32 },
              expiringSoon: { type: 'number', example: 5 },
              expirationMonitorActive: { type: 'boolean', example: true }
            }
          }
        }
      },
      ReadinessHealthResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'READY'
          },
          message: {
            type: 'string',
            example: 'Service is ready to accept traffic'
          },
          timestamp: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      LivenessHealthResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'ALIVE'
          },
          message: {
            type: 'string',
            example: 'Service is alive'
          },
          timestamp: {
            type: 'string',
            format: 'date-time'
          },
          uptime: {
            type: 'string',
            example: '3600s'
          }
        }
      },
      Alert: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Alert ID'
          },
          ticketId: {
            $ref: '#/components/schemas/Ticket'
          },
          type: {
            type: 'string',
            enum: ['expiring_soon', 'expired', 'renewed', 'closed'],
            description: 'Type of alert'
          },
          message: {
            type: 'string',
            description: 'Alert message'
          },
          severity: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'critical'],
            description: 'Alert severity level'
          },
          isRead: {
            type: 'boolean',
            description: 'Whether the alert has been read',
            default: false
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'When the alert was created'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'When the alert was last updated'
          }
        }
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ]
};

// Options for the swagger docs
const options = {
  swaggerDefinition,
  apis: ['./routes/*.js', './server.js'], // Path to the API docs
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

module.exports = {
  swaggerUi,
  swaggerSpec
};
