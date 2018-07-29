'use strict';
var util = require('../../../../util/util');
var express = require('express');
var router = express.Router();
const Op = require('sequelize').Op;
//TODO: add role control!

router.get('/shops', async (req, res, next) => {
    var operateShopID = res.locals.ShopID;
    var shopInfo = res.locals.db.ShopInfo;
    var logger = res.locals.logger;
    var queryShopID = req.query.ShopID || '';
    var queryType = req.query.Type || 0;
    var phone = req.query.Phone || '';


    if (util.isSuperman(operateShopID)) {
        var json = {
            data: []
        };
        var whereObj = {};
        if (queryType == 0) {
            if (queryShopID != '') {
                whereObj.ParentShopID = queryShopID;
            } else {
                whereObj.ParentShopID = operateShopID;
            }
        } else {
            if (queryShopID != '') {
                whereObj.ShopID = queryShopID;
            }
        }
        if (phone != '') {
            whereObj.Phone = phone;
        }
        var page = parseInt(req.query.Page || 1);
        var pageSize = parseInt(req.query.Size || 20);
        var offset = (page - 1) * pageSize;
        var pages = Math.ceil(await shopInfo.count({
                where: whereObj
            }) / pageSize);
        if (page > pages) {
            logger.warn("查询分页溢出");
            json["Pages"] = Math.ceil(pages);
            json["Size"] = pageSize;
            json["Message"] = "查询分页溢出";
            res.json(json).end();
            return;
        }
        shopInfo.findAll({
            where: whereObj,
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
    } else if (util.isAdminShop(operateShopID)) {
        if (queryShopID == '' && phone == '') {
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
                    where: {
                        ParentShopID: operateShopID
                    },
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
        } else { // !queryShopID == '' && phone == ''
            var whereObj = {
                ParentShopID: operateShopID
            };
            if (queryShopID != '') {
                whereObj.ShopID = queryShopID;
            }
            if (phone != '') {
                whereObj.Phone = phone;
            }
            shopInfo.findOne({
                where: whereObj
            }).then(info => {
                if (info == null) {
                    logger.warn(queryShopID + ": 分店不存在");
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
            });
        }
    } else { //!分店
        if (queryShopID != '' && queryShopID != operateShopID) {
            res.json({
                error: {
                    message: "无权限查询其它分店."
                }
            }).end();
            return;
        } else {
            var whereObj = {
                ShopID: operateShopID
            };
            if (phone != '') {
                whereObj.Phone = phone;
            }
            shopInfo.findOne({
                where: whereObj
            }).then(info => {
                if (info == null) {
                    logger.warn(queryShopID + ": 分店不存在");
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
            });
        }
    }
});

router.delete('/shops', async (req, res, next) => {
    var operateShopID = res.locals.ShopID;
    if (!util.isAdminShop(operateShopID)) {
        res.json({
            error: {
                message: "该用户无权关闭店面"
            }
        }).end();
        return;
    }
    var shopInfo = res.locals.db.ShopInfo;
    var logger = res.locals.logger;
    var queryShopID = req.body.ShopID || '';
    var phone = req.body.Phone || '';
    if (queryShopID == '' && phone == '') {
        res.json({
            error: {
                message: "未指定店面。"
            }
        }).end();
    } else {
        if (queryShopID != '') {
            var instance = await shopInfo.findOne({
                where: {
                    ShopID: queryShopID
                }
            });
        } else {
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
            if (queryShopID != '') {
                shopInfo.update({
                    Status: 0
                }, {
                    where: {
                        ShopID: queryShopID
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
                }, (err) => {
                    res.json({
                        error: {
                            message: err
                        }
                    }).end();
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
    var operateShopID = res.locals.ShopID;
    if (!util.isAdminShop(operateShopID)) {
        res.json({
            error: {
                message: "该用户无权新建分店"
            }
        }).end();
        return;
    }
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

router.patch('/shops', async (req, res, next) => {
    var operateShopID = res.locals.ShopID;
    if (!util.isAdminShop(operateShopID) &&
        !util.isSuperman(operateShopID)) {
        res.json({
            error: {
                message: "该用户无权修改分店信息"
            }
        }).end();
        return;
    }
    var shopInfo = res.locals.db.ShopInfo;
    var logger = res.locals.logger;
    var queryShopID = req.body.ShopID || '';
    var phone = req.body.Phone || '';
    var status = req.body.Status || '';
    var name = req.body.Name || '';
    var address = req.body.Address || '';

    if (queryShopID == '' && phone == '') {
        res.json({
            error: {
                message: "未指定店面。"
            }
        }).end();
    } else {
        if (queryShopID != '') {
            var instance = await shopInfo.findOne({
                where: {
                    ShopID: queryShopID
                }
            });
        } else {
            var instance = await shopInfo.findOne({
                where: {
                    Phone: phone
                }
            });
        }
        if (instance) {
            if (status) {
                instance.set('Status', parseInt(status));
            }
            if (name) {
                instance.set("Name", name);
            }
            if (address) {
                instance.set("Address", address);
            }
            instance.save().then(() => {
                res.json({
                    data: {
                        ShopID: instance.dataValues.ShopID,
                        Name: instance.dataValues.Name,
                        Address: instance.dataValues.Address,
                        Status: instance.dataValues.Status,
                        Phone: instance.dataValues.Phone
                    }
                }).end();
            }, (err) => {
                res.json({
                    error: {
                        message: err
                    }
                }).end();
            });
        } else {
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