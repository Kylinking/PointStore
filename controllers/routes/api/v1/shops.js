'use strict';
let util = require('../../../../util/util');
let express = require('express');
let router = express.Router();
const Op = require('sequelize').Op;
const defaultPassword = "hello";
router.get('/shops', async (req, res, next) => {
    let operateShopID = res.locals.shopid;
    let shopInfo = res.locals.db.ShopInfo;
    let logger = res.locals.logger;
    let queryShopID = util.makeNumericValue(req.query.ShopId,null);
    let queryType = util.makeNumericValue(req.query.Type, 0);
    let phone = isNaN(util.checkPhone(req.query.Phone))? null:req.query.Phone;
    let roleOfOperatedShopID = await util.getRoleAsync(operateShopID);
    logger.info(roleOfOperatedShopID);
    if (roleOfOperatedShopID == 'superman') {
        let json = {
            Data: []
        };
        let whereObj = {};
        if (queryType !== 0) {
            if (queryShopID != null) {
                whereObj.ParentShopID = queryShopID;
            } else {
                whereObj.ParentShopID = operateShopID;
            }
        } else {
            if (queryShopID != null) {
                whereObj.ShopID = queryShopID;
            }
        }
        if (phone != null) {
            whereObj.Phone = {
                [Op.like]: `%${phone}%`
            }
        }
        let page = util.makeNumericValue(req.query.Page, 1);
        let pageSize = util.makeNumericValue(req.query.Size,20);
        let offset = (page - 1) * pageSize;
        let pages = Math.ceil(await shopInfo.count({
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
                    json.Data.push(result);
                });
                json["Pages"] = Math.ceil(pages);
                json["Size"] = pageSize;
                res.json(json).end();
            })
    } else if (roleOfOperatedShopID == 'admin') {
        if (queryShopID == null && phone == null) {
            let json = {
                Data: []
            };
            //无ShopID和Phone则返回所有分店信息，默认按20条分页，返回字段增加Pages表示总页数，Size表示每页条数
            let page = util.makeNumericValue(req.query.Page,1);
            let pageSize = util.makeNumericValue(req.query.Size,20);
            let offset = (page - 1) * pageSize;
            let pages = Math.ceil(await shopInfo.count() / pageSize);
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
                        json.Data.push(result);
                    });
                    json["Pages"] = Math.ceil(pages);
                    json["Size"] = pageSize;
                    res.json(json).end();
                })
        } else { // !queryShopID == null && phone == null
            let whereObj = {
                ParentShopID: operateShopID
            };
            if (queryShopID != null) {
                whereObj.ShopID = queryShopID;
            }
            if (phone != null) {
                whereObj.Phone = phone;
            }
            shopInfo.findOne({
                where: whereObj
            }).then(info => {
                if (info == null) {
                    logger.warn(queryShopID + ": 分店不存在");
                    res.json({
                        Error: {
                            Message: "分店不存在"
                        }
                    }).end();
                } else {
                    res.json({
                        Data: [info.dataValues]
                    }).end();
                }
            });
        }
    } else { //!分店
        if (queryShopID != null && queryShopID != operateShopID) {
            res.json({
                Error: {
                    Message: "无权限查询其它分店."
                }
            }).end();
            return;
        } else {
            let whereObj = {
                ShopID: operateShopID
            };
            if (phone != null) {
                whereObj.Phone = phone;
            }
            shopInfo.findOne({
                where: whereObj
            }).then(info => {
                if (info == null) {
                    logger.warn(queryShopID + ": 分店不存在");
                    res.json({
                        Error: {
                            Message: "分店不存在"
                        }
                    }).end();
                } else {
                    res.json({
                        Data: [info.dataValues]
                    }).end();
                }
            });
        }
    }
});

router.delete('/shops', async (req, res, next) => {

    let shopInfo = res.locals.db.ShopInfo;
    let logger = res.locals.logger;
    let queryShopID = req.body.ShopId || null;
    let phone = req.body.Phone || null;
    let operateShopID = res.locals.shopid;
    let roleOfOperatedShopID = await util.getRoleAsync(operateShopID);
    logger.info(roleOfOperatedShopID);
    let whereObj = {};
    if (phone != null) whereObj.Phone = phone;
    if (queryShopID != null) whereObj.ShopID = queryShopID;
    if (queryShopID == null && phone == null) {
        res.json({
            Error: {
                Message: "未指定店面。"
            }
        }).end();
        return;
    }
    if (!(roleOfOperatedShopID == 'admin' ||
            roleOfOperatedShopID == 'superman')) {
        res.json({
            Error: {
                Message: "该用户无权关闭店面"
            }
        }).end();
        return;
    }
    let instance = await shopInfo.findOne({
        where: whereObj
    });
    if (!instance) {
        res.json({
            Error: {
                Message: "店面不存在"
            }
        }).end();
        return;
    }
    if (roleOfOperatedShopID == 'admin') {
        if (instance.ParentShopID != operateShopID) {
            res.json({
                Error: {
                    Message: "该用户无权关闭此店面"
                }
            }).end();
            return;
        }
    }
    if (instance.dataValues.Status == 0) {
        res.json({
            Error: {
                Message: "该店面已注销"
            }
        }).end();
        return;
    }
    instance.set("Status", 0);
    instance.save().then(() => {
        res.json({
            Data: {
                ShopID: instance.dataValues.ShopID,
                Name: instance.dataValues.Name,
                Address: instance.dataValues.Address,
                Status: 0,
                Phone: instance.dataValues.Phone
            }
        }).end();
    }).catch((err) => {
        res.json({
            Error: {
                Message: err
            }
        }).end();
    });
});

