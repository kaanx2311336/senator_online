const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Auth middleware logic here
  next();
};
