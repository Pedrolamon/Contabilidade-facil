import express, { Request, Response } from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

// Middleware to verify JWT token
export function authenticateToken (req: Request, res: Response, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    (req as any).user = user;
    next();
  });
};

// Middleware to check permissions
export function checkPermission (requiredRole: string) {
  return (req: Request, res: Response, next: any) => {
    const user = (req as any).user;
    const roleHierarchy: { [key: string]: number } = { user: 1, manager: 2, admin: 3 };

    if (roleHierarchy[user.role] < roleHierarchy[requiredRole]) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

