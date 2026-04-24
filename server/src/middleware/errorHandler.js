'use strict';

/**
 * Global error handler middleware.
 * Catches any error thrown or passed to next() throughout the app.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const message = err.message || 'Lỗi server nội bộ.';

  if (process.env.NODE_ENV !== 'production') {
    console.error('[ERROR]', err);
  }

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

module.exports = errorHandler;
