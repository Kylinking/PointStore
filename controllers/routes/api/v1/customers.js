'use strict';
var util = require('../../../../util/util');
var express = require('express');
var router = express.Router();
const Op = require('sequelize').Op;

router.get('/customers', async (req, res) => {
    var customerInfo = res.locals.db.CustomerInfo;
    var shopInfo = res.locals.db.ShopInfo;
    var logger = res.locals.logger;
    var operateShopID = res.locals.ShopID;
    var queryShopID = req.query.ShopID || null;
    var phone = req.query.Phone || null;
    var page = parseInt(req.query.Page) || 1;
    var pageSize = parseInt(req.query.Size) || 20;
    var offset = (page - 1) * pageSize;

    var whereObj = {};
    if (phone != null) whereObj.Phone = {
        [Op.like]: `%${phone}%`
    };

    var instance = undefined;
    if (await util.isSuperman(operateShopID)) {
        if (queryShopID != null && queryShopID != operateShopID) {
            if (await util.isAdminShop(queryShopID)) {
                //取总店下所有分店的客户信息
                instance = await customerInfo.findAndCountAll({
                    where: whereObj,
                    include: [{
                        model: shopInfo,
                        where: {
                            ParentShopID: queryShopID
                        }
                    }, {
                        model: customerInfo,
                        as: "RecommendCustomerInfo",
                        required: false
                    }],
                    limit: pageSize,
                    offset: offset
                });
            } else {
                //取分店下的所有客户信息
                whereObj.ShopID = queryShopID;
                instance = await customerInfo.findAndCountAll({
                    where: whereObj,
                    include: [{
                        model: shopInfo,
                        required: true
                    }, {
                        model: customerInfo,
                        as: "RecommendCustomerInfo",
                        required: false
                    }],
                    limit: pageSize,
                    offset: offset
                });
            }
        } else {
            //取全表所有客户
            instance = await customerInfo.findAndCountAll({
                where: whereObj,
                include: [{
                    model: shopInfo,
                    required: true
                }, {
                    model: customerInfo,
                    as: "RecommendCustomerInfo",
                    required: false
                }],
                limit: pageSize,
                offset: offset
            })
        }
    } else if (await util.isAdminShop(operateShopID)) {
        if (queryShopID != null) {
            if (await util.isSuperman(queryShopID)) {
                // 报错
                res.json({
                    error: {
                        message: "无权限"
                    }
                }).end();
                return;
            } else if (await util.isAdminShop(queryShopID)) {
                if (queryShopID != operateShopID) {
                    //报错
                    res.json({
                        error: {
                            message: "无权限取其它总店客户信息"
                        }
                    }).end();
                    return;
                } else {
                    instance = await customerInfo.findAndCountAll({
                        where: whereObj,
                        include: [{
                            model: shopInfo,
                            where: {
                                ParentShopID: operateShopID
                            }
                        }, {
                            model: customerInfo,
                            as: "RecommendCustomerInfo",
                            required: false
                        }],
                        limit: pageSize,
                        offset: offset
                    });
                }
            } else {
                let shop = await shopInfo.findOne({
                    where: {
                        ShopID: queryShopID
                    }
                });
                if (shop.ParentShopID != operateShopID) {
                    res.json({
                        error: {
                            message: "无权限取其它总店客户信息"
                        }
                    }).end();
                    return;
                } else {
                    whereObj.ShopID = queryShopID;
                    instance = await customerInfo.findAndCountAll({
                        where: whereObj,
                        include: [{
                            model: shopInfo,
                            required: true
                        }, , {
                            model: customerInfo,
                            as: "RecommendCustomerInfo",
                            required: false
                        }],
                        limit: pageSize,
                        offset: offset
                    });
                }
            }
        } else {
            //取总店下所有分店的客户信息
            instance = await customerInfo.findAndCountAll({
                where: whereObj,
                include: [{
                    model: shopInfo,
                    where: {
                        ParentShopID: operateShopID
                    }
                }, {
                    model: customerInfo,
                    as: "RecommendCustomerInfo",
                    required: false
                }],
                limit: pageSize,
                offset: offset
            });
        }
    } else {
        if (queryShopID != null && queryShopID != operateShopID) {
            // 报错
            res.json({
                error: {
                    message: "无权限取其它分店客户信息"
                }
            }).end();
            return;
        } else {
            //取该分店客户信息
            whereObj.ShopID = operateShopID;
            instance = await customerInfo.findAndCountAll({
                where: whereObj,
                include: [{
                    model: shopInfo,
                    required: true
                }, {
                    model: customerInfo,
                    as: "RecommendCustomerInfo",
                    required: false
                }],
                limit: pageSize,
                offset: offset
            });
        }
    }
    var json = {
        data: []
    };
    var pages = Math.ceil(instance.count / pageSize);
    instance.rows.forEach(row => {
        json.data.push(row);
    });
    json["Pages"] = Math.ceil(pages);
    json["Size"] = pageSize;
    res.json(json).end();
});

