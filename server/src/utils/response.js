'use strict';

/**
 * Chuẩn hoá response thành công.
 * @param {import('express').Response} res
 * @param {any} data
 * @param {string} [message]
 * @param {number} [statusCode=200]
 */
function sendSuccess(res, data, message = 'Thành công.', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

/**
 * Chuẩn hoá response lỗi nghiệp vụ (SP trả Code = -1).
 * @param {import('express').Response} res
 * @param {string} message
 * @param {number} [statusCode=400]
 */
function sendError(res, message, statusCode = 400) {
  return res.status(statusCode).json({
    success: false,
    message,
  });
}

module.exports = { sendSuccess, sendError };
