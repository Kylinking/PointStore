'use strict';
var express = require('express');
var router = express.Router();
const Op = require('sequelize').Op;

router.get('/customers', (req, res) => {
    res.end('customers');
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
    [phone, status, sex].forEach(elem => {
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
        Age: age
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
                    Age: parseInt(age)
                }
            }).end();
        },
        error => {
            res.json({
                error: {
                    Message: error
                }
            }).end();
        });
});

router.delete('/customers', async (req, res) => {
    var customerInfo = res.locals.db.CustomerInfo;
    var logger = res.locals.logger;
    var customerID = req.body.CustomerID || '';
    var phone = req.body.Phone || '';

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
                        Phone: phone
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
                            Age: instance.dataValues.Age
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
                        data: row.dataValues
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

router.patch('/customers', (req, res) => {
    res.end('customers');
});


router.use('/customers', (req, res) => {
    res.status(401);
    res.json({
        error: {
            message: "No Service with " + req.method
        }
    }).end();
})

router.use((req, res, next) => {
    next();
})
module.exports = router;