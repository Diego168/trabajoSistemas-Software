class AppError extends Error { constructor(msg, status, code) { super(msg); this.status = status; this.code = code; } }
class ValidationError extends AppError { constructor(m, details) { super(m, 400, "VALIDATION"); this.details = details; } }
class UnauthorizedError extends AppError { constructor(m = "No autorizado") { super(m, 401, "UNAUTHORIZED"); } }
class ForbiddenError extends AppError { constructor(m = "Tu rol no permite esta acción") { super(m, 403, "FORBIDDEN"); } }
class TooManyRequestsError extends AppError { constructor(m) { super(m, 429, "TOO_MANY"); } }
class NotFoundError extends AppError { constructor(m = "Recurso no encontrado") { super(m, 404, "NOT_FOUND"); } }
class ConflictError extends AppError { constructor(m) { super(m, 409, "CONFLICT"); } }
class PayloadTooLargeError extends AppError { constructor() { super("Cuerpo demasiado grande", 413, "TOO_LARGE"); } }
module.exports = { AppError, ValidationError, UnauthorizedError, ForbiddenError, TooManyRequestsError, NotFoundError, ConflictError, PayloadTooLargeError };
