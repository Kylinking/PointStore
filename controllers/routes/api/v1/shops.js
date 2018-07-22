'use strict';
var express = require('express');
var router = express.Router();
const Op = require('sequelize').Op;
router.get('/v1/shops', async (req, res, next) => {
    var shopInfo = res.locals.db.ShopInfo;
    var logger = res.locals.logger;
    if (!req.query) {
        res.end('hello');
    } else {
        logger.info(req.query);
        var shopID = req.query.ShopID || '';
        var phone = req.query.Phone || '';
        if (shopID == '' && phone == '') {
            logger.info("返回所有Shop信息列表");
            var json = {
                data: []
            };
            //无ShopID和Phone则返回所有分店信息，默认按20条分页，返回字段增加Pages表示总页数，Size表示每页条数
            var page =  parseInt(req.query.Page || 1);
            var pageSize = parseInt(req.query.Size || 20);
            var offset = (page-1) * pageSize;
            var pages = Math.ceil(await shopInfo.count() / pageSize);
            if (page > pages){
                logger.warn("查询分页溢出");
                json["Pages"] = Math.ceil(pages);
                json["Size"] = pageSize;
                json["Message"] = "查询分页溢出";
                res.json(json).end();
                return;
            }
            shopInfo.findAll({
                    limit : pageSize,
                    offset : offset
                })
                .then(results => {
                    results.forEach(result => {
                        json.data.push(result);
                    });
                    json["Pages"] = Math.ceil(pages);
                    json["Size"] = pageSize;
                    res.json(json).end();
                })
        } else if (shopID != '') {
            shopInfo.findOne({
                where: {
                    ShopID: shopID
                }
            }).then(info => {
                if (info == null) {
                    logger.warn(shopID + ": 分店不存在");
                    res.json({
                        error: {
                            message: "分店不存在"
                        }
                    }).end();
                } else {
                    res.json({
                        data: [info.dataValues]
                    }).end();
                }
            })
        } else {
            shopInfo.findOne({
                where: {
                    Phone: phone
                }
            }).then(info => {
                if (info == null) {
                    logger.warn(shopID + ": 分店不存在");
                    res.json({
                        error: {
                            message: "分店不存在"
                        }
                    }).end();
                } else {
                    res.json({
                        data: [info.dataValues]
                    }).end();
                }
            })
        }
    }
});

router.delete('/v1/shops', async (req, res,next) => {
    var shopInfo = res.locals.db.ShopInfo;
    var logger = res.locals.logger;
    var shopID = req.query.ShopID || '';
    var phone = req.query.Phone || '';
    if (shopID == '' && phone == '') {
        res.json({
            error: {
                Message: "未指定店面。"
            }
        }).end();
    } else {
        var instance = await shopInfo.findOne({
            where:{
                [Op.or]: [
                    {
                        ShopID:shopID
                    },
                    {
                      Phone:phone
                    }
                  ]
            }
        });
        if(instance){
            //console.log(instance);
            if(instance.dataValues.Status == 0){
                res.json({error:{Message:"该店面已注销"}}).end();
                return;
            }
        }
        if (shopID != '') {
            shopInfo.update({
                Status: 0
            }, {
                where: {
                    ShopID: shopID
                },
            }).then((count, row) => {
                logger.info(count + " rows affected.\t" + row);
                res.end();
            })
        } else {
            shopInfo.update({
                Status: 0
            }, {
                where: {
                    Phone: phone
                }
            }).then((count, row) => {
                res.end();
            })
        }
    }
});

router.post('/v1/shops',(req,res,next)=>{
    var shopInfo = res.locals.db.ShopInfo;
    var logger = res.locals.logger;
    var shopID = req.body.ShopID || '';
    var phone = req.body.Phone || '';
    var status = req.body.Status || '';
    var name = req.body.Status || '';
    var address = req.body.Address || '';
    [shopID,phone,status,name,address].forEach(elem=>{
        if (elem == ''){
            res.json({error:{Message:"ShopID,Phone,Name,Address,Status不能为空！"}});
            return;
        }
    })
    shopInfo.create({
        ShopID:shopID,
        Name:name,
        Address:address,
        Status:parseInt(status),
        Phone:phone
    }).then(()=>{
        res.json({data:{ShopID:shopID,
            Name:name,
            Address:address,
            Status:parseInt(status),
            Phone:phone}}).end();
    },error=>{
        res.json({error:{Message:error}}).end();
    });
});


router.use('/v1/shops', (req, res) => {
    res.status(401);
    res.json({
        error: {
            message: "No Service with " + req.method
        }
    }).end();
})
module.exports = router;