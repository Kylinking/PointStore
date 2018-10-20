'use strict';
let util = require('../../../../util/util');
let express = require('express');
let router = express.Router();
const Op = require('sequelize').Op;

router.get('/customers', async (req, res) => {
    let customerInfo = res.locals.db.CustomerInfo;
    let shopInfo = res.locals.db.ShopInfo;
    let db = res.locals.db;
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
    try {
        let operateShop = await db.ShopInfo.findOne({
            where: {
                ShopId: operateShopId
            }
        });
        let queryShop = null;
        if (queryShopId !== null) {
            queryShop = await db.ShopInfo.findOne({
                where: {
                    ShopId: queryShopId
                }
            });
            if (queryShop == null) {
                throw `ShopId:${queryShopId}店面不存在`;
            }
        }
        let includeObj = [{
            model: shopInfo,
            required: true
        }, {
            model: customerInfo,
            as: "RecommendCustomerInfo",
            required: false
        }];
        switch (operateShop.Type) {
            case 0:
                if (queryShopId != null) {
                    if (queryShop.Type == 1) {
                        whereObj.ShopId = queryShopId;
                    } else if (queryShop.Type == 2) {
                        whereObj.ShopId = queryShop.ParentShopId;
                    }
                }
                break;
            case 1:
                if (queryShopId != null) {
                    if (queryShop.Type == 1) {
                        if (queryShopId != operateShopId) {
                            throw `无权限查询ShopId:${queryShopId}店面客户信息`;
                        }
                        whereObj.ShopId = queryShopId;
                    } else if (queryShop.Type == 2) {
                        if (queryShop.ParentShopId != operateShopId) {
                            throw `无权限查询ShopId:${queryShopId}店面客户信息`;
                        }
                        whereObj.ShopId = queryShop.ParentShopId;
                    } else {
                        throw `无权查询ShopId:${queryShopId}客户信息`
                    }
                } else {
                    whereObj.ShopId = operateShopId;
                }
                break;
            default:
                whereObj.ShopId = operateShop.ParentShopId;
                break;
        }
        logger.info(`whereObj:${whereObj},include:${includeObj}`);
        let instance = await customerInfo.findAndCountAll({
            where: whereObj,
            include: includeObj,
            limit: pageSize,
            offset: offset
        });
        let json = {
            Array: [],
            Meta: {}
        };
        let pages = Math.ceil(instance.count / pageSize);
        for (let row of instance.rows) {
            //add CustomerAccountInfo to records
            let value = row.dataValues;
            let record = await db.CustomerAccountInfo.findOne({
                where: {
                    CustomerId: row.CustomerId
                }
            })
            value["CustomerAccountInfo"] = record;
            json.Array.push(value);
        }
        json.Meta["TotalPages"] = pages;
        json.Meta["CurrentRows"] = instance.rows.length;
        json.Meta["TotalRows"] = instance.count;
        json.Meta["CurrentPage"] = page;
        logger.info(json);
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
    let recommendCustomerId = null;
    let recommendPhone = isNaN(util.checkPhone(req.body.Recommend)) ? null : req.body.Recommend;
    logger.info(`phone:${phone},status:${status},name:${name},sex:${sex},age:${age},recommend:${recommendPhone}`);
    [phone, sex, name].forEach(elem => {
        if (elem == null) {
            res.json({
                Error: {
                    Message: "Name,Phone,Sex不能为空！"
                }
            });
            return;
        }
    });
    let operatedShop = undefined;
    let queryShop = undefined;
    try {
        operatedShop = await res.locals.db.ShopInfo.findOne({
            where: {
                ShopId: operateShopId
            }
        });
        if (shopId != null) {
            queryShop = await res.locals.db.ShopInfo.findOne({
                where: {
                    ShopId: shopId
                }
            });
        }
        let createCondition = {
            Name: name,
            Address: address,
            Status: status,
            Phone: phone,
            Sex: sex,
            Age: age,
        };
        if (operatedShop.Type === 1) {
            createCondition.ShopId = operateShopId;
        } else if (operatedShop.Type === 0) {
            if (shopId == null || await util.isSupermanAsync(shopId)) {
                throw "需要客户归属总店Id"
            } else {
                if (queryShop.Type == 1) {
                    createCondition.ShopId = shopId;
                } else if (queryShop.Type == 2) {
                    createCondition.ShopId = queryShop.ParentShopId;
                }
            }
        } else {
            if (shopId !== null && shopId !== operatedShop.ParentShopId) {
                throw `无权创建该店面客户信息,ShopId:${shopId}.`;
            } else {
                createCondition.ShopId = operatedShop.ParentShopId;
            }
        }
        if (recommendPhone != null) {
            let recommendCustomer = await res.locals.db.CustomerInfo.findOne({
                where: {
                    Phone: recommendPhone
                }
            });
            logger.info(recommendCustomer);
            if (recommendCustomer != null) {
                recommendCustomerId = recommendCustomer.CustomerId;

                if (!await util.isBelongsToByIdAsync(recommendCustomerId, createCondition.ShopId)) {
                    throw "推荐人电话号码不是本店会员号码";
                } else {
                    createCondition.RecommendCustomerId = recommendCustomerId;
                }
            }
        }
        logger.info(`createCondition:${createCondition.toString()}`);
        res.locals.db.sequelize.transaction(transaction => {
            return customerInfo.create(createCondition, {
                    transaction: transaction
                })
                .then((row) => {
                    res.json({
                        Object: row
                    }).end();
                    logger.info(row);
                    return res.locals.db.CustomerAccountInfo.create({
                        CustomerId: row.CustomerId,
                        ShopBounusPoints: 0,
                        RecommendPoints: 0,
                        IndirectRecommendPoints: 0,
                        ThirdRecommendPoints: 0,
                        CustomedPoints: 0,
                        RemainPoints: 0,
                        ChargedMoney: 0,
                        CustomedMoney: 0,
                        RemainMoney: 0,
                    }, {
                        transaction: transaction
                    });
                })
                .catch(
                    error => {
                        logger.error(error);
                        if (error.name != null) {
                            if (error.errors[0].type == "unique violation") {
                                error = "客户联系电话已存在";
                            }
                        }
                        res.json({
                            Error: {
                                Message: error
                            }
                        }).end();
                    }
                );
        });
    } catch (error) {
        logger.error(error);
        res.json({
            Error: {
                Message: error
            }
        }).end();
    }
});

router.delete('/customers', async (req, res) => {
    let customerInfo = res.locals.db.CustomerInfo;
    let logger = res.locals.logger;
    let db = res.locals.db;
    let operateShopId = res.locals.shopid;
    let phone = isNaN(util.checkPhone(req.body.Phone)) ? null : req.body.Phone;
    if (phone == null) {
        res.json({
            Error: {
                Message: "客户电话不能为空"
            }
        }).end();
        return;
    }
    let operateShop = await db.ShopInfo.findOne({
        where: {
            ShopId: operateShopId
        }
    });
    let whereObj = {
        Phone: phone
    };
    switch (operateShop.Type) {
        case 2:
            whereObj.ShopId = operateShop.ParentShopId;
            break;
        case 1:
            whereObj.ShopId = operateShopId;
            break;
        default:
            break;
    }

    let instance = await customerInfo.findOne({
        where: whereObj
    });
    if (instance) {
        if (instance.Status == 0) {
            res.json({
                Error: {
                    Message: "该客户已注销"
                }
            }).end();
            return;
        }
        instance.set('Status', 0);
        instance.save().then((row) => {
            res.json({
                Object: row
            }).end();
        }).catch((error) => {
            res.json({
                Error: {
                    Message: "数据写入失败"
                }
            }).end();
        });
    } else {
        logger.info(`无此客户`);
        res.json({
            Error: {
                Message: "无此客户"
            }
        }).end();
    }
});

router.patch('/customers', async (req, res) => {
    let customerInfo = res.locals.db.CustomerInfo;
    let logger = res.locals.logger;
    let operateShopId = res.locals.shopid;
    let db = res.locals.db;
    let phone = isNaN(util.checkPhone(req.body.Phone)) ? null : req.body.Phone;
    let status = util.makeNumericValue(req.body.Status, null);
    let name = req.body.Name || null;
    let address = req.body.Address || null;
    let sex = req.body.Sex || null;
    let age = util.makeNumericValue(req.body.Age, null);
    let customerId = util.makeNumericValue(req.body.customerid, null);
    let recommendCustomerId = util.makeNumericValue(req.body.RecommendCustomerId, null);
    logger.info(`PATCH /customers`);
    logger.info(`phone:${phone},status:${status},name:${name},address:${address},age:${age}`);
    if (customerId == null && phone == null) {
        logger.error(err);
        res.json({
            Error: {
                Message: "Phone和CustomerId不能同时为空"
            }
        }).end();
        return;
    }
    let operateShop = await db.ShopInfo.findOne({
        where: {
            ShopId: operateShopId
        }
    });
    let whereObj = {};
    if (customerId != null) {
        whereObj.CustomerId = customerId;
    } else {
        whereObj.Phone = phone;
    }
    switch (operateShop.Type) {
        case 0:
            break;
        case 1:
            whereObj.ShopId = operateShopId;
            break;
        default:
            whereObj.ShopId = operateShop.ParentShopId;
            break;
    }
    let instance = await customerInfo.findOne({
        where: whereObj
    });
    if (instance) {
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
                Object: row
            }).end();
        }).catch((err) => {
            logger.error(err);
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