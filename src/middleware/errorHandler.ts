import { Request, Response, NextFunction } from "express";

/**
 * Middleware function to handle requests to undefined routes.
 * 
 * Sets the HTTP response status to 404 and sends a "Bad request" message.
 * 
 * @param req - The Express Request object.
 * @param res - The Express Response object.
 * @param next - The Express NextFunction callback.
 */
export function handleNoRoute(req: Request, res: Response, next: NextFunction) {
    res.status(404).send("Bad request");
}
