export function notFoundHandler(req, _res, next) {
  const err = new Error(`Not Found: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
}

export function errorHandler(err, _req, res, _next) {
  let status = Number(err.statusCode || 500);

  const isMongooseConnectivityError =
    err?.name === "MongooseServerSelectionError" ||
    err?.name === "MongoServerSelectionError" ||
    /ECONNREFUSED|failed to connect|Server selection timed out/i.test(
      String(err?.message || "")
    );

  if (isMongooseConnectivityError) {
    status = 503;
  }

  const message =
    status === 500 && process.env.NODE_ENV === "production"
      ? "Internal Server Error"
      : String(err.message || "Error");

  res.status(status).json({ message });
}
