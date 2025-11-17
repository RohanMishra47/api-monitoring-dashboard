// Extend the Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        // Add other user properties you need
      };
    }
  }
}

export {};
// This file is used to extend the Express Request type to include a user property
// so that it can be accessed in the authMiddleware and other parts of the application.
