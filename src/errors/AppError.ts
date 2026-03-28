export class AppError extends Error {
    public readonly statusCode: number;
    public readonly details?: unknown

    constructor(message: string, status: number, details?: unknown) {
        super(message);
        this.statusCode = status;
        this.details = details;
        this.name = "AppError";
    }
}
