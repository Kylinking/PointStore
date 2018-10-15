'use strict';
let express = require('express');
let util = require('../../../../util/util');
let router = express.Router();
const Op = require('sequelize').Op;

router.get('/shoppoints', async (req, res) => {
    let db = res.locals.db;
    let logger = res.locals.logger;
    let operateShopId = res.locals.shopid;
    let queryType = util.makeNumericValue(req.query.Type, 0);
    let queryShopId = util.makeNumericValue(req.query.ShopId, null);
    let page = util.makeNumericValue(req.query.Page, 1);
    let pageSize = util.makeNumericValue(req.query.Size, 20);
    let offset = (page - 1) * pageSize;
    logger.info(`queryShopId:${queryShopId},page:${page}`);
    let whereObj = {};
    let includeObj = {
        model: db.ShopInfo,
        require: true,
    }
    let operateShop = await util.getShopByIdAsync(operateShopId);
    let queryShop;
    if (queryShopId != null) {
        queryShop = await util.getShopByIdAsync(queryShopId);
        if (!queryShop) {
            res.json({
                Error: {
                    Message: `该店面不存在。ShopId:${queryShopId}`
                }
            }).end()
            return;
        }
    }
    if (operateShop.Type == 0) {
        if (queryShopId == operateShopId) {
            whereObj.ShopId = operateShopId;
        }
        if (queryShopId == null) {

        } else if (queryShop.Type == 1) {
            if (queryType == 0) {
                whereObj.ShopId = queryShopId;
            } else {
                includeObj.where = {
                    ParentShopId: queryShopId,
                };
            }
        }else{
            whereObj.ShopId = queryShopId;
        }
    } else if (operateShop.Type == 1) {
        if (queryShop && ((queryShop.Type == 2 && queryShop.ParentShopId != operateShopId) ||
                (queryShop.Type == 1 && queryShopId != operateShopId) ||
                queryShop.Type == 0)) {
            res.json({
                Error: {
                    Message: `无权限查询该店面账户信息.ShopId:${queryShopId}`
                }
            }).end();
            return;
        }
        if (queryShopId == null) {
            includeObj.where = {
                ParentShopId: operateShopId,
            };
        } else {
            whereObj.ShopId = queryShopId;
        }
    } else {
        if (queryShopId != null && queryShopId != operateShopId) {
            res.json({
                Error: {
                    Message: `无权限查询该店面账户信息.ShopId:${queryShopId}`
                }
            }).end();
            return;
        }
        whereObj.ShopId = operateShopId;
    }
    try {
        logger.info(whereObj);
        logger.info(includeObj);
        let instance = await db.ShopAccountInfo.findAndCountAll({
            where: whereObj,
            include: [includeObj],
            limit: pageSize,
            offset: offset
        });
        if (instance) {
            let data = [];
            let rootRate = await util.getBounusRateByIdAsync(1);
            let adminRate;
            if (operateShop.Type == 0) {
                adminRate = null;
            } else {
                adminRate = queryShop ? await util.getBounusRateByIdAsync(queryShop) :
                    await util.getBounusRateByIdAsync(operateShop.ParentShopId);
            }
            for (let ele of instance.rows) {
                let rate = await util.getBounusRateByIdAsync(ele.ShopId);
                logger.info(`${ele.Id}:${rate.dataValues.PointToMoneyRate}`);

                if (rate) {
                    switch (rate.Level) {
                        case 0:
                            rate = rootRate;
                            break;
                        case 1:
                            rate = adminRate != null ? adminRate : await util.getBounusRateByIdAsync((await util.getShopByIdAsync(ele.ShopId)).ParentShopId);
                            break;
                        default:
                            break;
                    }
                    let tmpShop = await util.getShopByIdAsync(ele.ShopId);
                    logger.error(tmpShop.ParentShopId);                 
                        if (tmpShop.Type == 2){
                            logger.info(`tmpShop.ParentShopId:${tmpShop.ParentShopId}`);
                            let t = await util.getBounusRateByIdAsync(tmpShop.ParentShopId);
                            logger.error(t.PointToMoneyRate);
                            rate.PointToMoneyRate = t.PointToMoneyRate;
                        }
                        logger.info(`${ele.Id}:${tmpShop.ShopId}:${rate.dataValues.PointToMoneyRate}`)
                        ele.dataValues.BounusPointRate =  rate.dataValues; 
                        
                        logger.error(ele.ShopId);
                        logger.info("yyyyy");   
                        
                        logger.info("Xxxxxxxxxxxxxxxxxxxxxxxxx");   
                        logger.info(ele.dataValues);
                        data.push(ele.dataValues);
                        rate.dataValues = {};
                }
            }
            let pages = Math.ceil(instance.count / pageSize);
            logger.info("============="); 
            logger.info(data);
            res.json({
                Array: data,
                Meta: {
                    PageSize: pageSize,
                    TotalPages: pages,
                    CurrentRows: instance.rows.length,
                    TotalRows: instance.count,
                    CurrentPage: page
                }
            }).end();
        } else {
            res.json({
                Array: [],
                Meta: {
                    PageSize: pageSize,
                    TotalPages: 0,
                    CurrentRows: 0,
                    TotalRows: 0,
                    CurrentPage: page
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
        return;
    }
});

// error 
router.use('/shoppoints', (req, res) => {
    res.json({
        Error: {
            Message: "无此服务：" + req.method
        }
    }).end();
})

router.use((req, res, next) => {
    next();
})
module.exports = router;