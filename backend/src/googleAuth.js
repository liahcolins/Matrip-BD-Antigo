// googleAuth.js (DESATIVADO TEMPORARIAMENTE)

const passport = require('passport');

// Estratégia Google desativada temporariamente
// para permitir que o servidor rode sem GOOGLE_CLIENT_ID

passport.initialize = () => (req, res, next) => next();

module.exports = passport;