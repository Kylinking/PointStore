'use strict';

var express = require('express');
var router = express.Router();
var path = require('path');
var jwt = require('jwt-simple');
var jwtSecret = require('../../../config/global.json').jwtSecret;
var fs = require('fs');
var basename = path.basename(__filename);
var apis = [];
const version = 'v1';

fs
    .readdirSync(path.join(__dirname, version))
    .filter(file => {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.endsWith('.js'));
    })
    .forEach(file => {
        file = file.substring(0, file.lastIndexOf('.'));
        apis.push(require(path.join(__dirname, version, file)));
    });

// router.use('/', (req, res, next) => {
//     var apiFile = path.join(__dirname, req.path);
//     if (apiFile.endsWith('\\')) {
//         apiFile = apiFile.substring(0, apiFile.length - 1);
//     }
//     apiFile += '.js';
//     if (!fs.existsSync(apiFile)) {
//         res.status(404).json({
//             error: {
//                 message: "404 找不到该服务。"
//             }
//         }).end();
//     } else {
//         next();
//     }
// });

//Check authentication and expire time
router.use('/' + version,
    async function Authentication(req, res, next) {
        let token = req.header('TOKEN');
        let redisClient = res.locals.redisClient;
        res.locals.logger.info("header token :" + token);
        var decoded = jwt.decode(token, jwtSecret);
        res.locals.logger.info(decoded);
        res.locals.ShopID = decoded.ShopID;
        const {
            promisify
        } = require('util');
        const getAsync = promisify(redisClient.get).bind(redisClient);
        var reply = await getAsync(decoded.ShopID);
        console.log("replay: " + reply);
        if (reply == null) {
            next(new Error("登录失效"));
        } else {
            next();
        }
    },
    apis
)

router.use((err, req, res, next) => {
    //res.status(err.status || 500);
    res.json({
        error: {
            message: err.message
        }
    }).end();
})

module.exports = router;
