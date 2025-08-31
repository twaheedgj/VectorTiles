// middleware/error.js
import { NODE_ENV } from "../config/env.js";
import crypto from "node:crypto";

function mapPgToHttp(err) {
  // Default
  let status = 500;
  let message = "Internal Server Error";

  // Connection/infra
  if (["ECONNREFUSED", "ECONNRESET", "08006"].includes(err.code)) {
    return { status: 503, message: "Database unavailable" };
  }
  if (err.code === "ETIMEDOUT" || err.code === "57014") {
    return { status: 504, message: "Database query timeout" };
  }
  if (err.code === "53300") return { status: 503, message: "Too many DB connections" };

  // SQL / schema
  if (err.code === "42601") return { status: 500, message: "SQL syntax error" };
  if (err.code === "42P01") return { status: 500, message: "Missing table or bad SQL" };
  if (err.code === "42703") return { status: 500, message: "Invalid column in SQL" };
  if (err.code === "23503") return { status: 400, message: "Invalid foreign key reference" };
  if (err.code === "23505") return { status: 409, message: "Duplicate key" };
  if (err.code === "22P02") return { status: 400, message: "Invalid input format" };
  if (err.code === "22003") return { status: 400, message: "Numeric out of range" };

  // PostGIS (often surfaces as XX000 with text in message)
  if (err.code === "XX000") {
    const msg = String(err.message || "");
    if (msg.includes("lwcollection_construct: mixed dimension"))
      return { status: 422, message: "Geometry dimension mismatch (force 2D / extract lines)" };
    if (msg.match(/TopologyException|GEOS|Self-intersection/i))
      return { status: 422, message: "Invalid geometry topology" };
    if (msg.match(/invalid polygon|ring self-intersection/i))
      return { status: 422, message: "Invalid polygon geometry" };
  }

  // Fallback
  return { status, message };
}

const errorMiddleware = (err, req, res, next) => {
  const id = crypto.randomUUID();
  const tileCtx = req.params?.z && req.params?.x && req.params?.y
    ? { z: req.params.z, x: req.params.x, y: req.params.y }
    : undefined;

  // Base from mapper
  let { status, message } = mapPgToHttp(err);

  // Allow controllers to override
  if (err.status) status = err.status;
  if (err.publicMessage) message = err.publicMessage;
  else if (err.message && NODE_ENV === "development") message = err.message;

  // Build payload
  const payload = {
    success: false,
    error: message,
    code: err.code,
    id,
    layer: err.layer,          // set in controllers: err.layer = 'streams' | 'ponds' | ...
    meta: { ...tileCtx, ...err.meta }
  };
  if (NODE_ENV === "development") {
    payload.detail = err.detail;
    payload.hint = err.hint;
    payload.where = err.where;
    payload.stack = err.stack;
  }

  // Log once, return JSON
  console.error(`[${id}]`, {
    path: req.path,
    method: req.method,
    status,
    code: err.code,
    message: err.message,
    layer: err.layer,
    meta: payload.meta
  });

  res.status(status)
    .set("Cache-Control", "no-store")
    .json(payload);
};

export default errorMiddleware;
