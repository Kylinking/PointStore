'use strict';
let util = require('../../../../util/util');
let express = require('express');
let router = express.Router();
let moment = require('moment')
const Op = require('sequelize').Op;

router.get('/statistics/shop',async (req,res)=>{
    let logger = res.locals.logger;
    let operateShopID = res.locals.shopid;
    let type = req.query.type || null;
    let startDate = req.query.start || null;
    let endDate = req.query.end || null;
    let db = res.locals.db;
    let duration = util.makeNumericValue(req.query.recent,7);
    let queryShopID = util.makeNumericValue(req.query.shopid,null);
    let now = Date.parse(moment().format());
    let today = Date.parse(moment().format("MM DD YYYY"));
    endDate = Date.parse(moment(endDate).format("MM DD YYYY"));
    startDate = Date.parse(moment(startDate).format("MM DD YYYY"));
    if (isNaN(endDate) && isNaN(startDate)) {
        endDate = Date.parse(moment().format());
        startDate = Date.parse(moment().subtract(7, 'days').format("MM DD YYYY"));
    } else if (isNaN(endDate) && !isNaN(startDate)) {
        endDate = Date.parse(moment(startDate).add(30, 'days').format("MM DD YYYY"));
    } else if (!isNaN(endDate) && isNaN(startDate)) {
        startDate = Date.parse(moment(endDate).subtract(30, 'days').format("MM DD YYYY"));
    } else {
        if (endDate < startDate) {
            [endDate, startDate] = [startDate, endDate];
        }
    }
    logger.info(`startDate:${startDate},endDate:${endDate},queryShopID:${queryShopID}`);
    // 默认展示七日内的新增数据
    // duration == 'recent7','recent30','months'
    // type == customer,customed,bounus,recommend
    


});









// error 
router.use('/customerhistory', (req, res) => {
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