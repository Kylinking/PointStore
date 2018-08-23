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
    var queryShopID = util.makeNumericValue(req.query.ShopID, null);
    var phone = isNaN(util.checkPhone(req.query.Phone)) ? null : req.query.Phone;
    var page = util.makeNumericValue(req.query.Page, 1);
    var pageSize = util.makeNumericValue(req.query.Size, 20);
    var name = req.query.Name || null;
    var offset = (page - 1) * pageSize;
    var recommendID = util.makeNumericValue(req.query.RecommendCustomerID,null);
    var whereObj = {};
    if (phone != null) whereObj.Phone = {
        [Op.like]: `%${phone}%`
    };
    if (name != null) whereObj.Name = {
        [Op.like]: `%${name}%`
    };
    if (recommendID != null) {
        whereObj.RecommendCustomerID = recommendID;
    };
    var role = await util.getRoleAsync(operateShopID);
    logger.info(`role:${role},queryShopID${queryShopID}`);
    var instance = undefined;
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
                        error: {
                            message: "无权限"
                        }
                    }).end();
                    return;
                } else if (await util.isAdminShopAsync(queryShopID)) {
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
    } catch (error) {
        logger.error(error);
        res.json({
            error: {
                message: error
            }
        }).end();
        return;
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
    var phone = isNaN(util.checkPhone(req.body.Phone)) ? null : req.body.Phone;
    var status = util.makeNumericValue(req.body.Status, 1);
    var name = req.body.Name || null;
    var address = req.body.Address || null;
    var sex = req.body.Sex || null;
    var age = util.makeNumericValue(req.body.Age, null);
    var operateShopID = res.locals.ShopID;
    var shopID = util.makeNumericValue(req.body.ShopID, null);
    var recommendCustomerID = util.makeNumericValue(req.body.RecommendCustomerID, null);
    logger.info(`phone:${phone},status:${status},name:${name},sex:${sex},age:${age},recommend:${recommendCustomerID}`);
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

    var role = await util.getRoleAsync(operateShopID);
    var createCondition = {
        Name: name,
        Address: address,
        Status: status,
        Phone: phone,
        Sex: sex,
        Age: age,
    };
    if (role == 'admin') {
        res.json({
            error: {
                message: "无权创建客户信息"
            }
        }).end();
        return;
    } else if (role == 'superman') {
        if (shopID == null || await util.isAdminShopAsync(shopID)) {
            res.json({
                error: {
                    message: "需要客户归属分店ID"
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
                error: {
                    message: "无权创建其它店面客户信息"
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
                    logger.error(error);
                    res.json({
                        error: {
                            message: error
                        }
                    }).end();
                }
            );
    });
});

router.delete('/customers', async (req, res) => {
    var customerInfo = res.locals.db.CustomerInfo;
    var logger = res.locals.logger;
    var operateShopID = res.locals.ShopID;
    var phone = isNaN(util.checkPhone(req.body.Phone)) ? null : req.body.Phone;
    var role = await util.getRoleAsync(operateShopID);
    if (role == 'admin') {
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
        if (role != 'superman') {
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
            instance.reload().then(()=>{
                res.json({
                    data: instance
                }).end();
            }
            )
            
        }).catch(
            error => {
                logger.error(error);
                res.json({
                    error: {
                        message: error
                    }
                }).end();
            });
    } else {
        logger.info(`客户不存在`);
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
    var phone = isNaN(util.checkPhone(req.body.Phone)) ? null : req.body.Phone;
    var status = util.makeNumericValue(req.body.Status, null);
    var name = req.body.Name || null;
    var address = req.body.Address || null;
    var sex = req.body.Sex || null;
    var age = util.makeNumericValue(req.body.Age, null);
    var shopID = util.makeNumericValue(req.body.ShopID, null);
    var customerID = util.makeNumericValue(req.body.CustomerID, null);
    var role = await util.getRoleAsync(operateShopID);
    var recommendCustomerID = util.makeNumericValue(req.body.RecommendCustomerID, null);
    if (role == 'admin') {
        logger.info(`总店无权修改客户信息`)
        res.json({
            error: {
                message: "无权修改客户信息"
            }
        }).end();
        return;
    }
    if (customerID == null && phone == null) {
        res.json({
            error: {
                message: "Phone和CustomerID不能同时为空"
            }
        }).end();
        return;
    }
    var whereObj = {};
    if (customerID != null){
        whereObj.CustomerID = customerID;
    }else{
        whereObj.Phone = phone;
    }
    var instance = await customerInfo.findOne({
        where: whereObj
    });
    if (instance) {
        if (!role != 'superman') {
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
                if (await util.getRoleAsync(shopID) != "normal"){
                    res.json({
                        error:{
                            message:"客户归属只能修改为分店"
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
                data:row
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