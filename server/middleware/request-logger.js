function safeJson(obj) {
  try {
    return JSON.stringify(obj);
  } catch (e) {
    return JSON.stringify({ error: 'non-serializable log payload' });
  }
}

module.exports = function requestLogger() {
  return function requestLoggerMiddleware(req, res, next) {
    const start = Date.now();
    const requestId = req.headers['x-request-id'] || `req_${Math.random().toString(36).slice(2, 10)}`;
    req.requestId = requestId;
    res.setHeader('x-request-id', requestId);

    res.on('finish', () => {
      const ms = Date.now() - start;
      const payload = {
        ts: new Date().toISOString(),
        requestId,
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        ms,
        ip: req.ip,
      };
      // Keep it simple: stdout is usually captured by hosting providers.
      console.log(safeJson(payload));
    });

    next();
  };
};

