/**
 * Zero-dependency Cookie Parser Middleware for Express
 * Parses req.headers.cookie into req.cookies object
 */
const cookieParser = (req, res, next) => {
  req.cookies = req.cookies || {};
  const cookieHeader = req.headers.cookie;

  if (cookieHeader) {
    cookieHeader.split(';').forEach((cookie) => {
      const parts = cookie.split('=');
      const name = parts[0].trim();
      const value = parts.slice(1).join('=').trim();
      if (name) {
        try {
          req.cookies[name] = decodeURIComponent(value);
        } catch {
          req.cookies[name] = value;
        }
      }
    });
  }

  next();
};

module.exports = cookieParser;
