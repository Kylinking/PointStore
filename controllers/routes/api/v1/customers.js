'use strict';
let util = require('../../../../util/util');
let express = require('express');
let router = express.Router();
const Op = require('sequelize').Op;

router.get('/customers', async (req, res) => {
    let customerInfo = res.locals.db.CustomerInfo;
    let shopInfo = res.locals.db.ShopInfo;
    let logger = res.locals.logger;
    let operateShopId = res.locals.shopid;
    let queryShopId = util.makeNumericValue(req.query.ShopId, null);
    let phone = isNaN(util.checkPhone(req.query.Phone)) ? null : req.query.Phone;
    let page = util.makeNumericValue(req.query.Page, 1);
    let pageSize = util.makeNumericValue(req.query.Size, 20);
    let name = req.query.Name || null;
    let offset = (page - 1) * pageSize;
    let recommendId = util.makeNumericValue(req.query.RecommendCustomerId, null);
    let whereObj = {};
    if (phone != null) whereObj.Phone = {
        [Op.like]: `%${phone}%`
    };
    if (name != null) whereObj.Name = {
        [Op.like]: `%${name}%`
    };
    if (recommendId != null) {
        whereObj.RecommendCustomerId = recommendId;
    };
    let role = await util.getRoleAsync(operateShopId);
    let queryRole = await util.getRoleAsync(queryShopId);
    logger.info(`role:${role},queryShopId${queryShopId}`);
    let includeObj = [{
        model: shopInfo,
        required: true
    }, {
        model: customerInfo,
        as: "RecommendCustomerInfo",
        required: false
    }];
    try {
        if (role == 'superman') {
            if (queryShopId != null && queryShopId != operateShopId) {
                if (queryRole == "admin") {
                    //取总店下所有分店的客户信息
                    includeObj[0].where = {
                        ParentShopId: queryShopId
                    };
                } else {
                    //取分店下的所有客户信息
                    whereObj.ShopId = queryShopId;
                }
            }
        } else if (role == 'admin') {
            if (queryShopId != null) {
                if (queryRole == "superman") {
                    throw ("无权限");
                } else if (queryRole == "admin") {
                    if (queryShopId != operateShopId) {
                        throw ("无权限取其它总店客户信息");
                    } else {
                        includeObj[0].where = {
                            ParentShopId: operateShopId
                        };
                    }
                } else {
                    if (!await util.isSubordinateAsync(operateShopId, queryShopId)) {
                        throw ("无权限取其它总店客户信息");
                    } else {
                        whereObj.ShopId = queryShopId;
                    }
                }
            } else {
                includeObj[0].where = {
                    ParentShopId: operateShopId
                };
            }
        } else {
            if (queryShopId != null && queryShopId != operateShopId) {
                throw ("无权限取其它分店客户信息");
            } else {
                //取该分店客户信息
                whereObj.ShopId = operateShopId;
            }
        }
        logger.info(`whereObj:${whereObj},include:${includeObj}`);
        let instance = await customerInfo.findAndCountAll({
            where: whereObj,
            include: includeObj,
            limit: pageSize,
            offset: offset
        });
        let json = {
            Data: [],
            Meta: {}
        };
        let pages = Math.ceil(instance.count / pageSize);
        for (let row of instance.rows) {
            //add CustomerAccountInfo to records
            let value = row.dataValues;
            let record = await res.locals.db.CustomerAccountInfo.findOne({
                where: {
                    CustomerId: row.CustomerId
                }
            })
            value["CustomerAccountInfo"] = record;
            json.Data.push(value);
        }
        json.Meta["TotalPages"] = pages;
        json.Meta["CurrentRows"] = instance.rows.length;
        json.Meta["TotalRows"] = instance.count;
        json.Meta["CurrentPage"] = page;
        logger.info(`output: ${json}`);
        res.json(json).end();
    } catch (error) {
        logger.error(error);
        res.json({
            Error: {
                Message: error
            }
        }).end();
    }
});

