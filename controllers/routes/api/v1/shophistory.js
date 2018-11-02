'use strict';
let util = require('../../../../util/util');
let express = require('express');
let router = express.Router();
let moment = require('moment')
const Op = require('sequelize').Op;

router.get('/shophistory', async (req, res) => {
    let logger = res.locals.logger;
    let operateShopId = res.locals.shopid;
    let queryShopId = util.makeNumericValue(req.query.ShopId,null);
    let page = util.makeNumericValue(req.query.Page,1);
    let pageSize = util.makeNumericValue(req.query.Size,20);
    let offset = (page - 1) * pageSize;
    let type = req.query.Type || null;
    let startDate = req.query.Start || null;
    let endDate = req.query.end || null;
    let db = res.locals.db;
    const duration = moment.duration(30, "days");
    logger.info(`startDate:${startDate},endDate:${endDate},queryShopId:${queryShopId}`);
    endDate = Date.parse(moment(endDate).format("MM DD YYYY"));
    startDate = Date.parse(moment(startDate).format("MM DD YYYY"));
    if (isNaN(endDate) && isNaN(startDate)) {
        endDate = Date.parse(moment().format());
        startDate = Date.parse(moment().subtract(30, 'days').format("MM DD YYYY"));
    } else if (isNaN(endDate) && !isNaN(startDate)) {
        endDate = Date.parse(moment(startDate).add(30, 'days').format("MM DD YYYY"));
    } else if (!isNaN(endDate) && isNaN(startDate)) {
        startDate = Date.parse(moment(endDate).subtract(30, 'days').format("MM DD YYYY"));
    } else {
        if (endDate < startDate) {
            [endDate, startDate] = [startDate, endDate];
        }
    }
    logger.info(`startDate:${startDate},endDate:${endDate}`);
    let whereObj = {
        Date: {
            [Op.gte]: startDate,
            [Op.lte]: endDate
        }
    };
    let include = [];
    let role = await util.getRoleAsync(operateShopId);
    logger.info(role);
    if (role == 'normal') {
        if (queryShopId != null && queryShopId != operateShopId) {
            res.json({
                Error: {
                    Message: "无权查询其它店面明细"
                }
            }).end();
            return;
        }
        whereObj.ShopId = operateShopId;
    } else if (role == "admin") {
        if (queryShopId != null && !await util.isSubordinateAsync(operateShopId, queryShopId)) {
            res.json({
                Error: {
                    Message: "无权查询其它总店下店面明细"
                }
            }).end();
            return;
        }
        if (queryShopId == null) {
            include.push({
                model: db.ShopInfo,
                where: {
                    ParentShopId: operateShopId
                }
            })
        }
        if (queryShopId != null) {
            whereObj.ShopId = queryShopId;
        }
    } else if (role == 'superman') {
        if (await util.isAdminShopAsync(queryShopId)) {
            include.push({
                model: db.ShopInfo,
                where: {
                    ParentShopId: queryShopId
                }
            })
        } else if (queryShopId != operateShopId && queryShopId != null) {
            whereObj.ShopId = queryShopId;
        }
    }
    logger.info(whereObj);
    logger.info(include);
    let instance = await db.ShopAccountChange.findAndCountAll({
        where: whereObj,
        include: include,
        limit: pageSize,
        offset: offset
    });

    if (instance) {
        let data = [];
        instance.rows.forEach(ele => {
            ele = ele.toJSON();
            ele.Date = new Date(ele.Date);
            data.push(util.ConvertObj2Result(ele));
        })
        let pages = Math.ceil(instance.count / pageSize);
        res.json({
            Array: data,
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
            Array: [],
            Meta:{
                PageSize:pageSize,
                    TotalPages: 0,
                    CurrentRows: 0,
                    TotalRows:0,
                    CurrentPage:page
            }
        }).end();
    }
});

// error 
router.use('/shophistory', (req, res) => {
    res.json({
        Error: {
            Message: "无此服务： " + req.method
        }
    }).end();
})

router.use((req, res, next) => {
    next();
})
module.exports = router;