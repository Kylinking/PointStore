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
     
    if (await util.isSuperman(operateShopID)) {
        var json = {
            data: []
        };
        var whereObj = {};
        if (queryType !== 0) {
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
            whereObj.Phone = {
                [Op.like]: '%' + phone + '%'
            }
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
    } else if (await util.isAdminShop(operateShopID)) {
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

    var shopInfo = res.locals.db.ShopInfo;
    var logger = res.locals.logger;
    var queryShopID = req.body.ShopID || '';
    var phone = req.body.Phone || '';
    var operateShopID = res.locals.ShopID;
    var whereObj = {};
    if (phone != '') whereObj.Phone = phone;
    if (queryShopID != '') whereObj.ShopID = queryShopID;
    if (queryShopID == '' && phone == '') {
        res.json({
            error: {
                message: "未指定店面。"
            }
        }).end();
        return;
    }
    if (!(await util.isAdminShop(operateShopID) ||
    await util.isSuperman(operateShopID))) {
        res.json({
            error: {
                message: "该用户无权关闭店面"
            }
        }).end();
        return;
    }
    var instance = await shopInfo.findOne({
        where: whereObj
    });
    if (!instance) {
        res.json({
            error: {
                message: "店面不存在"
            }
        }).end();
        return;
    }
    if (await util.isAdminShop(operateShopID)) {
        if (instance.ParentShopID != operateShopID) {
            res.json({
                error: {
                    message: "该用户无权关闭此店面"
                }
            }).end();
            return;
        }
    }
    if (instance.dataValues.Status == 0) {
        res.json({
            error: {
                message: "该店面已注销"
            }
        }).end();
        return;
    }
    instance.set("Status", 0);
    instance.save().then(() => {
        res.json({
            data: {
                ShopID: instance.dataValues.ShopID,
                Name: instance.dataValues.Name,
                Address: instance.dataValues.Address,
                Status: 0,
                Phone: instance.dataValues.Phone
            }
        }).end();
    }).catch((err) => {
        res.json({
            error: {
                message: err
            }
        }).end();
    });
});

router.post('/shops',async (req, res, next) => {
    var logger = res.locals.logger;
    logger.info('enter post /shops');
    var operateShopID = res.locals.ShopID;
    if (!(await util.isAdminShop(operateShopID) ||
    await util.isSuperman(operateShopID))) {
        res.json({
            error: {
                message: "该用户无权新建分店"
            }
        }).end();
        return;
    }
    var shopInfo = res.locals.db.ShopInfo;
    var phone = req.body.Phone || '';
    var status = req.body.Status || 0;
    var name = req.body.Name || '';
    var address = req.body.Address || '';
    var parentShopID = req.body.ParentShopID || operateShopID;
    var type = 2;
    logger.info(util.formString(phone, status, address, name, parentShopID));
    [phone, name, address].forEach(elem => {
        if (elem == '') {
            res.json({
                error: {
                    message: "Phone,Name,Address不能为空！"
                }
            });
            return;
        }
    })
    if (await util.isSuperman(operateShopID)) {
        if (parentShopID == operateShopID) {
            type = 1;
        }
    }
    if (await util.isAdminShop(operateShopID)) {

    }
    shopInfo.create({
        Name: name,
        Address: address,
        Status: parseInt(status),
        Phone: phone,
        Type: type,
        ParentShopID: parentShopID
    }).then((row) => {
        res.json({
            data: {
                ShopID: row.dataValues.ShopID,
                Name: row.dataValues.Name,
                Address: row.dataValues.Address,
                Status: row.dataValues.Status,
                Phone: row.dataValues.Phone,
                ParentShopID: row.dataValues.ParentShopID,
                Type: row.dataValues.Type
            }
        }).end();
    }).catch(error => {
        res.json({
            error: {
                message: error
            }
        }).end();
    });
});

router.patch('/shops', async (req, res, next) => {
    var logger = res.locals.logger;
    logger.info("enter patch shops");
    var operateShopID = res.locals.ShopID;
    if (!await util.isAdminShop(operateShopID) &&
        !await util.isSuperman(operateShopID)) {
        res.json({
            error: {
                message: "该用户无权修改分店信息"
            }
        }).end();
        return;
    }
    var shopInfo = res.locals.db.ShopInfo;
    var queryShopID = req.body.ShopID || '';
    var phone = req.body.Phone || '';
    var status = req.body.Status || '';
    var name = req.body.Name || '';
    var address = req.body.Address || '';
    var parentShopID = req.body.ParentShopID;
    if (queryShopID == '' && phone == '') {
        res.json({
            error: {
                message: "未指定店面。"
            }
        }).end();
    }
    var whereObj = {};
    if (queryShopID != '') {
        whereObj.ShopID = queryShopID;
    }
    if (phone != '') {
        whereObj.Phone = phone;
    }
    var instance = await shopInfo.findOne({
        where: whereObj
    });
    if (!instance) {
        res.json({
            error: {
                message: "店面不存在"
            }
        }).end();
        return;
    }
    if (await util.isAdminShop(operateShopID)){
        if (instance.ParentShopID != operateShopID){
            res.json({
                error: {
                    message: "该用户无权修改此分店信息"
                }
            }).end();
            return;
        }
    }
    if (status) {
        instance.set('Status', parseInt(status));
    }
    if (name) {
        instance.set("Name", name);
    }
    if (address) {
        instance.set("Address", address);
    }
    if (parentShopID) {
        instance.set("ParentShopID", parentShopID);
    }
    instance.save().then((row) => {
        res.json({
            data: {
                ShopID: row.dataValues.ShopID,
                Name: row.dataValues.Name,
                Address: row.dataValues.Address,
                Status: row.dataValues.Status,
                Phone: row.dataValues.Phone,
                ParentShopID: row.dataValues.ParentShopID,
                Type: row.dataValues.Type
            }
        }).end();
    }).catch(err => {
        res.json({
            error: {
                message: err
            }
        }).end();
    });

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