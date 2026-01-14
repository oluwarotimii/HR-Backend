"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cors_1 = require("cors");
var dotenv_1 = require("dotenv");
var helmet_1 = require("helmet");
var morgan_1 = require("morgan");
var database_1 = require("./config/database");
var auth_route_1 = require("./api/auth.route");
var role_route_1 = require("./api/role.route");
var user_route_1 = require("./api/user.route");
var staff_route_1 = require("./api/staff.route");
var form_route_1 = require("./api/form.route");
var form_submission_route_1 = require("./api/form-submission.route");
// Load environment variables
dotenv_1.default.config();
var app = (0, express_1.default)();
var PORT = process.env.PORT || 3000;
// Middleware
app.use((0, helmet_1.default)()); // Security headers
app.use((0, cors_1.default)()); // Enable cross-origin requests
app.use((0, morgan_1.default)('combined')); // HTTP request logging
app.use(express_1.default.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express_1.default.urlencoded({ extended: true })); // Parse URL-encoded bodies
// Test database connection when server starts
(0, database_1.testConnection)();
// Routes
app.use('/api/auth', auth_route_1.default);
app.use('/api/roles', role_route_1.default);
app.use('/api/users', user_route_1.default);
app.use('/api/staff', staff_route_1.default);
app.use('/api/forms', form_route_1.default);
app.use('/api/form-submissions', form_submission_route_1.default);
// Basic route
app.get('/', function (req, res) {
    res.json({
        message: 'Welcome to the HR Management System API',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});
// Health check endpoint
app.get('/health', function (req, res) {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
// 404 handler
app.use('*', function (req, res) {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl
    });
});
// Error handling middleware
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});
app.listen(PORT, function () {
    console.log("HR Management System server is running on port ".concat(PORT));
    console.log("Environment: ".concat(process.env.NODE_ENV || 'development'));
});
exports.default = app;
