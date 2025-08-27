import { NODE_ENV } from "../config/env.js";
const errorMiddleware = (err, req, res, next) => {
  let status = 500;
  let message = "Internal Server Error";

  // Postgres / DB errors
  if (err.code === "ECONNREFUSED") {
    status = 503;
    message = "Database unavailable";
  } else if (err.code === "23503") {
    status = 400;
    message = "Invalid foreign key reference";
  } else if (err.code === "42P01") {
    status = 500;
    message = "Missing table or bad SQL";
  }

  // Custom app errors
  if (err.status) status = err.status;
  if (err.message) message = err.message;

  res.status(status).json({
    success: false,
    error: message,
    detail: NODE_ENV === "development" ? err.stack : undefined,
  });
  next();
};

export default errorMiddleware;
