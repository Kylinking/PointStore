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
    var queryShopID = req.query.ShopID || '';
    var phone = req.query.Phone || '';
    var page = parseInt(req.query.Page || 1);
    var pageSize = parseInt(req.query.Size || 20);
    var offset = (page - 1) * pageSize;

    var whereObj = {};
    if (phone != '') whereObj.Phone = {
        [Op.like]: '%' + phone + '%'
    };

    var instance = undefined;
    if (util.isSuperman(operateShopID)) {
        if (queryShopID != '' && queryShopID != operateShopID) {
            if (util.isAdminShop(queryShopID)) {
                //取总店下所有分店的客户信息
                instance = await customerInfo.findAndCountAll({
                    where: whereObj,
                    include: [{
                        model: shopInfo,
                        where: {
                            ParentShopID: queryShopID
                        }
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
                        required:true
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
                    required:true
                }],
                limit: pageSize,
                offset: offset
            })
        }
    } else if (util.isAdminShop(operateShopID)) {
        if (queryShopID != '') {
            if (util.isSuperman(queryShopID)) {
                // 报错
                res.json({
                    error: {
                        message: "无权限"
                    }
                }).end();
                return;
            } else if (util.isAdminShop(queryShopID)) {
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
                            required:true
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
                }],
                limit: pageSize,
                offset: offset
            });
        }
    } else {
        if (queryShopID != '' && queryShopID != operateShopID) {
            // 报错
            res.json({
                error: {
                    message: "无权限"
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
                    required:true
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
     
router.post('/customers', (req, res) => {
    var customerInfo = res.locals.db.CustomerInfo;
    var logger = res.locals.logger;
    var phone = req.body.Phone || '';
    var status = req.body.Status || '';
    var name = req.body.Name || '';
    var address = req.body.Address || '';
    var sex = req.body.Sex || '';
    var age = req.body.Age || '';
    var operateShopID = res.locals.ShopID;
    if (util.isAdminShop(operateShopID)) {
        res.json({
            error: {
                message: "无权修改客户信息"
            }
        }).end();
        return;
    }
    [phone, status, sex, name].forEach(elem => {
        if (elem == '') {
            res.json({
                error: {
                    Message: "CustomerID,Phone,Sex,Status不能为空！"
                }
            });
            return;
        }
    })
    customerInfo.create({
        Name: name,
        Address: address,
        Status: parseInt(status),
        Phone: phone,
        Sex: sex,
        Age: age,
        ShopID: operateShopID
    }).then((row) => {
            logger.info("CustomerInfo insert Values(" +
                row.dataValues.CustomerID + " " +
                name + " " +
                address + " " +
                phone + " " +
                sex + " " +
                age + ')');
            res.json({
                data: {
                    CustomerID: row.dataValues.CustomerID,
                    Name: name,
                    Address: address,
                    Status: parseInt(status),
                    Phone: phone,
                    Sex: sex,
                    Age: parseInt(age),
                    ShopID: operateShopID
                }
            }).end();
        },
        error => {
            res.json({
                error: {
                    message: error
                }
            }).end();
        });
});

router.delete('/customers', async (req, res) => {
    var customerInfo = res.locals.db.CustomerInfo;
    var logger = res.locals.logger;
    var operateShopID = res.locals.ShopID;
    var customerID = req.body.CustomerID || '';
    var phone = req.body.Phone || '';
    if (util.isAdminShop(operateShopID)) {
        res.json({
            error: {
                message: "无权修改客户信息"
            }
        }).end();
        return;
    }
    if (customerID == '' && phone == '') {
        res.json({
            error: {
                message: "CustomerID and Phone can't be NULL at sametime"
            }
        }).end();
    } else {
        var instance = await customerInfo.findOne({
            where: {
                [Op.or]: [{
                        CustomerID: customerID
                    },
                    {
                        Phone: {
                            [Op.like]: '%' + phone + '%'
                        }
                    }
                ]
            }
        });
        if (instance) {
            //console.log(instance);
            if (instance.dataValues.Status == 0) {
                res.json({
                    error: {
                        message: "该客户已注销"
                    }
                }).end();
                return;
            }
            if (customerID != '') {
                customerInfo.update({
                    Status: 0
                }, {
                    where: {
                        CustomerID: customerID
                    },
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
                })
            } else {
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
                })
            }
        } else {
            res.json({
                error: {
                    message: "客户不存在"
                }
            }).end();
        }
    }
});

router.patch('/customers', async (req, res) => {
    var customerInfo = res.locals.db.CustomerInfo;
    var logger = res.locals.logger;
    var operateShopID = res.locals.ShopID;
    var phone = req.body.Phone || '';
    var status = req.body.Status || '';
    var name = req.body.Name || '';
    var address = req.body.Address || '';
    var sex = req.body.Sex || '';
    var age = req.body.Age || '';
    if (util.isAdminShop(operateShopID)) {
        res.json({
            error: {
                message: "无权修改客户信息"
            }
        }).end();
        return;
    }
    if (phone == '') {
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
        if (status != '') instance.set('Status', status);
        if (address != '') instance.set('Address', address);
        if (name != '') instance.set('Name', name);
        if (sex != '') instance.set('Sex', sex);
        if (age != '') instance.set('Age', age);
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