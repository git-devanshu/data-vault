const express = require('express');
const { checkAuthorization } = require('../middlewares/checkAuthorization');
const { checkAdminRole } = require('../middlewares/checkAdminAccess');
const { getAllUsers, blockUserAccess, unblockUserAccess } = require('../controllers/adminControllersV1');

// endpoint prefix : /api/admin
const adminRouter = express.Router();

// ---------- v1 routes ----------

adminRouter.get('/v1/users', checkAuthorization, checkAdminRole, getAllUsers);
adminRouter.post('/v1/block-user', checkAuthorization, checkAdminRole, blockUserAccess);
adminRouter.post('/v1/unblock-user', checkAuthorization, checkAdminRole, unblockUserAccess);

module.exports = {adminRouter};
