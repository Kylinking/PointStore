'use strict';
let util = require('../../../../util/util');
let express = require('express');
let router = express.Router();
let moment = require('moment')
const Op = require('sequelize').Op;

router.get('/customerhistory', async (req, res) => {
    let logger = res.locals.logger;
    let operateShopId = res.locals.shopid;
    let phone = isNaN(util.checkPhone(req.query.Phone)) ? null : req.query.Phone
    let page = util.makeNumericValue(req.query.Page, 1);
    let pageSize = util.makeNumericValue(req.query.Size, 20);
    let offset = (page - 1) * pageSize;
    let type = req.query.Type || null;
    let startDate = req.query.Start || null;
    let endDate = req.query.end || null;
    let db = res.locals.db;
    let queryShopId = util.makeNumericValue(req.query.ShopId, null);
    const duration = moment.duration(30, "days");
    if (phone == null) {
        res.json({
            Error: {
                Message: "客户手机号码不能为空"
            }
        }).end()
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
    let operateShop = await db.ShopInfo.findOne({
        where:{
            ShopId:operateShopId
        }
    });
    let whereCustomer = {
        Phone: phone
    };
    switch (operateShop.Type) {
        case 0:
            break;
        case 1:
            whereCustomer.ShopId = operateShopId;
            break;
        default:
            whereCustomer.ShopId = operateShop.ParentShopId;
            break;
    }

    let customer = await db.CustomerInfo.findOne({
        where: whereCustomer
    });
    
    if (!customer) {
        res.json({
            Object: {}
        }).end()
        return;
    }
    
    whereObj.CustomerId = customer.CustomerId;
    if (queryShopId != null){
        whereObj.ShopId = queryShopId;
    }
    //whereObj.ShopId = customer.ShopId;
    logger.info(whereObj);
    let include = [{
        model: db.ShopInfo,
        where: {}
    }, {
        model: db.CustomerInfo,
        where: {}
    }];
    let instance = await db.CustomerAccountChange.findAndCountAll({
        where: whereObj,
        include: include,
        limit: pageSize,
        offset: offset,
        order:[['id','DESC']]
    });

    if (instance) {
        let data = [];
        instance.rows.forEach(ele => {
            ele.Date = new Date(ele.Date);
            data.push(ele);
        })
        let pages = Math.ceil(instance.count / pageSize);
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
                PageSize: 0,
                TotalPages: 0,
                CurrentRows: 0,
                TotalRows: 0,
                CurrentPage: 1
            }
        }).end();
    }
});

// error 
router.use('/customerhistory', (req, res) => {
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