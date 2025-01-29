import { Request, Response, NextFunction } from "express";

/**
 * Middleware function to log HTTP requests and their responses.
 * 
 * Logs the HTTP method and URL of incoming requests, and upon completion,
 * logs the method, URL, and response status code.
 * 
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 * @param next - The next middleware function in the stack.
 */
export function logRequest(req: Request, res: Response, next: NextFunction) {
    console.log(req.method + " " + req.url);
    res.on("finish", () => {
        console.log(`${req.method} ${req.url} -> ${res.statusCode}`);
    });
    next();
}