router.post('/customers', async (req, res) => {
    var customerInfo = res.locals.db.CustomerInfo;
    var logger = res.locals.logger;
    var phone = req.body.Phone || null;
    var status = isNaN(parseInt(req.body.Status))?1:parseInt(req.body.Status);
    var name = req.body.Name || null;
    var address = req.body.Address || null;
    var sex = req.body.Sex || null;
    var age = req.body.Age || null;
    var operateShopID = res.locals.ShopID;
    var shopID = isNaN(parseInt(req.body.ShopID))?null:parseInt(req.body.ShopID)
    var recommendCustomerID = req.body.RecommendCustomerID || null;
    logger.info(recommendCustomerID);
    [phone, sex].forEach(elem => {
        if (elem == null) {
            res.json({
                error: {
                    Message: "Phone,Sex不能为空！"
                }
            });
            return;
        }
    });
    var createCondition = {
        Name: name,
        Address: address,
        Status: status,
        Phone: phone,
        Sex: sex,
        Age: age,
    };
    if (await util.isAdminShop(operateShopID)) {
        res.json({
            error: {
                message: "无权创建客户信息"
            }
        }).end();
        return;
    } else if (await util.isSuperman(operateShopID)) {
        if (shopID == null || await util.isAdminShop(shopID)) {
            res.json({
                error: {
                    message: "需要客户归属分店ID"
                }
            }).end();
            return;
        }
        if (!await util.isBelongsToByID(recommendCustomerID, shopID)) {
            createCondition.RecommendCustomerID = null;
        } else {
            createCondition.RecommendCustomerID = recommendCustomerID;
        }
        createCondition.ShopID = shopID;
    } else {
        if (shopID !== null && shopID != operateShopID) {
            res.json({
                error: {
                    message: "无权创建其它店面客户信息"
                }
            }).end();
            return;
        }
        if (!await util.isBelongsToByID(recommendCustomerID, operateShopID)) {
            createCondition.RecommendCustomerID = null;
        } else {
            createCondition.RecommendCustomerID = recommendCustomerID;
        }
        createCondition.ShopID = operateShopID;
    }

    res.locals.db.sequelize.transaction(transaction => {
        return customerInfo.create(createCondition, {
                transaction: transaction
            })
            .then((row) => {
                res.json({
                    data: row
                }).end();
                //logger.info(row);
                return res.locals.db.CustomerAccountInfo.create({
                    CustomerID: row.CustomerID,
                    ShopBounusPoints: 0,
                    ChargedPoints: 0,
                    RecommendPoints: 0,
                    IndirectRecommendPoints: 0,
                    CustomedPoints: 0,
                    RemainPoints: 0
                }, {
                    transaction: transaction
                });

            })
            .catch(
                error => {
                    //  console.log(error);
                    res.json({
                        error: {
                            message: error
                        }
                    }).end();
                });
    });
});

