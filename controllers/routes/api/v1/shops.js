'use strict';
let util = require('../../../../util/util');
let express = require('express');
let router = express.Router();
const Op = require('sequelize').Op;
const defaultPassword = "hello";

router.get('/shops', async (req, res, next) => {
    let operateShopId = res.locals.shopid;
    let shopInfo = res.locals.db.ShopInfo;
    let logger = res.locals.logger;
    let queryShopId = util.makeNumericValue(req.query.ShopId, null);
    let queryType = util.makeNumericValue(req.query.Type, 0);
    let phone = isNaN(util.checkPhone(req.query.Phone)) ? null : req.query.Phone;
    let roleOfOperatedShopId = await util.getRoleAsync(operateShopId);
    logger.info(`roleOfOperatedShopId:${roleOfOperatedShopId},queryType:${queryType} `);
    if (roleOfOperatedShopId == 'superman') {
        let json = {
            Array: [],
            Meta: {}
        };
        let whereObj = {};
        if (queryType !== 0) {
            if (queryShopId != null) {
                whereObj.ParentShopId = queryShopId;
            } else {
                whereObj.ParentShopId = operateShopId;
            }
        } else {
            if (queryShopId != null) {
                whereObj.ShopId = queryShopId;
            }
        }
        if (phone != null) {
            whereObj.Phone = {
                [Op.like]: `%${phone}%`
            }
        }
        let page = util.makeNumericValue(req.query.Page, 1);
        let pageSize = util.makeNumericValue(req.query.Size, 20);
        let offset = (page - 1) * pageSize;
        let rows = await shopInfo.count({
            where: whereObj
        });
        let pages = Math.ceil(rows / pageSize);
        shopInfo.findAll({
                where: whereObj,
                limit: pageSize,
                offset: offset
            })
            .then(results => {
                results.forEach(result => {
                    json.Array.push(result);
                });
                json.Meta["TotalPages"] = pages;
                json.Meta["CurrentRows"] = results.length;
                json.Meta["TotalRows"] = rows;
                json.Meta["CurrentPage"] = page;
                res.json(json).end();
            })
    } else if (roleOfOperatedShopId == 'admin') {
        if (queryShopId == null && phone == null) {
            let json = {
                Array: [],
                Meta: {}
            };
            //无ShopId和Phone则返回所有分店信息，默认按20条分页，返回字段增加Pages表示总页数，Size表示每页条数
            let page = util.makeNumericValue(req.query.Page, 1);
            let pageSize = util.makeNumericValue(req.query.Size, 20);
            let offset = (page - 1) * pageSize;
            
            shopInfo.findAndCountAll({
                    where: {
                        ParentShopId: operateShopId
                    },
                    limit: pageSize,
                    offset: offset
                })
                .then(results => {
                    results.rows.forEach(result => {
                        json.Array.push(result);
                    });
                    let pages = Math.ceil(results.count / pageSize);
                    json.Meta["TotalPages"] = pages;
                    json.Meta["CurrentRows"] = results.rows.length;
                    json.Meta["TotalRows"] = results.count;
                    json.Meta["CurrentPage"] = page;
                    res.json(json).end();
                })
        } else if (queryShopId != null) {
            let whereObj = {};
            if (!await util.isSubordinateAsync(operateShopId, queryShopId)) {
                res.json({
                    Error: {
                        Message: "无权查询其它总店下分店信息"
                    }
                }).end();
                return;
            }
            if (queryShopId != null) {
                whereObj.ShopId = queryShopId;
            }
            if (phone != null) {
                whereObj.Phone = phone;
            }
            shopInfo.findOne({
                where: whereObj
            }).then(info => {
                if (info == null) {
                    logger.warn(queryShopId + ": 分店不存在");
                    res.json({
                        Error: {
                            Message: "分店不存在"
                        }
                    }).end();
                } else {
                    logger.info(info.dataValues);
                    res.json({
                        Object: info.dataValues
                    }).end();
                }
            });
        }
    } else { //!分店
        if (queryShopId != null && queryShopId != operateShopId) {
            res.json({
                Error: {
                    Message: "无权限查询其它分店."
                }
            }).end();
            return;
        } else {
            let whereObj = {
                ShopId: operateShopId
            };
            if (phone != null) {
                whereObj.Phone = phone;
            }
            shopInfo.findOne({
                where: whereObj
            }).then(info => {
                if (info == null) {
                    logger.warn(queryShopId + ": 分店不存在");
                    res.json({
                        Error: {
                            Message: "分店不存在"
                        }
                    }).end();
                } else {
                    res.json({
                        Object: info.dataValues
                    }).end();
                }
            });
        }
    }
});

