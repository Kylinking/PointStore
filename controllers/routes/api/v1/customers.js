'use strict';
let util = require('../../../../util/util');
let express = require('express');
let router = express.Router();
const Op = require('sequelize').Op;

router.get('/customers', async (req, res) => {
    let customerInfo = res.locals.db.CustomerInfo;
    let shopInfo = res.locals.db.ShopInfo;
    let logger = res.locals.logger;
    let operateShopID = res.locals.shopid;
    let queryShopID = util.makeNumericValue(req.query.ShopId, null);
    let phone = isNaN(util.checkPhone(req.query.Phone)) ? null : req.query.Phone;
    let page = util.makeNumericValue(req.query.Page, 1);
    let pageSize = util.makeNumericValue(req.query.Size, 20);
    let name = req.query.Name || null;
    let offset = (page - 1) * pageSize;
    let recommendID = util.makeNumericValue(req.query.RecommendCustomerId,null);
    let whereObj = {};
    if (phone != null) whereObj.Phone = {
        [Op.like]: `%${phone}%`
    };
    if (name != null) whereObj.Name = {
        [Op.like]: `%${name}%`
    };
    if (recommendID != null) {
        whereObj.RecommendCustomerID = recommendID;
    };
    let role = await util.getRoleAsync(operateShopID);
    logger.info(`role:${role},queryShopID${queryShopID}`);
    let instance = undefined;
    try {
        if (role == 'superman') {
            if (queryShopID != null && queryShopID != operateShopID) {
                if (await util.isAdminShopAsync(queryShopID)) {
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
        } else if (role == 'admin') {
            if (queryShopID != null) {
                if (await util.isSupermanAsync(queryShopID)) {
                    // 报错
                    res.json({
                        Error: {
                            Message: "无权限"
                        }
                    }).end();
                    return;
                } else if (await util.isAdminShopAsync(queryShopID)) {
                    if (queryShopID != operateShopID) {
                        //报错
                        res.json({
                            Error: {
                                Message: "无权限取其它总店客户信息"
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
                            Error: {
                                Message: "无权限取其它总店客户信息"
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
                    Error: {
                        Message: "无权限取其它分店客户信息"
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
    } catch (error) {
        logger.error(error);
        res.json({
            Error: {
                Message: error
            }
        }).end();
        return;
    }
    let json = {
        Data: []
    };
    let pages = Math.ceil(instance.count / pageSize);
    instance.rows.forEach(row => {
        json.Data.push(row);
    });
    json["Pages"] = Math.ceil(pages);
    json["Size"] = pageSize;
    res.json(json).end();
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
    let operateShopID = res.locals.shopid;
    let shopID = util.makeNumericValue(req.body.ShopId, null);
    let recommendCustomerID = util.makeNumericValue(req.body.RecommendCustomerId, null);
    logger.info(`phone:${phone},status:${status},name:${name},sex:${sex},age:${age},recommend:${recommendCustomerID}`);
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

    let role = await util.getRoleAsync(operateShopID);
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
        if (shopID == null || await util.isAdminShopAsync(shopID)) {
            res.json({
                Error: {
                    Message: "需要客户归属分店ID"
                }
            }).end();
            return;
        }
        if (!await util.isBelongsToByIDAsync(recommendCustomerID, shopID)) {
            createCondition.RecommendCustomerID = null;
        } else {
            createCondition.RecommendCustomerID = recommendCustomerID;
        }
        createCondition.ShopID = shopID;
    } else {
        if (shopID !== null && shopID != operateShopID) {
            res.json({
                Error: {
                    Message: "无权创建其它店面客户信息"
                }
            }).end();
            return;
        }
        if (!await util.isBelongsToByIDAsync(recommendCustomerID, operateShopID)) {
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
                    Data: row
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
    let operateShopID = res.locals.shopid;
    let phone = isNaN(util.checkPhone(req.body.Phone)) ? null : req.body.Phone;
    let role = await util.getRoleAsync(operateShopID);
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
            if (instance.ShopID != operateShopID) {
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
            instance.reload().then(()=>{
                res.json({
                    Data: instance
                }).end();
            }
            )
            
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
    let operateShopID = res.locals.shopid;
    let phone = isNaN(util.checkPhone(req.body.Phone)) ? null : req.body.Phone;
    let status = util.makeNumericValue(req.body.Status, null);
    let name = req.body.Name || null;
    let address = req.body.Address || null;
    let sex = req.body.Sex || null;
    let age = util.makeNumericValue(req.body.Age, null);
    let shopID = util.makeNumericValue(req.body.ShopId, null);
    let customerID = util.makeNumericValue(req.body.customerid, null);
    let role = await util.getRoleAsync(operateShopID);
    let recommendCustomerID = util.makeNumericValue(req.body.RecommendCustomerId, null);
    if (role == 'admin') {
        logger.info(`总店无权修改客户信息`)
        res.json({
            Error: {
                Message: "无权修改客户信息"
            }
        }).end();
        return;
    }
    if (customerID == null && phone == null) {
        res.json({
            Error: {
                Message: "Phone和CustomerID不能同时为空"
            }
        }).end();
        return;
    }
    let whereObj = {};
    if (customerID != null){
        whereObj.CustomerID = customerID;
    }else{
        whereObj.Phone = phone;
    }
    let instance = await customerInfo.findOne({
        where: whereObj
    });
    if (instance) {
        if (role != 'superman') {
            if (instance.ShopID != operateShopID) {
                res.json({
                    Error: {
                        Message: "无权修改别家分店客户信息"
                    }
                }).end();
                return;
            }
            if (shopID != null) {
                res.json({
                    Error: {
                        Message: "无权修改客户归属信息"
                    }
                }).end();
                return;
            }
        } else {
            if (shopID != null) {
                if (await util.getRoleAsync(shopID) != "normal"){
                    res.json({
                        Error:{
                            Message:"客户归属只能修改为分店"
                        }
                    });
                    return ;
                }
                instance.set('ShopID', shopID);
            }
        }
        if (customerID != null && phone != null){
            instance.set("Phone",phone);
        }
        if (recommendCustomerID != null) instance.set('RecommendCustomerID', recommendCustomerID);
        if (status != null) instance.set('Status', status);
        if (address != null) instance.set('Address', address);
        if (name != null) instance.set('Name', name);
        if (sex != null) instance.set('Sex', sex);
        if (age != null) instance.set('Age', age);
        instance.save().then((row) => {
            res.json({
                Data:row
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