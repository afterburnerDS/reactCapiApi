'use strict';
exports.DATABASE_URL =
    process.env.DATABASE_URL ||
    global.DATABASE_URL ||
    'mongodb://127.0.0.1:27017/recipes';
exports.PORT = process.env.PORT || 3006;
exports.JWT_SECRET = process.env.JWT_SECRET || 'daniel';
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d'; 