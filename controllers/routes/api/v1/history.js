'use strict';
var util = require('../../../../util/util');
var express = require('express');
var router = express.Router();
var moment = require('moment')
const Op = require('sequelize').Op;

router.use('/shops',(req,res,next)=>{
    var logger = res.locals.logger;
    var queryShopID,phone,queryType,page,pageSize,age;
    logger.info(req.method);
    if (req.method == 'GET'){
        queryShopID = req.query.ShopID;
        phone = req.query.Phone;
        queryType = req.query.Type;
        page = req.query.Page;
        pageSize = req.query.Size;
        age = req.query.Age;
    }else{
        queryShopID = req.body.ShopID;
        phone = req.body.Phone;
        queryType = req.body.Type;
        page = req.body.Page;
        pageSize = req.body.Size;
        age = req.body.Age;
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
    if (phone!=null && isNaN(util.checkInt(phone))){
        logger.info(`phone 不能转换为Number`);
        res.json({error:{message:`phone:${phone}不能转换为Number`}}).end();
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
});


router.get('/history',async (req,res)=>{
    var logger = res.locals.logger;
    var operateShopID = res.locals.ShopID;
    var queryShopID = req.query.ShopID || null;
    var phone = req.query.Phone || null;
    var page = util.checkInt(req.query.Page) || 1;
    var pageSize = util.checkInt(req.query.Size) || 20;
    var offset = (page - 1) * pageSize;
    var type = req.query.Type || null;

    var endDate = Date.parse(moment(req.query.End).format("MM DD YYYY"));
    var startDate = Date.parse(moment(req.query.Start).format("MM DD YYYY"));
    
    if (isNaN(endDate) && isNaN(startDate)){
        endDate = Date.parse(moment().format("MM DD YYYY"));
        startDate = Date.parse(moment().subtract(30,'days').format("MM DD YYYY"));
    }else if(isNaN(endDate)){

    }




});






















// error 
router.use('/shoppoints', (req, res) => {
    res.status(404);
    res.json({
        error: {
            message: "Not Found. \nNo Service with " + req.method
        }
    }).end();
})

router.use((req, res, next) => {
    next();
})
module.exports = router;