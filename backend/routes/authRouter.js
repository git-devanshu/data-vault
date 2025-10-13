const express = require('express');
const {checkAuthorization} = require('../middlewares/checkAuthorization');
const {checkEmailAvailability, registerUser, loginUser, verifyPin, saveSettings, fetchUserSettings, verifyPassKey, resetPassword, verifyUser, resetSecurityPin, newRecoveryKey, checkEmailExists} = require('../controllers/authControllersV1');

// endpoint prefix : /api/auth
const authRouter = express.Router();

// ---------- v1 routes ----------

authRouter.post('/v1/check-email', checkEmailAvailability);
authRouter.post('/v1/register', registerUser);

authRouter.post('/v1/login', loginUser);

authRouter.post('/v1/verify-pin', checkAuthorization, verifyPin);

authRouter.get('/v1/settings', checkAuthorization, fetchUserSettings);
authRouter.post('/v1/settings', checkAuthorization, saveSettings);

authRouter.post('/v1/check-email-exists', checkEmailExists);
authRouter.post('/v1/verify-passkey', verifyPassKey);
authRouter.post('/v1/reset-password', resetPassword);

authRouter.post('/v1/verify-user', checkAuthorization, verifyUser);
authRouter.post('/v1/reset-pin', checkAuthorization, resetSecurityPin);

authRouter.post('/v1/new-passkey', checkAuthorization, newRecoveryKey);

module.exports = {authRouter};
