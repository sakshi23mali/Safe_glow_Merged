export function requestLogger(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    const line = `${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`;
    console.log(line);
  });
  next();
}

