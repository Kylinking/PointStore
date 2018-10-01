'use strict';
let util = require('../../../../util/util');
let express = require('express');
let router = express.Router();
let moment = require('moment')
const Op = require('sequelize').Op;

router.get('/customerhistory', async (req, res) => {
    let logger = res.locals.logger;
    let operateShopId = res.locals.shopid;
    let phone = isNaN(util.checkPhone(req.query.Phone))?null:req.query.Phone
    let page = util.makeNumericValue(req.query.Page,1);
    let pageSize = util.makeNumericValue(req.query.Size,20);
    let offset = (page - 1) * pageSize;
    let type = req.query.Type || null;
    let startDate = req.query.Start || null;
    let endDate = req.query.end || null;
    let db = res.locals.db;
    const duration = moment.duration(30, "days");
    if (phone == null){
        res.json({Error:{Message:"客户手机号码不能为空"}}).end()
        return;
    }
    logger.info(`startDate:${startDate},endDate:${endDate},phone:${phone}`);
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
    let customer = await db.CustomerInfo.findOne({
        where:{
            Phone:phone
        }
    });
    if (!customer){
        res.json({
            Data:{}
        }).end()
        return;
    }

    
    let role = await util.getRoleAsync(operateShopId);
    logger.info(role);
    if (role == 'normal') {
        if (customer.ShopId != operateShopId) {
            res.json({
                Error: {
                    Message: "无权限查询其它分店客户明细"
                }
            }).end();
            return;
        }
    } else if (role == "admin") {
        if (!await util.isSubordinateAsync(operateShopId,customer.ShopId)) {
            res.json({
                Error: {
                    Message: "无权限查询其它总店下客户明细"
                }
            }).end();
            return;
        }
        whereObj.CustomerId = customer.CustomerId;
        whereObj.ShopId = customer.ShopId;
    } 
    whereObj.CustomerId = customer.CustomerId;
    //whereObj.ShopId = customer.ShopId;
    logger.info(whereObj);
    let include = [{
        model:db.ShopInfo,
        where:{}
    },{
        model:db.CustomerInfo,
        where:{}
    }];
    let instance = await db.CustomerAccountChange.findAndCountAll({
        where: whereObj,
        include: include,
        limit: pageSize,
        offset: offset
    });

    if (instance) {
        let data = [];
        instance.rows.forEach(ele => {
            ele.dataValues.Date = moment(ele.Date).format("YYYY-MM-DDTHH:mm:ss");
            data.push(ele);
        })
        let pages = Math.ceil(instance.count / pageSize);
        res.json({
            Data: data,
            Meta: {
                Pages: pages,
                Size: pageSize,
                TotalRows: instance.count
            }
        }).end();
    } else {
        res.json({
            Data: []
        }).end();
    }
});

// error 
router.use('/customerhistory', (req, res) => {
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