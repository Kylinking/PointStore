'use strict';
var express = require('express');
var router = express.Router();

router.get('/v1/shops',(req,res,next)=>{
    var shopInfo = res.locals.db.ShopInfo;
    var logger = res.locals.logger;
    if (req.query != {}){
        var shopID = req.query.ShopID || '';
        var phone = req.query.Phone || '';
        logger.info(shopID);
        if (shopID == '' && phone == ''){
            res.end();
        }else if (shopID!=''){
            shopInfo.findOne({where:{ShopID:shopID}}).then(info=>{
                if (info == null){
                    logger.warn(shopID + ": 分店不存在");
                    res.json({error:{message:"分店不存在"}}).end();
                }else {
                    //logger.info(info);
                    res.json({data:info.dataValues}).end();
                }
            })
        }else{
            shopInfo.findOne({where:{Phone:phone}}).then(info=>{
                if (info == null){
                    logger.warn(shopID + ": 分店不存在");
                    res.json({error:{message:"分店不存在"}}).end();
                }else {
                    //logger.info(info);
                    res.json({data:info.dataValues}).end();
                }
            })
        }
    }else{
        //res.end();
        res.end();
    }
    
})

module.exports = router;