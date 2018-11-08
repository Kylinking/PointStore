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
                  ShopId: res.locals.shopid
                }
            });
            if (operatedShop){
                if(operatedShop.Status != 1){
                    res.json({
                        Error: {
                            Message: `店面状态异常，无权操作。Status:${operatedShop.Status}`
                        }
                    }).end();
                    return;
                }
            }else{
                res.json({
                    Error: {
                        Message: "店面不存在"
                    }
                }).end();
                return;
            }
        } catch (error) {
            logger.error(error);
            res.json({
                Error: {
                    Message: "Token 无效"
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
            if (reply == null) {
                next(new Error("登录失效"));
            } else {
                next();
            }
        } catch (error) {
            res.json({
                Error: {
                    Message: "系统错误，请联系系统管理员。Redis Error!\n" + error.message
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
    var queryShopId,phone,queryType,page,pageSize,age;
    logger.info(req.method);
    if (req.method == 'GET'){
        logger.info(req.query);
        queryShopId = req.query.ShopId || null;
        phone = req.query.Phone|| null;
        queryType = req.query.Type|| null;
        page = req.query.Page|| null;
        pageSize = req.query.Size|| null;
        age = req.query.Age|| null;
    }else{
        logger.info(req.body);
        queryShopId = req.body.ShopId|| null;
        phone = req.body.Phone|| null;
        queryType = req.body.Type|| null;
        page = req.body.Page|| null;
        pageSize = req.body.Size|| null;
        age = req.body.Age|| null;
    }
    logger.info(`queryShopId:${queryShopId},phone:${phone},queryType:${queryType}`);
    if (queryShopId!=null && isNaN(util.checkInt(queryShopId))){
        logger.info(`queryShopId 不能转换为Number`);
        res.json({Error:{Message:`queryShopId:${queryShopId}不能转换为Number`}}).end();
        return;
    }
    if (queryType!=null && isNaN(util.checkInt(queryType))){
        logger.info(`queryType 不能转换为Number`);
        res.json({Error:{Message:`queryType:${queryType}不能转换为Number`}}).end();
        return;
    }
    if (phone!=null && isNaN(util.checkPhone(phone))){
        //
        //res.json({Error:{Message:`phone:${phone}不是有效电话号码`}}).end();
        if(String(phone).length <3){
            logger.info(`phone:${phone},error: 号码过短`);
            res.json({Error:{Message:"号码过短"}}).end();
        }
        else 
        {
            logger.info(`phone 不是有效电话号码`);
            res.json({Error:{Message:`phone:${phone}不是有效电话号码`}}).end();
            
        }
        return;
    }
    if (page!=null && isNaN(util.checkInt(page))){
        logger.info(`page 不能转换为Number`);
        res.json({Error:{Message:`page:${page}不能转换为Number`}}).end();
        return;
    }
    if (pageSize!=null && isNaN(util.checkInt(pageSize))){
        logger.info(`pageSize 不能转换为Number`);
        res.json({Error:{Message:`pageSize:${pageSize}不能转换为Number`}}).end();
        return;
    }
    if (age!=null && isNaN(util.checkInt(age))){
        logger.info(`age 不能转换为Number`);
        res.json({Error:{Message:`age:${age}不能转换为Number`}}).end();
        return;
    }
    next();
}
,apis);


router.use((err, req, res, next) => {
    res.locals.logger.error(err.message);
    res.json({
        Error: {
            Message: err.message
        }
    }).end();
})

module.exports = router;
