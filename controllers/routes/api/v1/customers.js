'use strict';
var util = require('../../../../util/util');
var express = require('express');
var router = express.Router();
const Op = require('sequelize').Op;


router.get('/customers', async (req, res) => {
    var customerInfo = res.locals.db.CustomerInfo;
    var logger = res.locals.logger;
    var operateShopID = res.locals.ShopID;
    var queryShopID = req.query.ShopID || '';
    var userPhone = req.query.Phone || '';
    var page = parseInt(req.query.Page || 1);
    var pageSize = parseInt(req.query.Size || 20);
    var offset = (page - 1) * pageSize;
    var pages = Math.ceil(await customerInfo.count() / pageSize);
    if (page > pages) {
        logger.warn("查询分页溢出");
        json["Pages"] = Math.ceil(pages);
        json["Size"] = pageSize;
        json["Message"] = "查询分页溢出";
        res.json(json).end();
        return;
    }
    var json = {
        data: []
    };
    if (!util.isAdminShop(operateShopID)) {
        if (queryShopID != '' && queryShopID != operateShopID){
            res.json({error:{message:"无权限查询其它分店客户."}}).end();
            return;
        }
        var whereObj = { ShopID: operateShopID };
        if (userPhone != '') {
            whereObj.Phone = userPhone;
        }
        customerInfo.findAll({
            where: whereObj,
            limit: pageSize,
            offset: offset
        }).then(results => {
            results.forEach(result => {
                json.data.push(result);
            });
            json["Pages"] = Math.ceil(pages);
            json["Size"] = pageSize;
            res.json(json).end();
        }, error => {
            res.json({
                error: {
                    message: error.message
                }
            }).end();
        })
    } else {
        //Todo add userPhone & queryShopID conditions.
        var whereObj = {};
        if (userPhone != '') {
            whereObj.Phone = userPhone;
        }
        if (queryShopID != '') {
            whereObj.ShopID = queryShopID;
        }
        customerInfo.findAll({
            where: whereObj,
            limit: pageSize,
            offset: offset
        }).then(results => {
            results.forEach(result => {
                json.data.push(result);
            });
            json["Pages"] = Math.ceil(pages);
            json["Size"] = pageSize;
            res.json(json).end();
        }, error => {
            res.json({
                error: {
                    message: error.message
                }
            }).end();
        });
    }
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
                        [Op.like]:'%'+phone+'%'
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
    if (phone == ''){
        res.json({
            error: {
                message: "电话不能为空"
            }
        }).end();
        return;
    }
    var instance = await customerInfo.findOne({
        where:{
            Phone:phone
        }
    });
    if (instance){
        if (status != '') instance.set('Status',status);
        if (address != '') instance.set('Address',address);
        if (name != '') instance.set('Name',name);
        if (sex != '') instance.set('Sex',sex);
        if (age !='') instance.set('Age',age);
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
        }).catch((err)=>{
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