const dotenv = require('dotenv');
dotenv.config();

const dbType = process.env.DATABASE_TYPE || 'mongodb';

let dbManager;

if (dbType === 'mongodb') {
    const MongoDBManager = require('./mongodb/MongoDBManager');
    dbManager = new MongoDBManager();
} else if (dbType === 'postgresql') {
    const PostgreSQLManager = require('./postgresql/PostgreSQLManager');
    dbManager = new PostgreSQLManager();
} else {
    throw new Error(`Unknown DATABASE_TYPE: ${dbType}. Must be 'mongodb' or 'postgresql'`);
}


module.exports = dbManager;