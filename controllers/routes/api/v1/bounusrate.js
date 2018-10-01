'use strict';
let util = require('../../../../util/util');
let express = require('express');
let router = express.Router();
let moment = require('moment')
const Op = require('sequelize').Op;

router.get('/bounusrate', async (req, res) => {
    let logger = res.locals.logger;
    logger.info(`GET bounusrate`);
    let operateShopId = res.locals.shopid;
    let db = res.locals.db;
    let queryShopId = util.makeNumericValue(req.query.ShopId, null);
    let page = util.makeNumericValue(req.query.Page, 1);
    let pageSize = util.makeNumericValue(req.query.Size, 20);
    let offset = (page - 1) * pageSize;
    let role = await util.getRoleAsync(operateShopId);
    logger.info(`queryShopId:${queryShopId},page:${page},role:${role}`);
    try {
        let whereObj = {};
        let includeObj = {
            model: db.ShopInfo,
            require: true,
        }
        if (role === "normal" ){
            if (queryShopId !=null && operateShopId !== queryShopId) {
                throw "无权查询其它店面信息";
            }
            whereObj.ShopId = operateShopId;
        }else if (role === "admin"){
            if (queryShopId !=null  && !util.isSubordinateAsync(operateShopId,queryShopId)){
                throw "无权查询其它总店下店面信息";
            }
            if (queryShopId == null){
                includeObj.where = {
                    ParentShopId: operateShopId,
                }
            }else{
                whereObj.ShopId = queryShopId;
            }
        }else{
            if (queryShopId == null){
                
            }else if (queryShopId === operateShopId){
                whereObj.ShopId = queryShopId;
            }else if (await util.isAdminShopAsync(queryShopId)){
                includeObj.where = {[Op.or]:
                    [
                       {ParentShopId: queryShopId},
                       {ShopId: queryShopId}
                    ]};
            }
        }
        let instance = await db.BounusPointRate.findAndCountAll({
            where:whereObj,
            include:[includeObj],
            limit: pageSize,
            offset: offset
        });
        if (instance) {
            let data = [];
            instance.rows.forEach(ele => {
                data.push(ele);
            })
            let pages = Math.ceil(instance.count / pageSize);
            res.json({
                Data: data,
                Meta:{
                    PageSize:pageSize,
                    TotalPages: pages,
                    CurrentRows: instance.rows.length,
                    TotalRows:instance.count,
                    CurrentPage:page
                }
                
            }).end();
        } else {
            res.json({
                Data: [],
                Meta:{
                    PageSize:pageSize,
                    TotalPages: 0,
                    CurrentRows:0,
                    TotalRows:0,
                    CurrentPage:page
                }
            }).end();
        }
    } catch (error) {
        logger.error(error);
        res.json({
            Error: {
                Message: error
            }
        }).end();
    }
});

router.post('/bounusrate', async (req, res) => {

})







// error 
router.use('/bounusrate', (req, res) => {
    res.status(400);
    res.json({
        Error: {
            Message: "No Service with " + req.method
        }
    }).end();
})

router.use((req, res, next) => {
    next();
})
module.exports = router;