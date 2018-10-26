'use strict';

const Sequelize = require('sequelize');
const mysqlConfig = require('../config/global.json').database.mysql;
const redisConfig = require('../config/global.json').database.redis;
var redis = require("redis"),
    client = redis.createClient({
        host: redisConfig.host
    });

var fs = require('fs');
var path = require('path');
var basename = path.basename(__filename);
var db = {};
// if you'd like to select database 3, instead of 0 (default), call
// client.select(3, function() { /* ... */ });

client.on("error", function (err) {
    console.log("Error " + err);
});
try{
var sequelize = new Sequelize(mysqlConfig.db, mysqlConfig.username, mysqlConfig.password, {
    host: mysqlConfig.host,
    dialect: mysqlConfig.dialect,
    timezone: '+08:00',
});
}catch(error){
    console.log(error);
}

fs  .readdirSync(__dirname)
    .filter(file => {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    })
    .forEach(file => {
        var model = sequelize['import'](path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});
db.sequelize = sequelize;
db.Sequelize = Sequelize;
module.exports = {
    db:db,
    sequelize: sequelize,
    Sequelize: Sequelize,
    redisClient: client
}