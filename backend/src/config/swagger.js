/**
 * Swagger / OpenAPI 3.0.3 specification for the Kohinoor Gemstone Backend API.
 *
 * Served by swagger-ui-express at /admin/api-docs (see ../server.js), behind
 * the admin dashboard session. The raw spec JSON is available at
 * /admin/api-docs.json.
 *
 * Auth model:
 *   - `adminAuth` is an OAuth2 password flow. In the Authorize dialog, enter
 *     the admin email and password directly. The token endpoint
 *     POST /api/auth/token only issues tokens to admin / super_admin accounts;
 *     customer credentials are rejected with 401 invalid_grant.
 *   - `customerAuth` is a Bearer scheme: paste the JWT from POST /api/customer/login.
 *   - Both tokens are sent as `Authorization: Bearer <token>`.
 */

// Server URLs are auto-detected from the environment at boot:
//   hosted URL from BACKEND_URL (fallback BASE_URL, then the production domain)
//   local URL from PORT (default 3001)
const hostedUrl = process.env.BACKEND_URL || process.env.BASE_URL || 'https://www.kohinoorgemstone.com';
const localUrl = `http://localhost:${process.env.PORT || 3001}`;

export default {
  openapi: '3.0.3',
  info: {
    title: 'Kohinoor Gemstone API',
    version: '1.0.0',
    description:
      'REST API for the Kohinoor Gemstone website. Covers admin authentication, customer accounts (OTP signup, login, addresses, chat), gemstone catalog, business information, image uploads (Cloudinary), Razorpay payments, cart management and the Kohinoor AI gemstone assistant.',
    contact: {
      name: 'Kohinoor Gemstone Team'
    }
  },
  servers: [
    { url: hostedUrl, description: 'Hosted (production)' },
    { url: localUrl, description: 'Local development' }
  ],
  tags: [
    { name: 'Health', description: 'Server health checks' },
    { name: 'Admin Auth', description: 'Admin / super-admin authentication and management' },
    { name: 'Customer Auth', description: 'Customer signup, login, OTP verification, profile and addresses' },
    { name: 'Customer Chat', description: 'Customer support chat messages' },
    { name: 'Cart', description: 'Customer shopping cart operations' },
    { name: 'Gemstones', description: 'Gemstone catalog, search and admin management' },
    { name: 'Business', description: 'Business info, contact details and public contact form' },
    { name: 'Uploads', description: 'Image upload to Cloudinary (admin)' },
    { name: 'Payments', description: 'Razorpay order creation and signature verification' },
    { name: 'AI Assistant', description: 'Kohinoor AI gemstone conversation assistant' }
  ],
  components: {
    securitySchemes: {
      adminAuth: {
        type: 'oauth2',
        description: 'Admin email/password. Only admin or super_admin accounts work; customer credentials are rejected with 401 invalid_grant.',
        flows: {
          password: {
            tokenUrl: '/api/auth/token',
            scopes: {}
          }
        }
      },
      customerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Customer JWT obtained from POST /api/customer/login'
      }
    },
    schemas: {
      ApiSuccess: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
          data: { type: 'object', description: 'Endpoint-specific payload' }
        }
      },
      ApiError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
          error: { type: 'object', description: 'Optional error details' }
        }
      },
      AdminUser: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '60f7c1a2b3c4d5e6f7a8b9c0' },
          name: { type: 'string', example: 'Tuba Mirza' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['admin', 'super_admin'] },
          isActive: { type: 'boolean' },
          lastLogin: { type: 'string', format: 'date-time' },
          profileImage: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      Customer: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string', nullable: true },
          avatar: { type: 'string', nullable: true },
          dateOfBirth: { type: 'string', format: 'date', nullable: true },
          username: { type: 'string', nullable: true },
          isEmailVerified: { type: 'boolean' },
          isActive: { type: 'boolean' },
          address: {
            type: 'object',
            properties: {
              street: { type: 'string' },
              city: { type: 'string' },
              state: { type: 'string' },
              pincode: { type: 'string' },
              country: { type: 'string' }
            }
          },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      SavedAddress: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          label: { type: 'string', example: 'Home' },
          fullName: { type: 'string' },
          phone: { type: 'string' },
          street: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' },
          pincode: { type: 'string' },
          country: { type: 'string', example: 'India' },
          isDefault: { type: 'boolean' }
        }
      },
      CartItem: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          product: { type: 'string', description: 'Gemstone ID' },
          name: { type: 'string' },
          price: { type: 'number' },
          quantity: { type: 'integer' },
          image: { type: 'string', nullable: true }
        }
      },
      Cart: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          customer: { type: 'string' },
          items: { type: 'array', items: { $ref: '#/components/schemas/CartItem' } },
          totalAmount: { type: 'number' },
          totalQuantity: { type: 'integer' },
          currency: { type: 'string', example: 'INR' }
        }
      },
      GemstoneName: {
        type: 'object',
        properties: {
          english: { type: 'string', example: 'Blue Sapphire' },
          urdu: { type: 'string', example: 'نیلم' },
          hindi: { type: 'string', example: 'नीलम' }
        }
      },
      Gemstone: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { $ref: '#/components/schemas/GemstoneName' },
          category: { type: 'string', example: 'sapphire' },
          color: { type: 'string', example: 'Blue' },
          summary: { type: 'string' },
          description: { type: 'string' },
          purpose: { type: 'array', items: { type: 'string' } },
          images: { type: 'array', items: { type: 'string' } },
          price: { type: 'number', nullable: true },
          priceRange: {
            type: 'object',
            properties: {
              min: { type: 'number' },
              max: { type: 'number' }
            }
          },
          slug: { type: 'string' },
          trending: { type: 'boolean' },
          featured: { type: 'boolean' },
          viewCount: { type: 'integer' },
          certification: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              image: { type: 'string' },
              validUntil: { type: 'string', format: 'date' }
            }
          },
          astrologyBenefits: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'admin@kohinoorgemstone.com' },
          password: { type: 'string', format: 'password', example: 'password123' }
        }
      },
      OtpRequest: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email' }
        }
      },
      VerifyOtpRequest: {
        type: 'object',
        required: ['email', 'otp'],
        properties: {
          email: { type: 'string', format: 'email' },
          otp: { type: 'string', example: '123456' }
        }
      },
      SignupRequest: {
        type: 'object',
        required: ['name', 'email', 'password', 'otp'],
        properties: {
          name: { type: 'string', example: 'Rahul Sharma' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', format: 'password', minLength: 6 },
          dateOfBirth: { type: 'string', format: 'date', description: 'Must be at least 13 years old' },
          phone: { type: 'string' },
          address: { type: 'object' },
          place: { type: 'string', description: 'City; used to build the address object' },
          otp: { type: 'string', description: 'OTP verified via /send-otp + /verify-otp first' },
          checkOnly: { type: 'boolean', description: 'If true, only checks whether the email exists' }
        }
      },
      ResetPasswordRequest: {
        type: 'object',
        required: ['email', 'otp', 'newPassword'],
        properties: {
          email: { type: 'string', format: 'email' },
          otp: { type: 'string' },
          newPassword: { type: 'string', format: 'password', minLength: 6 }
        }
      },
      AddToCartRequest: {
        type: 'object',
        required: ['productId', 'quantity'],
        properties: {
          productId: { type: 'string', description: 'Active gemstone ID' },
          quantity: { type: 'integer', minimum: 1, example: 1 }
        }
      },
      UpdateQuantityRequest: {
        type: 'object',
        required: ['quantity'],
        properties: {
          quantity: { type: 'integer', minimum: 1, example: 2 }
        }
      },
      GemstoneInput: {
        type: 'object',
        required: ['name', 'category', 'color', 'summary', 'description', 'purpose'],
        properties: {
          name: { $ref: '#/components/schemas/GemstoneName' },
          category: { type: 'string' },
          color: { type: 'string' },
          summary: { type: 'string' },
          description: { type: 'string' },
          purpose: { type: 'array', items: { type: 'string' } },
          images: { type: 'array', items: { type: 'string' } },
          price: { type: 'number' },
          priceRange: {
            type: 'object',
            properties: {
              min: { type: 'number' },
              max: { type: 'number' }
            }
          },
          trending: { type: 'boolean' },
          featured: { type: 'boolean' },
          tags: { type: 'array', items: { type: 'string' } }
        }
      },
      ContactFormRequest: {
        type: 'object',
        required: ['name', 'email', 'message'],
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          subject: { type: 'string' },
          message: { type: 'string' }
        }
      },
      Base64UploadRequest: {
        type: 'object',
        required: ['image'],
        properties: {
          image: { type: 'string', description: 'Base64 data URI, e.g. data:image/png;base64,...' },
          folder: { type: 'string', default: 'kohinoor-gemstones' }
        }
      },
      CreateOrderRequest: {
        type: 'object',
        required: ['amount'],
        properties: {
          amount: { type: 'number', description: 'Amount in paise (INR * 100). Minimum 100 (₹1.00).' }
        }
      },
      VerifyPaymentRequest: {
        type: 'object',
        required: ['razorpay_payment_id', 'razorpay_order_id', 'razorpay_signature'],
        properties: {
          razorpay_payment_id: { type: 'string' },
          razorpay_order_id: { type: 'string' },
          razorpay_signature: { type: 'string' }
        }
      },
      AIRequest: {
        type: 'object',
        required: ['message'],
        properties: {
          message: { type: 'string', maxLength: 500, description: 'User message to Kohinoor AI' },
          context: { type: 'object', description: 'Optional context extracted by the frontend' },
          sessionId: { type: 'string', description: 'Optional client-provided conversation id' },
          userInfo: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              dob: { type: 'string', format: 'date' },
              place: { type: 'string' },
              phone: { type: 'string' }
            },
            description: 'Optional profile of a signed-in customer'
          }
        }
      }
    },
    responses: {
      Unauthorized: {
        description: 'Missing, invalid or expired token',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
      },
      Forbidden: {
        description: 'Authenticated but lacking the required role',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
      },
      NotFound: {
        description: 'Resource not found',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
      },
      BadRequest: {
        description: 'Invalid request body or parameters',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
      },
      ServerError: {
        description: 'Unexpected server error',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } }
      }
    }
  },
  paths: {
    // ============================ HEALTH ============================
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        description: 'Returns API status, timestamp and environment. No authentication required.',
        responses: {
          200: {
            description: 'API is running',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    message: { type: 'string' },
                    timestamp: { type: 'string', format: 'date-time' },
                    environment: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },

    // ============================ ADMIN AUTH ============================
    '/api/auth/login': {
      post: {
        tags: ['Admin Auth'],
        summary: 'Admin login (JSON API)',
        description: 'Authenticates an admin and returns a JWT. For the Swagger UI Authorize dialog, use the OAuth2 password flow (email/password) which targets POST /api/auth/token instead.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } }
        },
        responses: {
          200: { description: 'Login successful, JWT returned', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/auth/token': {
      post: {
        tags: ['Admin Auth'],
        summary: 'OAuth2 token endpoint (Swagger UI Authorize flow)',
        description: 'Issues a bearer token from email/password. Used automatically by the Swagger UI Authorize dialog (OAuth2 password flow). Only admin or super_admin credentials are accepted: customers and other accounts receive 401 invalid_grant. Accepts both form-encoded (grant_type=password style) and JSON bodies.',
        requestBody: {
          required: true,
          content: {
            'application/x-www-form-urlencoded': {
              schema: {
                type: 'object',
                required: ['username', 'password'],
                properties: {
                  username: { type: 'string', format: 'email', description: 'Admin email' },
                  password: { type: 'string', format: 'password' },
                  grant_type: { type: 'string', description: 'Ignored; accepted for OAuth2 client compatibility', default: 'password' },
                  client_id: { type: 'string', description: 'Ignored; accepted for OAuth2 client compatibility' }
                }
              }
            },
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'password'],
                properties: {
                  username: { type: 'string', format: 'email' },
                  password: { type: 'string', format: 'password' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Token issued',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    access_token: { type: 'string' },
                    token_type: { type: 'string', example: 'bearer' },
                    expires_in: { type: 'integer', example: 2592000 }
                  }
                }
              }
            }
          },
          400: {
            description: 'Missing username or password',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string', example: 'invalid_request' },
                    error_description: { type: 'string' }
                  }
                }
              }
            }
          },
          401: {
            description: 'Invalid credentials, deactivated account, or non-admin (customer) credentials',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string', example: 'invalid_grant' },
                    error_description: { type: 'string' }
                  }
                }
              }
            }
          },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/auth/logout': {
      post: {
        tags: ['Admin Auth'],
        summary: 'Admin logout',
        security: [{ adminAuth: [] }],
        responses: {
          200: { description: 'Logged out', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      }
    },
    '/api/auth/me': {
      get: {
        tags: ['Admin Auth'],
        summary: 'Get current admin profile',
        security: [{ adminAuth: [] }],
        responses: {
          200: { description: 'Current admin user', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      }
    },
    '/api/auth/profile': {
      put: {
        tags: ['Admin Auth'],
        summary: 'Update admin profile',
        security: [{ adminAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  profileImage: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Profile updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/auth/change-password': {
      put: {
        tags: ['Admin Auth'],
        summary: 'Change admin password',
        security: [{ adminAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currentPassword', 'newPassword'],
                properties: {
                  currentPassword: { type: 'string', format: 'password' },
                  newPassword: { type: 'string', format: 'password', minLength: 6 }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Password changed', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/auth/create-admin': {
      post: {
        tags: ['Admin Auth'],
        summary: 'Create a new admin (super admin only)',
        security: [{ adminAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', format: 'password', minLength: 6 },
                  role: { type: 'string', enum: ['admin', 'super_admin'] }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Admin created', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/auth/admins': {
      get: {
        tags: ['Admin Auth'],
        summary: 'List all admins (super admin only)',
        security: [{ adminAuth: [] }],
        responses: {
          200: { description: 'List of admin users', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/auth/admin/{id}/status': {
      put: {
        tags: ['Admin Auth'],
        summary: 'Activate or deactivate an admin (super admin only)',
        security: [{ adminAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Admin user ID' }
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { isActive: { type: 'boolean' } }
              }
            }
          }
        },
        responses: {
          200: { description: 'Admin status updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      }
    },
    '/api/auth/admin/{id}': {
      delete: {
        tags: ['Admin Auth'],
        summary: 'Delete an admin (super admin only)',
        security: [{ adminAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Admin user ID' }
        ],
        responses: {
          200: { description: 'Admin deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      }
    },

    // ============================ CUSTOMER AUTH ============================
    '/api/customer/check-email': {
      post: {
        tags: ['Customer Auth'],
        summary: 'Check whether an email is already registered',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/OtpRequest' } } }
        },
        responses: {
          200: {
            description: 'Email availability',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    exists: { type: 'boolean' },
                    verified: { type: 'boolean' }
                  }
                }
              }
            }
          },
          400: { $ref: '#/components/responses/BadRequest' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/customer/send-otp': {
      post: {
        tags: ['Customer Auth'],
        summary: 'Send a signup verification OTP to an email',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/OtpRequest' } } }
        },
        responses: {
          200: { description: 'OTP sent', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/customer/verify-otp': {
      post: {
        tags: ['Customer Auth'],
        summary: 'Verify the signup OTP before final signup',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/VerifyOtpRequest' } } }
        },
        responses: {
          200: { description: 'OTP verified', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/customer/signup': {
      post: {
        tags: ['Customer Auth'],
        summary: 'Create a customer account',
        description: 'Requires an OTP that was previously sent and verified. Returns a JWT for the `customerAuth` scheme.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/SignupRequest' } } }
        },
        responses: {
          201: { description: 'Account created, JWT returned', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          409: { description: 'Email already registered', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } } },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/customer/verify-email': {
      post: {
        tags: ['Customer Auth'],
        summary: 'Verify email with OTP (legacy flow)',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/VerifyOtpRequest' } } }
        },
        responses: {
          200: { description: 'Email verified, JWT returned', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/customer/resend-otp': {
      post: {
        tags: ['Customer Auth'],
        summary: 'Resend email verification OTP',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/OtpRequest' } } }
        },
        responses: {
          200: { description: 'New OTP sent', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/customer/login': {
      post: {
        tags: ['Customer Auth'],
        summary: 'Customer login',
        description: 'Returns a JWT for the `customerAuth` scheme. If the email is unverified, a 403 with requiresVerification is returned.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } }
        },
        responses: {
          200: { description: 'Login successful, JWT returned', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { description: 'Email not verified yet; requiresVerification flag set', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } } },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/customer/forgot-password': {
      post: {
        tags: ['Customer Auth'],
        summary: 'Send password reset OTP',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/OtpRequest' } } }
        },
        responses: {
          200: { description: 'Reset code sent (also returned when email does not exist, to avoid enumeration)', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/customer/reset-password': {
      post: {
        tags: ['Customer Auth'],
        summary: 'Reset customer password with OTP',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ResetPasswordRequest' } } }
        },
        responses: {
          200: { description: 'Password reset successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/customer/logout': {
      post: {
        tags: ['Customer Auth'],
        summary: 'Customer logout',
        responses: {
          200: { description: 'Logged out', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } }
        }
      }
    },
    '/api/customer/me': {
      get: {
        tags: ['Customer Auth'],
        summary: 'Get current customer profile',
        security: [{ customerAuth: [] }],
        responses: {
          200: { description: 'Current customer', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/customer/profile': {
      put: {
        tags: ['Customer Auth'],
        summary: 'Update customer profile',
        security: [{ customerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  phone: { type: 'string' },
                  avatar: { type: 'string' },
                  dateOfBirth: { type: 'string', format: 'date' },
                  address: {
                    type: 'object',
                    properties: {
                      street: { type: 'string' },
                      city: { type: 'string' },
                      state: { type: 'string' },
                      pincode: { type: 'string' },
                      country: { type: 'string' }
                    }
                  },
                  preferences: { type: 'object' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Profile updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/customer/avatar': {
      post: {
        tags: ['Customer Auth'],
        summary: 'Upload customer avatar image',
        security: [{ customerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['image'],
                properties: {
                  image: { type: 'string', format: 'binary', description: 'Image file, max 5MB' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Avatar uploaded', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/customer/check-username/{username}': {
      get: {
        tags: ['Customer Auth'],
        summary: 'Check username availability',
        parameters: [
          { name: 'username', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: {
            description: 'Username availability',
            content: {
              'application/json': {
                schema: { type: 'object', properties: { available: { type: 'boolean' } } }
              }
            }
          },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/customer/check-email/{email}': {
      get: {
        tags: ['Customer Auth'],
        summary: 'Check email availability',
        parameters: [
          { name: 'email', in: 'path', required: true, schema: { type: 'string', format: 'email' } }
        ],
        responses: {
          200: {
            description: 'Email availability',
            content: {
              'application/json': {
                schema: { type: 'object', properties: { available: { type: 'boolean' } } }
              }
            }
          },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/customer/addresses': {
      get: {
        tags: ['Customer Auth'],
        summary: 'List saved addresses',
        security: [{ customerAuth: [] }],
        responses: {
          200: {
            description: 'Saved addresses',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    addresses: { type: 'array', items: { $ref: '#/components/schemas/SavedAddress' } }
                  }
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      },
      post: {
        tags: ['Customer Auth'],
        summary: 'Add a new saved address',
        security: [{ customerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['fullName', 'phone', 'street', 'city', 'state', 'pincode'],
                properties: {
                  label: { type: 'string', default: 'Home' },
                  fullName: { type: 'string' },
                  phone: { type: 'string' },
                  street: { type: 'string' },
                  city: { type: 'string' },
                  state: { type: 'string' },
                  pincode: { type: 'string' },
                  country: { type: 'string', default: 'India' },
                  isDefault: { type: 'boolean' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Address saved', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/customer/addresses/{addressId}': {
      put: {
        tags: ['Customer Auth'],
        summary: 'Update a saved address',
        security: [{ customerAuth: [] }],
        parameters: [
          { name: 'addressId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  label: { type: 'string' },
                  fullName: { type: 'string' },
                  phone: { type: 'string' },
                  street: { type: 'string' },
                  city: { type: 'string' },
                  state: { type: 'string' },
                  pincode: { type: 'string' },
                  country: { type: 'string' },
                  isDefault: { type: 'boolean' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Address updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      },
      delete: {
        tags: ['Customer Auth'],
        summary: 'Delete a saved address',
        security: [{ customerAuth: [] }],
        parameters: [
          { name: 'addressId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Address deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/customer/addresses/{addressId}/default': {
      patch: {
        tags: ['Customer Auth'],
        summary: 'Set an address as the default',
        security: [{ customerAuth: [] }],
        parameters: [
          { name: 'addressId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Default address updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },

    // ============================ CUSTOMER CHAT ============================
    '/api/customer/chat/messages': {
      get: {
        tags: ['Customer Chat'],
        summary: 'Get chat message history for the current customer',
        security: [{ customerAuth: [] }],
        responses: {
          200: {
            description: 'Message history (max 100, ascending)',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    messages: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          _id: { type: 'string' },
                          customer: { type: 'string' },
                          content: { type: 'string' },
                          sender: { type: 'string', enum: ['customer', 'admin'] },
                          isRead: { type: 'boolean' },
                          readAt: { type: 'string', format: 'date-time', nullable: true },
                          createdAt: { type: 'string', format: 'date-time' }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/customer/chat/send': {
      post: {
        tags: ['Customer Chat'],
        summary: 'Send a chat message to the admin',
        security: [{ customerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['message'],
                properties: {
                  message: { type: 'string', maxLength: 1000, description: 'Non-empty, max 1000 characters' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Message sent', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/customer/chat/unread': {
      get: {
        tags: ['Customer Chat'],
        summary: 'Get unread admin message count',
        security: [{ customerAuth: [] }],
        responses: {
          200: {
            description: 'Unread count',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    unreadCount: { type: 'integer' }
                  }
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/customer/chat/read': {
      post: {
        tags: ['Customer Chat'],
        summary: 'Mark all admin messages as read',
        security: [{ customerAuth: [] }],
        responses: {
          200: { description: 'Messages marked as read', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },

    // ============================ CART ============================
    '/api/cart': {
      get: {
        tags: ['Cart'],
        summary: 'Get the current customer cart (creates one if missing)',
        security: [{ customerAuth: [] }],
        responses: {
          200: { description: 'Cart contents', content: { 'application/json': { schema: { $ref: '#/components/schemas/Cart' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/cart/add': {
      post: {
        tags: ['Cart'],
        summary: 'Add a gemstone to the cart',
        security: [{ customerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/AddToCartRequest' } } }
        },
        responses: {
          200: { description: 'Updated cart', content: { 'application/json': { schema: { $ref: '#/components/schemas/Cart' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/cart/update/{itemId}': {
      put: {
        tags: ['Cart'],
        summary: 'Update the quantity of a cart item',
        security: [{ customerAuth: [] }],
        parameters: [
          { name: 'itemId', in: 'path', required: true, schema: { type: 'string' }, description: 'Cart item ID' }
        ],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateQuantityRequest' } } }
        },
        responses: {
          200: { description: 'Updated cart', content: { 'application/json': { schema: { $ref: '#/components/schemas/Cart' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/cart/remove/{itemId}': {
      delete: {
        tags: ['Cart'],
        summary: 'Remove an item from the cart',
        security: [{ customerAuth: [] }],
        parameters: [
          { name: 'itemId', in: 'path', required: true, schema: { type: 'string' }, description: 'Cart item ID' }
        ],
        responses: {
          200: { description: 'Updated cart', content: { 'application/json': { schema: { $ref: '#/components/schemas/Cart' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/cart/clear': {
      delete: {
        tags: ['Cart'],
        summary: 'Clear all items from the cart',
        security: [{ customerAuth: [] }],
        responses: {
          200: { description: 'Empty cart', content: { 'application/json': { schema: { $ref: '#/components/schemas/Cart' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },

    // ============================ GEMSTONES ============================
    '/api/gemstones': {
      get: {
        tags: ['Gemstones'],
        summary: 'List gemstones',
        description: 'Public listing with optional filters (query, category, color, price range, pagination). Optional admin auth enables private fields.',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'color', in: 'query', schema: { type: 'string' } },
          { name: 'minPrice', in: 'query', schema: { type: 'number' } },
          { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'sort', in: 'query', schema: { type: 'string', description: 'Sort field, prefix with - for descending' } }
        ],
        responses: {
          200: {
            description: 'Paginated gemstone list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    count: { type: 'integer' },
                    data: {
                      type: 'object',
                      properties: {
                        gemstones: { type: 'array', items: { $ref: '#/components/schemas/Gemstone' } },
                        pagination: {
                          type: 'object',
                          properties: {
                            page: { type: 'integer' },
                            pages: { type: 'integer' },
                            total: { type: 'integer' },
                            limit: { type: 'integer' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          500: { $ref: '#/components/responses/ServerError' }
        }
      },
      post: {
        tags: ['Gemstones'],
        summary: 'Create a gemstone (admin)',
        security: [{ adminAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/GemstoneInput' } } }
        },
        responses: {
          201: { description: 'Gemstone created', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/gemstones/predefined': {
      get: {
        tags: ['Gemstones'],
        summary: 'List predefined gemstones',
        responses: {
          200: { description: 'Predefined gemstones', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/gemstones/trending': {
      get: {
        tags: ['Gemstones'],
        summary: 'List trending gemstones',
        responses: {
          200: { description: 'Trending gemstones', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/gemstones/new-arrivals': {
      get: {
        tags: ['Gemstones'],
        summary: 'List new arrival gemstones',
        responses: {
          200: { description: 'New arrivals', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/gemstones/categories': {
      get: {
        tags: ['Gemstones'],
        summary: 'List distinct active gemstone categories',
        responses: {
          200: {
            description: 'Categories',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    count: { type: 'integer' },
                    data: {
                      type: 'object',
                      properties: {
                        categories: { type: 'array', items: { type: 'string' } }
                      }
                    }
                  }
                }
              }
            }
          },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/gemstones/featured': {
      get: {
        tags: ['Gemstones'],
        summary: 'List featured gemstones',
        responses: {
          200: { description: 'Featured gemstones', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/gemstones/search/{query}': {
      get: {
        tags: ['Gemstones'],
        summary: 'Search gemstones by query string',
        parameters: [
          { name: 'query', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Search results', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/gemstones/stats/overview': {
      get: {
        tags: ['Gemstones'],
        summary: 'Get gemstone statistics overview (admin)',
        security: [{ adminAuth: [] }],
        responses: {
          200: { description: 'Stats overview', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/gemstones/{identifier}': {
      get: {
        tags: ['Gemstones'],
        summary: 'Get a single gemstone by ID or slug',
        parameters: [
          { name: 'identifier', in: 'path', required: true, schema: { type: 'string' }, description: 'MongoDB ID or slug' }
        ],
        responses: {
          200: { description: 'Gemstone details', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      },
      put: {
        tags: ['Gemstones'],
        summary: 'Update a gemstone (admin)',
        security: [{ adminAuth: [] }],
        parameters: [
          { name: 'identifier', in: 'path', required: true, schema: { type: 'string' }, description: 'MongoDB ID or slug' }
        ],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/GemstoneInput' } } }
        },
        responses: {
          200: { description: 'Gemstone updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      },
      delete: {
        tags: ['Gemstones'],
        summary: 'Delete a gemstone (admin)',
        security: [{ adminAuth: [] }],
        parameters: [
          { name: 'identifier', in: 'path', required: true, schema: { type: 'string' }, description: 'MongoDB ID or slug' }
        ],
        responses: {
          200: { description: 'Gemstone deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/gemstones/{identifier}/trending': {
      put: {
        tags: ['Gemstones'],
        summary: 'Toggle the trending flag on a gemstone (admin)',
        security: [{ adminAuth: [] }],
        parameters: [
          { name: 'identifier', in: 'path', required: true, schema: { type: 'string' }, description: 'MongoDB ID or slug' }
        ],
        responses: {
          200: { description: 'Trending flag toggled', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },

    // ============================ BUSINESS ============================
    '/api/business/info': {
      get: {
        tags: ['Business'],
        summary: 'Get public business information',
        responses: {
          200: { description: 'Business info', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          500: { $ref: '#/components/responses/ServerError' }
        }
      },
      put: {
        tags: ['Business'],
        summary: 'Update business information (admin)',
        security: [{ adminAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  tagline: { type: 'string' },
                  logo: { type: 'string' },
                  about: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Business info updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/business/contact': {
      get: {
        tags: ['Business'],
        summary: 'Get public contact information',
        responses: {
          200: { description: 'Contact info', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          500: { $ref: '#/components/responses/ServerError' }
        }
      },
      put: {
        tags: ['Business'],
        summary: 'Update contact information (admin)',
        security: [{ adminAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  phone: { type: 'string' },
                  whatsapp: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Contact info updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/business/contact-complete': {
      get: {
        tags: ['Business'],
        summary: 'Get complete contact information (public)',
        responses: {
          200: { description: 'Complete contact info', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/business/contact-form': {
      post: {
        tags: ['Business'],
        summary: 'Submit the public contact form',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ContactFormRequest' } } }
        },
        responses: {
          200: { description: 'Contact form submitted', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/business/contact-all': {
      put: {
        tags: ['Business'],
        summary: 'Update all contact details at once (admin)',
        security: [{ adminAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  phone: { type: 'string' },
                  whatsapp: { type: 'string' },
                  address: {
                    type: 'object',
                    properties: {
                      street: { type: 'string' },
                      city: { type: 'string' },
                      state: { type: 'string' },
                      pincode: { type: 'string' },
                      country: { type: 'string' },
                      googleMapsUrl: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Contact details updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/business/address': {
      put: {
        tags: ['Business'],
        summary: 'Update business address (admin)',
        security: [{ adminAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  street: { type: 'string' },
                  city: { type: 'string' },
                  state: { type: 'string' },
                  pincode: { type: 'string' },
                  country: { type: 'string' },
                  googleMapsUrl: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Address updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/business/hours': {
      put: {
        tags: ['Business'],
        summary: 'Update business hours (admin)',
        security: [{ adminAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                description: 'Business hours per day, e.g. { monday: { open: "10:00", close: "19:00" } }',
                additionalProperties: { type: 'object' }
              }
            }
          }
        },
        responses: {
          200: { description: 'Business hours updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/business/social': {
      put: {
        tags: ['Business'],
        summary: 'Update social media links (admin)',
        security: [{ adminAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  facebook: { type: 'string' },
                  instagram: { type: 'string' },
                  youtube: { type: 'string' },
                  twitter: { type: 'string' },
                  whatsapp: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Social links updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/business/certifications': {
      post: {
        tags: ['Business'],
        summary: 'Add a certification (admin)',
        security: [{ adminAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string' },
                  image: { type: 'string' },
                  validUntil: { type: 'string', format: 'date' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Certification added', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/business/certifications/{id}': {
      delete: {
        tags: ['Business'],
        summary: 'Delete a certification (admin)',
        security: [{ adminAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Certification deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/business/heritage': {
      put: {
        tags: ['Business'],
        summary: 'Update business heritage details (admin)',
        security: [{ adminAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  foundedYear: { type: 'integer', minimum: 1800 },
                  story: { type: 'string', maxLength: 1000 },
                  specialties: { type: 'array', items: { type: 'string' } }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Heritage updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/business/policies': {
      put: {
        tags: ['Business'],
        summary: 'Update business policies (admin)',
        security: [{ adminAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                description: 'Free-form policy sections, e.g. shipping, returns, privacy',
                additionalProperties: { type: 'string' }
              }
            }
          }
        },
        responses: {
          200: { description: 'Policies updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/business/seo': {
      put: {
        tags: ['Business'],
        summary: 'Update SEO settings (admin)',
        security: [{ adminAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  metaTitle: { type: 'string', maxLength: 60 },
                  metaDescription: { type: 'string', maxLength: 160 },
                  keywords: { type: 'array', items: { type: 'string' } }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'SEO settings updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/business/theme': {
      put: {
        tags: ['Business'],
        summary: 'Update theme settings (admin)',
        security: [{ adminAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  primaryColor: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' },
                  secondaryColor: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' },
                  accentColor: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Theme updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },

    // ============================ UPLOADS ============================
    '/api/upload/image': {
      post: {
        tags: ['Uploads'],
        summary: 'Upload a single image to Cloudinary (admin)',
        security: [{ adminAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['image'],
                properties: {
                  image: { type: 'string', format: 'binary', description: 'Image file, max 10MB' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Image uploaded',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    data: {
                      type: 'object',
                      properties: {
                        url: { type: 'string' },
                        publicId: { type: 'string' },
                        width: { type: 'integer' },
                        height: { type: 'integer' },
                        format: { type: 'string' },
                        bytes: { type: 'integer' }
                      }
                    }
                  }
                }
              }
            }
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/upload/images': {
      post: {
        tags: ['Uploads'],
        summary: 'Upload multiple images to Cloudinary (admin, max 10)',
        security: [{ adminAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['images'],
                properties: {
                  images: {
                    type: 'array',
                    items: { type: 'string', format: 'binary' },
                    description: 'Image files, max 10MB each, max 10 files'
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Images uploaded',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    data: {
                      type: 'object',
                      properties: {
                        images: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              url: { type: 'string' },
                              publicId: { type: 'string' },
                              width: { type: 'integer' },
                              height: { type: 'integer' },
                              format: { type: 'string' },
                              bytes: { type: 'integer' },
                              originalName: { type: 'string' }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/upload/base64': {
      post: {
        tags: ['Uploads'],
        summary: 'Upload a base64 data URI image (admin)',
        security: [{ adminAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Base64UploadRequest' } } }
        },
        responses: {
          200: { description: 'Image uploaded', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/upload/image/{publicId}': {
      delete: {
        tags: ['Uploads'],
        summary: 'Delete an image from Cloudinary (admin)',
        security: [{ adminAuth: [] }],
        parameters: [
          { name: 'publicId', in: 'path', required: true, schema: { type: 'string' }, description: 'Cloudinary public ID' }
        ],
        responses: {
          200: { description: 'Image deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/upload/transformations/{publicId}': {
      get: {
        tags: ['Uploads'],
        summary: 'Get generated transformation URLs for an image (admin)',
        security: [{ adminAuth: [] }],
        parameters: [
          { name: 'publicId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'width', in: 'query', schema: { type: 'integer' } },
          { name: 'height', in: 'query', schema: { type: 'integer' } },
          { name: 'quality', in: 'query', schema: { type: 'string', default: 'auto' } },
          { name: 'format', in: 'query', schema: { type: 'string', default: 'auto' } }
        ],
        responses: {
          200: {
            description: 'Transformation URLs',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        publicId: { type: 'string' },
                        transformations: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              name: { type: 'string', example: 'thumbnail' },
                              url: { type: 'string' }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },

    // ============================ PAYMENTS ============================
    '/api/payment/create-order': {
      post: {
        tags: ['Payments'],
        summary: 'Create a Razorpay order',
        security: [{ customerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateOrderRequest' } } }
        },
        responses: {
          200: {
            description: 'Order created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    order_id: { type: 'string' },
                    amount: { type: 'number' },
                    currency: { type: 'string', example: 'INR' }
                  }
                }
              }
            }
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/payment/verify-payment': {
      post: {
        tags: ['Payments'],
        summary: 'Verify a Razorpay payment signature',
        security: [{ customerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/VerifyPaymentRequest' } } }
        },
        responses: {
          200: { description: 'Payment verified', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },

    // ============================ AI ASSISTANT ============================
    '/api/gemstone-ai': {
      post: {
        tags: ['AI Assistant'],
        summary: 'Chat with the Kohinoor AI gemstone assistant',
        description: 'Multi-turn conversation with memory per session. Rate limited to 30 requests/hour/IP.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/AIRequest' } } }
        },
        responses: {
          200: {
            description: 'AI reply with suggested gemstones',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    response: { type: 'string' },
                    suggestedGemstones: { type: 'array', items: { $ref: '#/components/schemas/Gemstone' } },
                    extractedParams: { type: 'object' },
                    mood: { type: 'string' },
                    conversationLength: { type: 'integer' },
                    timestamp: { type: 'string', format: 'date-time' }
                  }
                }
              }
            }
          },
          400: { $ref: '#/components/responses/BadRequest' },
          429: { description: 'Rate limit exceeded', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } } },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/gemstone-ai/status': {
      get: {
        tags: ['AI Assistant'],
        summary: 'Get AI assistant provider status',
        responses: {
          200: {
            description: 'AI status',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'active' },
                    provider: { type: 'string', nullable: true },
                    model: { type: 'string', nullable: true },
                    persona: { type: 'string' },
                    features: { type: 'array', items: { type: 'string' } },
                    sessionTimeout: { type: 'string' }
                  }
                }
              }
            }
          },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/gemstone-ai/reset': {
      post: {
        tags: ['AI Assistant'],
        summary: 'Reset a conversation session',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  sessionId: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Conversation reset', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } }
        }
      }
    },
    '/api/gemstone-ai/clear-all': {
      post: {
        tags: ['AI Assistant'],
        summary: 'Clear all conversation sessions (dev/admin use)',
        responses: {
          200: { description: 'All sessions cleared', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } }
        }
      }
    }
  }
};