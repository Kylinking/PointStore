const Sequelize = require('sequelize');
const mysqlConfig = require('../config/global.json').database.mysql;
const redisConfig =  require('../config/global.json').database.redis;
var redis = require("redis"),
    client = redis.createClient({
        host:redisConfig.host
    });

// if you'd like to select database 3, instead of 0 (default), call
// client.select(3, function() { /* ... */ });

client.on("error", function (err) {
    console.log("Error " + err);
});

var sequelize = new Sequelize(mysqlConfig.db, mysqlConfig.username, mysqlConfig.password, {
    host: mysqlConfig.host,
    dialect: mysqlConfig.dialect,
});

module.exports = {
    sequelize:sequelize,
    redisClient:client
}