router.delete('/customers', async (req, res) => {
    var customerInfo = res.locals.db.CustomerInfo;
    var logger = res.locals.logger;
    var operateShopID = res.locals.ShopID;
    var phone = req.body.Phone || null;
    if (await util.isAdminShop(operateShopID)) {
        res.json({
            error: {
                message: "无权修改客户信息"
            }
        }).end();
        return;
    }
    if (phone == null) {
        res.json({
            error: {
                message: "客户电话不能为空"
            }
        }).end();
        return;
    }
    var instance = await customerInfo.findOne({
        where: {
            Phone: phone
        }
    });
    if (instance) {
        if (instance.dataValues.Status == 0) {
            res.json({
                error: {
                    message: "该客户已注销"
                }
            }).end();
            return;
        }
        if (!await util.isSuperman(operateShopID)) {
            if (instance.ShopID != operateShopID) {
                res.json({
                    error: {
                        message: "无权注销别家分店客户"
                    }
                }).end();
                return;
            }
        }
        customerInfo.update({
            Status: 0
        }, {
            where: {
                Phone: phone
            }
        }).then(() => {
            res.json({
                data: {
                    CustomerID: instance.dataValues.CustomerID,
                    Name: instance.dataValues.Name,
                    Address: instance.dataValues.Address,
                    Status: 0,
                    Phone: instance.dataValues.Phone,
                    Sex: instance.dataValues.Sex,
                    Age: instance.dataValues.Age,
                    ShopID: instance.dataValues.ShopID,
                }
            }).end();
        }).catch(
            error => {
                res.json({
                    error: {
                        message: error
                    }
                }).end();
            });
    } else {
        res.json({
            error: {
                message: "客户不存在"
            }
        }).end();
    }
});

router.patch('/customers', async (req, res) => {
    var customerInfo = res.locals.db.CustomerInfo;
    var logger = res.locals.logger;
    var operateShopID = res.locals.ShopID;
    var phone = req.body.Phone || null;
    var status = req.body.Status || null;
    var name = req.body.Name || null;
    var address = req.body.Address || null;
    var sex = req.body.Sex || null;
    var age = req.body.Age || null;
    var shopID = req.body.ShopID || null;
    if (await util.isAdminShop(operateShopID)) {
        res.json({
            error: {
                message: "无权修改客户信息"
            }
        }).end();
        return;
    }
    if (phone == null) {
        res.json({
            error: {
                message: "电话不能为空"
            }
        }).end();
        return;
    }
    var instance = await customerInfo.findOne({
        where: {
            Phone: phone
        }
    });
    if (instance) {
        if (!await util.isSuperman(operateShopID)) {
            if (instance.ShopID != operateShopID) {
                res.json({
                    error: {
                        message: "无权修改别家分店客户信息"
                    }
                }).end();
                return;
            }
            if (shopID != null) {
                res.json({
                    error: {
                        message: "无权修改客户归属信息"
                    }
                }).end();
                return;
            }
        } else {
            if (shopID != null) {
                instance.set('ShopID', shopID);
            }
        }
        if (status != null) instance.set('Status', status);
        if (address != null) instance.set('Address', address);
        if (name != null) instance.set('Name', name);
        if (sex != null) instance.set('Sex', sex);
        if (age != null) instance.set('Age', age);
        instance.save().then(() => {
            res.json({
                data: {
                    CustomerID: instance.dataValues.ShopID,
                    Name: instance.dataValues.Name,
                    Address: instance.dataValues.Address,
                    Status: instance.dataValues.Status,
                    Phone: instance.dataValues.Phone,
                    Sex: instance.dataValues.Sex,
                    Age: instance.dataValues.Age,
                    ShopID: instance.dataValues.ShopID,
                }
            }).end();
        }).catch((err) => {
            res.json({
                error: {
                    message: err
                }
            }).end();
        })
    }
});


router.use('/customers', (req, res) => {
    res.status(401);
    res.json({
        error: {
            message: "无服务： " + req.method
        }
    }).end();
})

router.use((req, res, next) => {
    next();
})
module.exports = router;