/**
 * Lightweight standard cookie parser middleware for Express
 * Parses the incoming Cookie request header and populates req.cookies
 */
const cookieParser = (req, res, next) => {
  const cookieHeader = req.headers.cookie;
  req.cookies = {};

  if (cookieHeader) {
    const rawCookies = cookieHeader.split(";");
    for (let i = 0; i < rawCookies.length; i++) {
      const cookie = rawCookies[i].trim();
      const separatorIndex = cookie.indexOf("=");
      if (separatorIndex !== -1) {
        const name = cookie.substring(0, separatorIndex).trim();
        const value = cookie.substring(separatorIndex + 1).trim();
        if (name) {
          try {
            req.cookies[name] = decodeURIComponent(value);
          } catch {
            req.cookies[name] = value;
          }
        }
      }
    }
  }

  next();
};

module.exports = cookieParser;

