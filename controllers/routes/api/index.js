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
const util = require("../../../util/util");


// Auto push routes into array apis, .js files in the vX folder will be treated as routes;  
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
        let logger = res.locals.logger;
        res.locals.logger.info("header token :" + token);
        let decoded = null;
        try {
            decoded = jwt.decode(token, jwtSecret);
            res.locals.logger.info(decoded);
            res.locals.shopid = decoded.shopid;
            logger.info(res.locals.shopid);
            var operatedShop = await res.locals.db.ShopInfo.findOne({
                where: {
                  ShopID: res.locals.shopid
                }
            });
            if (operatedShop){
                if(operatedShop.Status != 1){
                    res.json({
                        error: {
                            message: `店面状态异常，无权操作。Status:${operatedShop.Status}`
                        }
                    }).end();
                    return;
                }
            }else{
                res.json({
                    error: {
                        message: "店面不存在"
                    }
                }).end();
                return;
            }
        } catch (error) {
            logger.error(error);
            res.json({
                error: {
                    message: "Token 无效"
                }
            }).end();
            return;
        }
        try {
            const {
                promisify
            } = require('util');
            const getAsync = promisify(redisClient.get).bind(redisClient);
            var reply = await getAsync(decoded.shopid);
            console.log("replay: " + reply);
            if (reply == null) {
                next(new Error("登录失效"));
            } else {
                next();
            }
        } catch (error) {
            res.json({
                error: {
                    message: "系统错误，请联系系统管理员。Redis Error!\n" + error.message
                }
            }).end();
            return;
        }
    }
)

// Check numeric data validation and route to apis
router.use('/' + version,
(req,res,next)=>{
    var logger = res.locals.logger;
    var queryShopID,phone,queryType,page,pageSize,age;
    logger.info(req.method);
    if (req.method == 'GET'){
        queryShopID = req.query.shopid || null;
        phone = req.query.phone|| null;
        queryType = req.query.type|| null;
        page = req.query.page|| null;
        pageSize = req.query.size|| null;
        age = req.query.age|| null;
    }else{
        queryShopID = req.body.shopid|| null;
        phone = req.body.phone|| null;
        queryType = req.body.type|| null;
        page = req.body.page|| null;
        pageSize = req.body.size|| null;
        age = req.body.age|| null;
    }
    logger.info(`queryShopID:${queryShopID},phone:${phone},queryType:${queryType}`);
    if (queryShopID!=null && isNaN(util.checkInt(queryShopID))){
        logger.info(`queryShopID 不能转换为Number`);
        res.json({error:{message:`queryShopID:${queryShopID}不能转换为Number`}}).end();
        return;
    }
    if (queryType!=null && isNaN(util.checkInt(queryType))){
        logger.info(`queryType 不能转换为Number`);
        res.json({error:{message:`queryType:${queryType}不能转换为Number`}}).end();
        return;
    }
    if (phone!=null && isNaN(util.checkPhone(phone))){
        logger.info(`phone 不是有效电话号码`);
        res.json({error:{message:`phone:${phone}不是有效电话号码`}}).end();
        return;
    }
    if (page!=null && isNaN(util.checkInt(page))){
        logger.info(`page 不能转换为Number`);
        res.json({error:{message:`page:${page}不能转换为Number`}}).end();
        return;
    }
    if (pageSize!=null && isNaN(util.checkInt(pageSize))){
        logger.info(`pageSize 不能转换为Number`);
        res.json({error:{message:`pageSize:${pageSize}不能转换为Number`}}).end();
        return;
    }
    if (age!=null && isNaN(util.checkInt(age))){
        logger.info(`age 不能转换为Number`);
        res.json({error:{message:`age:${age}不能转换为Number`}}).end();
        return;
    }
    next();
}
,apis);


router.use((err, req, res, next) => {
    res.json({
        error: {
            message: err.message
        }
    }).end();
})

module.exports = router;
