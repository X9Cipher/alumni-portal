"use strict";
// Migration script to clear existing data and set up database collections
// Run this once to prepare your database for the new implementation
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
const mongodb_1 = require("../lib/mongodb");
// Load environment variables
dotenv.config({ path: '.env.local' });
async function migrate() {
    try {
        console.log('Starting database migration...');
        const db = await (0, mongodb_1.getDatabase)();
        // Clear existing collections (removes all mock data)
        console.log('Clearing existing jobs...');
        await db.collection('jobs').deleteMany({});
        console.log('Clearing existing events...');
        await db.collection('events').deleteMany({});
        // Create indexes for better performance
        console.log('Creating database indexes...');
        // Jobs collection indexes
        await db.collection('jobs').createIndex({ createdAt: -1 });
        await db.collection('jobs').createIndex({ isActive: 1 });
        await db.collection('jobs').createIndex({ type: 1 });
        await db.collection('jobs').createIndex({ 'postedBy._id': 1 });
        // Events collection indexes
        await db.collection('events').createIndex({ createdAt: -1 });
        await db.collection('events').createIndex({ isActive: 1 });
        await db.collection('events').createIndex({ isPublic: 1 });
        await db.collection('events').createIndex({ date: 1 });
        await db.collection('events').createIndex({ type: 1 });
        await db.collection('events').createIndex({ 'organizer._id': 1 });
        console.log('✅ Migration completed successfully!');
        console.log('Your database is now ready to store jobs and events persistently.');
        console.log('You can now create new jobs and events through your application.');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}
migrate();
