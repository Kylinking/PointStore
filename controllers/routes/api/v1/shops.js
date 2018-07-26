'use strict';
var express = require('express');
var router = express.Router();
const Op = require('sequelize').Op;
//TODO: add role control!

router.get('/shops', async (req, res, next) => {
    var operateShopID = res.locals.ShopID ;
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
            var page = parseInt(req.query.Page || 1);
            var pageSize = parseInt(req.query.Size || 20);
            var offset = (page - 1) * pageSize;
            var pages = Math.ceil(await shopInfo.count() / pageSize);
            if (page > pages) {
                logger.warn("查询分页溢出");
                json["Pages"] = Math.ceil(pages);
                json["Size"] = pageSize;
                json["Message"] = "查询分页溢出";
                res.json(json).end();
                return;
            }
            shopInfo.findAll({
                    limit: pageSize,
                    offset: offset
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

router.delete('/shops', async (req, res, next) => {
    var operateShopID = res.locals.ShopID ;
    var shopInfo = res.locals.db.ShopInfo;
    var logger = res.locals.logger;
    var shopID = req.body.ShopID || '';
    var phone = req.body.Phone || '';
    if (shopID == '' && phone == '') {
        res.json({
            error: {
                message: "未指定店面。"
            }
        }).end();
    } else {
        if (shopID != ''){
            var instance = await shopInfo.findOne({
                where: {
                    ShopID: shopID
                }
            });
        }else {
            var instance = await shopInfo.findOne({
                where: {
                    Phone: phone
                }
            });
        }
        
        if (instance) {
            if (instance.dataValues.Status == 0) {
                res.json({
                    error: {
                        message: "该店面已注销"
                    }
                }).end();
                return;
            }
            if (shopID != '') {
                shopInfo.update({
                    Status: 0
                }, {
                    where: {
                        ShopID: shopID
                    },
                }).then(() => {
                    res.json({
                        data: {
                            ShopID: instance.dataValues.ShopID,
                            Name: instance.dataValues.Name,
                            Address: instance.dataValues.Address,
                            Status: 0,
                            Phone: instance.dataValues.Phone
                        }
                    }).end();
                },(err)=>{
                    res.json({error:{message:err}}).end();
                })
            } else {
                shopInfo.update({
                    Status: 0
                }, {
                    where: {
                        Phone: phone
                    }
                }).then(() => {
                    res.json({
                        data: {
                            ShopID: instance.dataValues.ShopID,
                            Name: instance.dataValues.Name,
                            Address: instance.dataValues.Address,
                            Status: 0,
                            Phone: instance.dataValues.Phone
                        }
                    }).end();
                })
            }
        } else {
            res.json({
                error: {
                    message: "店面不存在"
                }
            }).end();
        }
    }
});

router.post('/shops', (req, res, next) => {
    var operateShopID = res.locals.ShopID ;
    var shopInfo = res.locals.db.ShopInfo;
    var logger = res.locals.logger;
    var phone = req.body.Phone || '';
    var status = req.body.Status || '';
    var name = req.body.Name || '';
    var address = req.body.Address || '';
    logger.info('enter post /shops');
    [phone, status, name, address].forEach(elem => {
        if (elem == '') {
            res.json({
                error: {
                    message: "Phone,Name,Address,Status不能为空！"
                }
            });
            return;
        }
    })
    shopInfo.create({
        Name: name,
        Address: address,
        Status: parseInt(status),
        Phone: phone
    }).then((row) => {
        res.json({
            data: {
                ShopID: row.dataValues.ShopID,
                Name: name,
                Address: address,
                Status: parseInt(status),
                Phone: phone
            }
        }).end();
    }, error => {
        res.json({
            error: {
                message: error
            }
        }).end();
    });
});

router.patch('/shops',async (req, res, next)=>{
    var operateShopID = res.locals.ShopID ;
    var shopInfo = res.locals.db.ShopInfo;
    var logger = res.locals.logger;
    var shopID = req.body.ShopID || '';
    var phone = req.body.Phone || '';
    var status = req.body.Status || '';
    var name = req.body.Name || '';
    var address = req.body.Address || '';

    if (shopID == '' && phone == '') {
        res.json({
            error: {
                message: "未指定店面。"
            }
        }).end();
    } else {
        if (shopID != ''){
            var instance = await shopInfo.findOne({
                where: {
                    ShopID: shopID
                }
            });
        }else {
            var instance = await shopInfo.findOne({
                where: {
                    Phone: phone
                }
            });
        }
        if (instance){
            if (status){
                instance.set('Status',parseInt(status));
            }
            if (name){
                instance.set("Name",name);
            }
            if (address){
                instance.set("Address",address);
            }
            instance.save().then(()=>{
                res.json({
                    data: {
                        ShopID: instance.dataValues.ShopID,
                        Name: instance.dataValues.Name,
                        Address: instance.dataValues.Address,
                        Status: instance.dataValues.Status,
                        Phone: instance.dataValues.Phone
                    }
                }).end();
            },(err)=>{
                res.json({error:{message:err}}).end();
            });
        }else{
            res.json({
                error: {
                    message: "店面不存在"
                }
            }).end();
        }
    }
});

// error 
router.use('/shops', (req, res) => {
    res.status(404);
    res.json({
        error: {
            message: "Not Found. \nNo Service with " + req.method
        }
    }).end();
})

router.use((req, res, next) => {
    next();
})


module.exports = router;