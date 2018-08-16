'use strict';
var util = require('../../../../util/util');
var express = require('express');
var router = express.Router();
var moment = require('moment')
const Op = require('sequelize').Op;

router.get('/shophistory', async (req, res) => {
    let logger = res.locals.logger;
    let operateShopID = res.locals.ShopID;
    let queryShopID = util.checkInt(req.query.ShopID) || null;
    let page = util.checkInt(req.query.Page) || 1;
    let pageSize = util.checkInt(req.query.Size) || 20;
    let offset = (page - 1) * pageSize;
    let type = req.query.Type || null;
    let startDate = req.query.Start || null;
    let endDate = req.query.End || null;
    let db = res.locals.db;
    const duration = moment.duration(30, "days");
    logger.info(`startDate:${startDate},endDate:${endDate}`);
    endDate = Date.parse(moment(endDate).format("MM DD YYYY"));
    startDate = Date.parse(moment(startDate).format("MM DD YYYY"));

    logger.info(`startDate:${moment(startDate).format("MM DD YYYY")},endDate:${moment(endDate).format("MM DD YYYY")}`);
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
    let role = await util.getRoleAsync(operateShopID);
    logger.info(role);
    if (role == 'normal') {
        if (queryShopID != null && queryShopID != operateShopID) {
            res.json({
                error: {
                    message: "无权查询其它店面明细"
                }
            }).end();
            return;
        }
        whereObj.ShopID = operateShopID;
    } else if (role == "admin") {
        if (queryShopID != null && !await util.isSubordinateAsync(operateShopID, queryShopID)) {
            res.json({
                error: {
                    message: "无权查询其它总店下店面明细"
                }
            }).end();
            return;
        }
        if (queryShopID == null) {
            include.push({
                model: db.ShopInfo,
                where: {
                    ParentShopID: operateShopID
                }
            })
        }
        if (queryShopID != null) {
            whereObj.ShopID = queryShopID;
        }
    } else if (role == 'superman') {
        if (await util.isAdminShopAsync(queryShopID)) {
            include.push({
                model: db.ShopInfo,
                where: {
                    ParentShopID: queryShopID
                }
            })
        } else if (queryShopID != operateShopID && queryShopID != null) {
            whereObj.ShopID = queryShopID;
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
            ele.dataValues.Date = moment(ele.Date).format('YYYY-MM-DD hh:mm:ss a');
            data.push(ele);
        })
        let pages = Math.ceil(instance.count / pageSize);
        res.json({
            data: data,
            Pages: pages,
            Size: pageSize
        }).end();
    } else {
        res.json({
            data: []
        }).end();
    }
});



// error 
router.use('/shophistory', (req, res) => {
    res.status(400);
    res.json({
        error: {
            message: "No Service with " + req.method
        }
    }).end();
})

router.use((req, res, next) => {
    next();
})
module.exports = router;