router.post('/customers', async (req, res) => {
    let customerInfo = res.locals.db.CustomerInfo;
    let logger = res.locals.logger;
    let phone = isNaN(util.checkPhone(req.body.Phone)) ? null : req.body.Phone;
    let status = util.makeNumericValue(req.body.Status, 1);
    let name = req.body.Name || null;
    let address = req.body.Address || null;
    let sex = req.body.Sex || null;
    let age = util.makeNumericValue(req.body.Age, null);
    let operateShopId = res.locals.shopid;
    let shopId = util.makeNumericValue(req.body.ShopId, null);
    let recommendCustomerId = util.makeNumericValue(req.body.RecommendCustomerId, null);
    logger.info(`phone:${phone},status:${status},name:${name},sex:${sex},age:${age},recommend:${recommendCustomerId}`);
    [phone, sex].forEach(elem => {
        if (elem == null) {
            res.json({
                Error: {
                    Message: "Phone,Sex不能为空！"
                }
            });
            return;
        }
    });

    let role = await util.getRoleAsync(operateShopId);
    let createCondition = {
        Name: name,
        Address: address,
        Status: status,
        Phone: phone,
        Sex: sex,
        Age: age,
    };
    if (role == 'admin') {
        res.json({
            Error: {
                Message: "无权创建客户信息"
            }
        }).end();
        return;
    } else if (role == 'superman') {
        if (shopId == null || await util.isAdminShopAsync(shopId)) {
            res.json({
                Error: {
                    Message: "需要客户归属分店Id"
                }
            }).end();
            return;
        }
        if (!await util.isBelongsToByIdAsync(recommendCustomerId, shopId)) {
            createCondition.RecommendCustomerId = null;
        } else {
            createCondition.RecommendCustomerId = recommendCustomerId;
        }
        createCondition.ShopId = shopId;
    } else {
        if (shopId !== null && shopId != operateShopId) {
            res.json({
                Error: {
                    Message: "无权创建其它店面客户信息"
                }
            }).end();
            return;
        }
        if (!await util.isBelongsToByIdAsync(recommendCustomerId, operateShopId)) {
            createCondition.RecommendCustomerId = null;
        } else {
            createCondition.RecommendCustomerId = recommendCustomerId;
        }
        createCondition.ShopId = operateShopId;
    }

    res.locals.db.sequelize.transaction(transaction => {
        return customerInfo.create(createCondition, {
                transaction: transaction
            })
            .then((row) => {
                res.json({
                    Data: row
                }).end();
                //logger.info(row);
                return res.locals.db.CustomerAccountInfo.create({
                    CustomerId: row.CustomerId,
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
                    logger.error(error);
                    res.json({
                        Error: {
                            Message: error
                        }
                    }).end();
                }
            );
    });
});

router.delete('/customers', async (req, res) => {
    let customerInfo = res.locals.db.CustomerInfo;
    let logger = res.locals.logger;
    let operateShopId = res.locals.shopid;
    let phone = isNaN(util.checkPhone(req.body.Phone)) ? null : req.body.Phone;
    let role = await util.getRoleAsync(operateShopId);
    if (role == 'admin') {
        res.json({
            Error: {
                Message: "无权修改客户信息"
            }
        }).end();
        return;
    }
    if (phone == null) {
        res.json({
            Error: {
                Message: "客户电话不能为空"
            }
        }).end();
        return;
    }
    let instance = await customerInfo.findOne({
        where: {
            Phone: phone
        }
    });
    if (instance) {
        if (instance.dataValues.Status == 0) {
            res.json({
                Error: {
                    Message: "该客户已注销"
                }
            }).end();
            return;
        }
        if (role != 'superman') {
            if (instance.ShopId != operateShopId) {
                res.json({
                    Error: {
                        Message: "无权注销别家分店客户"
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
            instance.reload().then(() => {
                res.json({
                    Data: instance
                }).end();
            })

        }).catch(
            error => {
                logger.error(error);
                res.json({
                    Error: {
                        Message: error
                    }
                }).end();
            });
    } else {
        logger.info(`客户不存在`);
        res.json({
            Error: {
                Message: "客户不存在"
            }
        }).end();
    }
});

router.patch('/customers', async (req, res) => {
    let customerInfo = res.locals.db.CustomerInfo;
    let logger = res.locals.logger;
    let operateShopId = res.locals.shopid;
    let phone = isNaN(util.checkPhone(req.body.Phone)) ? null : req.body.Phone;
    let status = util.makeNumericValue(req.body.Status, null);
    let name = req.body.Name || null;
    let address = req.body.Address || null;
    let sex = req.body.Sex || null;
    let age = util.makeNumericValue(req.body.Age, null);
    let shopId = util.makeNumericValue(req.body.ShopId, null);
    let customerId = util.makeNumericValue(req.body.customerid, null);
    let role = await util.getRoleAsync(operateShopId);
    let recommendCustomerId = util.makeNumericValue(req.body.RecommendCustomerId, null);
    if (role == 'admin') {
        logger.info(`总店无权修改客户信息`)
        res.json({
            Error: {
                Message: "无权修改客户信息"
            }
        }).end();
        return;
    }
    if (customerId == null && phone == null) {
        res.json({
            Error: {
                Message: "Phone和CustomerId不能同时为空"
            }
        }).end();
        return;
    }
    let whereObj = {};
    if (customerId != null) {
        whereObj.CustomerId = customerId;
    } else {
        whereObj.Phone = phone;
    }
    let instance = await customerInfo.findOne({
        where: whereObj
    });
    if (instance) {
        if (role != 'superman') {
            if (instance.ShopId != operateShopId) {
                res.json({
                    Error: {
                        Message: "无权修改别家分店客户信息"
                    }
                }).end();
                return;
            }
            if (shopId != null) {
                res.json({
                    Error: {
                        Message: "无权修改客户归属信息"
                    }
                }).end();
                return;
            }
        } else {
            if (shopId != null) {
                if (await util.getRoleAsync(shopId) != "normal") {
                    res.json({
                        Error: {
                            Message: "客户归属只能修改为分店"
                        }
                    });
                    return;
                }
                instance.set('ShopId', shopId);
            }
        }
        if (customerId != null && phone != null) {
            instance.set("Phone", phone);
        }
        if (recommendCustomerId != null) instance.set('RecommendCustomerId', recommendCustomerId);
        if (status != null) instance.set('Status', status);
        if (address != null) instance.set('Address', address);
        if (name != null) instance.set('Name', name);
        if (sex != null) instance.set('Sex', sex);
        if (age != null) instance.set('Age', age);
        instance.save().then((row) => {
            res.json({
                Data: row
            }).end();
        }).catch((err) => {
            res.json({
                Error: {
                    Message: err
                }
            }).end();
        })
    }
});


router.use('/customers', (req, res) => {
    res.json({
        Error: {
            Message: "无服务： " + req.method
        }
    }).end();
})

router.use((req, res, next) => {
    next();
})
module.exports = router;