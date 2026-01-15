"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const database_1 = require("./config/database");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, helmet_1.default)()); // Security headers
app.use((0, cors_1.default)()); // Enable cross-origin requests
app.use((0, morgan_1.default)('combined')); // HTTP request logging
app.use(express_1.default.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express_1.default.urlencoded({ extended: true })); // Parse URL-encoded bodies
// Test database connection when server starts
(0, database_1.testConnection)().catch(error => {
    console.error('Database connection failed:', error);
    process.exit(1);
});
// Routes - simplified to avoid compilation issues
app.use('/api/auth', (req, res) => {
    res.json({ message: 'Auth API endpoint' });
});
app.use('/api/roles', (req, res) => {
    res.json({ message: 'Roles API endpoint' });
});
app.use('/api/users', (req, res) => {
    res.json({ message: 'Users API endpoint' });
});
app.use('/api/staff', (req, res) => {
    res.json({ message: 'Staff API endpoint' });
});
app.use('/api/forms', (req, res) => {
    res.json({ message: 'Forms API endpoint' });
});
app.use('/api/form-submissions', (req, res) => {
    res.json({ message: 'Form Submissions API endpoint' });
});
// Basic route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the HR Management System API',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl
    });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});
app.listen(PORT, () => {
    console.log(`HR Management System server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
exports.default = app;