router.delete('/shops', async (req, res, next) => {

    let shopInfo = res.locals.db.ShopInfo;
    let logger = res.locals.logger;
    let queryShopId = req.body.ShopId || null;
    let phone = req.body.Phone || null;
    let operateShopId = res.locals.shopid;
    let roleOfOperatedShopId = await util.getRoleAsync(operateShopId);
    logger.info(roleOfOperatedShopId);
    let whereObj = {};
    if (phone != null) whereObj.Phone = phone;
    if (queryShopId != null) whereObj.ShopId = queryShopId;
    if (queryShopId == null && phone == null) {
        res.json({
            Error: {
                Message: "未指定店面。"
            }
        }).end();
        return;
    }
    if (!(roleOfOperatedShopId == 'admin' ||
            roleOfOperatedShopId == 'superman')) {
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
    if (roleOfOperatedShopId == 'admin') {
        if (instance.ParentShopId != operateShopId) {
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
            Object: {
                ShopId: instance.dataValues.ShopId,
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
    let operateShopId = res.locals.shopid;
    let roleOfOperatedShopId = await util.getRoleAsync(operateShopId);
    logger.info(roleOfOperatedShopId);
    if (!(roleOfOperatedShopId == 'admin' ||
            roleOfOperatedShopId == 'superman')) {
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
    let parentShopId = req.body.ParentShopId || operateShopId;
    let type = 2;
    logger.info(util.formString(phone, status, address, name, parentShopId));
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
    if (roleOfOperatedShopId == 'superman') {
        if (parentShopId == operateShopId) {
            type = 1;
        }
    } else {
        parentShopId = operateShopId;
        type = 2;
    }
    let newShop = undefined;
    res.locals.db.sequelize.transaction(async transaction => {
            newShop = await shopInfo.create({
                Name: name,
                Address: address,
                Status: util.makeNumericValue(status, 1),
                Phone: phone,
                Type: type,
                ParentShopId: parentShopId
            }, {
                transaction: transaction
            })
            let newAcctInfo = await res.locals.db.ShopAccountInfo.create({
                CustomedPoints: 0,
                RecommendPoints: 0,
                //ChargedPoints: 0,
                ShopBounusPoints: 0,
                ShopId: newShop.ShopId,
                CustomedMoney:0,
                ChargedMoney:0,
            }, {
                transaction: transaction
            });
            let newLogin = await res.locals.db.Login.create({
                Id: newShop.ShopId,
                Password: defaultPassword
            }, {
                transaction: transaction
            });
            let newBounusRate = await res.locals.db.BounusPointRate.create({
                RecommendRate: 0.06,
                IndirectRecommendRate: 0.05,
                ThirdRecommendRate: 0.01,
                ShopBounusPointRate: 0.05,
                ShopId: newShop.ShopId,
                Level: newShop.Type == 2 ? 1:2,
                PointToMoneyRate: newShop.Type == 1 ? 1:0,
            }, {
                transaction: transaction
            });
        })
        .then(() => {
            logger.info(newShop);
            res.json({
                Object: newShop
            }).end();
        })
        .catch(error => {
            logger.error(error);
            if (error.name != null){
                if (error.errors[0].type == "unique violation"){
                    error = "店面联系电话已存在";
                }
            }
            res.json({
                Error: {
                    Message: error
                }
            });
        })
});

router.patch('/shops', async (req, res, next) => {
    let logger = res.locals.logger;
    logger.info("enter patch shops");
    let operateShopId = res.locals.shopid;
    let roleOfOperatedShopId = await util.getRoleAsync(operateShopId);
    logger.info(roleOfOperatedShopId);
    if (roleOfOperatedShopId != "admin" &&
        roleOfOperatedShopId != "superman") {
        res.json({
            Error: {
                Message: "该用户无权修改分店信息"
            }
        }).end();
        return;
    }
    let shopInfo = res.locals.db.ShopInfo;
    let queryShopId = req.body.ShopId || null;
    let phone = req.body.Phone || null;
    let status = util.makeNumericValue(req.body.Status, null);
    logger.info(status);
    let name = req.body.Name || null;
    let address = req.body.Address || null;
    let parentShopId = req.body.ParentShopId;
    if (queryShopId == null && phone == null) {
        res.json({
            Error: {
                Message: "未指定店面。"
            }
        }).end();
    }
    let whereObj = {};
    if (queryShopId != null) {
        whereObj.ShopId = queryShopId;
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
    if (roleOfOperatedShopId == "admin") {
        if (instance.ParentShopId != operateShopId) {
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
        if (parentShopId) {
            instance.set("ParentShopId", parentShopId);
        }
        instance.save().then((row) => {
            res.json({
                Object: row
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
            Message: "找不到 \nNo Service with " + req.method
        }
    }).end();
})

router.use((req, res, next) => {
    next();
})


module.exports = router;