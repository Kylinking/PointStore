'use strict';
let util = require('../../../../util/util');
let express = require('express');
let router = express.Router();
let moment = require('moment')
const Op = require('sequelize').Op;

router.get('/statistics/shop',async (req,res)=>{
    let logger = res.locals.logger;
    logger.info('statistics start');
    let operateShopID = res.locals.shopid;
    let type = req.query.Type || null;
    let startDate = req.query.Start || null;
    let endDate = req.query.end || null;
    let db = res.locals.db;
    let duration = util.makeNumericValue(req.query.recent,7);
    let queryShopID = util.makeNumericValue(req.query.ShopId,null);
    let now = Date.parse(moment().format());
    let today = Date.parse(moment().format("MM DD YYYY"));
    endDate = Date.parse(moment(endDate).format("MM DD YYYY"));
    startDate = Date.parse(moment(startDate).format("MM DD YYYY"));
    if (isNaN(endDate) && isNaN(startDate)) {
        endDate = Date.parse(moment().format());
        startDate = Date.parse(moment().subtract(duration, 'days').format("MM DD YYYY"));
    } else if (isNaN(endDate) && !isNaN(startDate)) {
        endDate = Date.parse(moment(startDate).add(duration, 'days').format("MM DD YYYY"));
    } else if (!isNaN(endDate) && isNaN(startDate)) {
        startDate = Date.parse(moment(endDate).subtract(duration, 'days').format("MM DD YYYY"));
    } else {
        if (endDate < startDate) {
            [endDate, startDate] = [startDate, endDate];
        }
    }
    logger.info(`startDate:${startDate},endDate:${endDate},queryShopID:${queryShopID},duration:${duration}`);

    let role = await util.getRoleAsync(operateShopID);
    // 默认展示七日内的新增数据
    // duration == 'recent7','recent30','months'
    // type == customer,customed,bounus,recommend
    
    // 新增用户数
    let newCustomers = 0;
    let accumulateCustomedPoints = 0;
    let accumulateBounusPoints = 0;
    let accumulaterecommendPoints = 0;
    
    let whereObj = {};
    let include = [];
    if (role === 'normal'){
        if (queryShopID != null && queryShopID != operateShopID){
            res.json({Error:{Message:'无权查询其它店面统计信息。'}}).end();
            return;
        }
        whereObj.ShopID = operateShopID;
        newCustomers = await db.CustomerInfo.count({
            where:{
                createdAt:{
                   [Op.between]:[
                    moment(startDate).format("YYYY-MM-DD HH:mm:ss"),
                    moment(endDate).format("YYYY-MM-DD HH:mm:ss")
                   ]
                },
                ShopID:operateShopID
            }
        });
        logger.info(`${moment(startDate).format("YYYY-MM-DD HH:mm:ss")}至${moment(endDate).format("YYYY-MM-DD HH:mm:ss")}有${newCustomers}位新增客户`)
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