router.post('/shops', async (req, res, next) => {
    let logger = res.locals.logger;
    logger.info('enter post /shops');
    let operateShopID = res.locals.shopid;
    let roleOfOperatedShopID = await util.getRoleAsync(operateShopID);
    logger.info(roleOfOperatedShopID);
    if (!(roleOfOperatedShopID == 'admin' ||
            roleOfOperatedShopID == 'superman')) {
        res.json({
            Error: {
                Message: "该用户无权新建分店"
            }
        }).end();
        return;
    }
    let shopInfo = res.locals.db.ShopInfo;
    let phone = req.body.Phone || null;
    let status = req.body.Status || 0;
    let name = req.body.Name || null;
    let address = req.body.Address || null;
    let parentShopID = req.body.ParentShopId || operateShopID;
    let type = 2;
    logger.info(util.formString(phone, status, address, name, parentShopID));
    [phone, name, address].forEach(elem => {
        if (elem == null) {
            res.json({
                Error: {
                    Message: "Phone,Name,Address不能为空！"
                }
            });
            return;
        }
    })
    if (roleOfOperatedShopID == 'superman') {
        if (parentShopID == operateShopID) {
            type = 1;
        }
    }else{
        parentShopID = operateShopID;
        type = 2;
    }
    let newShop = undefined;
    res.locals.db.sequelize.transaction(async transaction => {
        newShop = await shopInfo.create({
            Name: name,
            Address: address,
            Status: util.makeNumericValue(status,1),
            Phone: phone,
            Type: type,
            ParentShopID: parentShopID
        }, {
            transaction: transaction
        })
        let newAcctInfo = await res.locals.db.ShopAccountInfo.create({
            CustomedPoints: 0,
            RecommendPoints: 0,
            ChargedPoints: 0,
            ShopBounusPoints: 0,
            ShopID: newShop.ShopID,
        }, {
            transaction: transaction
        });
        let newLogin = await res.locals.db.Login.create({
            ID:newShop.ShopID,
            Password:defaultPassword
        }, {
            transaction: transaction
        });
    })
    .then(()=>{
        res.json({
            Data: newShop
        }).end();
    })
    .catch(error=>{
        logger.error(error);
        res.json({Error:{Message:error}});
    })
});

router.patch('/shops', async (req, res, next) => {
    let logger = res.locals.logger;
    logger.info("enter patch shops");
    let operateShopID = res.locals.shopid;
    let roleOfOperatedShopID = await util.getRoleAsync(operateShopID);
    logger.info(roleOfOperatedShopID);
    if (roleOfOperatedShopID != "admin" &&
        roleOfOperatedShopID != "superman") {
        res.json({
            Error: {
                Message: "该用户无权修改分店信息"
            }
        }).end();
        return;
    }
    let shopInfo = res.locals.db.ShopInfo;
    let queryShopID = req.body.ShopId || null;
    let phone = req.body.Phone || null;
    let status =  util.makeNumericValue(req.body.Status,null);
    logger.info(status);
    let name = req.body.Name || null;
    let address = req.body.Address || null;
    let parentShopID = req.body.ParentShopId;
    if (queryShopID == null && phone == null) {
        res.json({
            Error: {
                Message: "未指定店面。"
            }
        }).end();
    }
    let whereObj = {};
    if (queryShopID != null) {
        whereObj.ShopID = queryShopID;
    }
    if (phone != null) {
        whereObj.Phone = phone;
    }
    let instance = await shopInfo.findOne({
        where: whereObj
    });
    if (!instance) {
        res.json({
            Error: {
                Message: "店面不存在"
            }
        }).end();
        return;
    }
    if (roleOfOperatedShopID == "admin") {
        if (instance.ParentShopID != operateShopID) {
            res.json({
                Error: {
                    Message: "该用户无权修改此分店信息"
                }
            }).end();
            return;
        }
    }
    try {
        logger.info(status)
        if (status != null) {
            logger.info(status)
            instance.set('Status', status);
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
                Data: row
            }).end();
        }).catch(err => {
            logger.info(err)
            res.json({
                Error: {
                    Message: err
                }
            }).end();
        });
    } catch (err) {
        logger.info(err);
        throw (err);
    }

});

// error 
router.use('/shops', (req, res) => {
    res.json({
        Error: {
            Message: "Not Found. \nNo Service with " + req.method
        }
    }).end();
})

router.use((req, res, next) => {
    next();
})


module.exports = router;