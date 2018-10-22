'use strict';
let util = require('../../../../util/util');
let express = require('express');
const SMSClient = require('@alicloud/sms-sdk');
const globalConfig = require('../../../../config/global.json');
const secretAccessKey = globalConfig.sms.secretAccessKey;
const accessKeyId = globalConfig.sms.accessKeyId;
let router = express.Router();
const Op = require('sequelize').Op;
router.get('/userpoints', async (req, res) => {
    let logger = res.locals.logger;
    let db = res.locals.db;
    let phone = isNaN(util.checkPhone(req.query.Phone)) ? null : req.query.Phone;
    let shopId = util.makeNumericValue(req.query.ShopId, null);
    let page = util.makeNumericValue(req.query.Page, 1);
    let pageSize = util.makeNumericValue(req.query.Size, 20);
    let offset = (page - 1) * pageSize;
    let acctInfo = res.locals.db.CustomerAccountInfo;
    let operateShopId = res.locals.shopid;
    let whereCustomerInfoObj = {};
    try {
        let operateShop = await db.ShopInfo.findOne({
            where: {
                ShopId: operateShopId
            }
        });
        if (phone != null) {
            whereCustomerInfoObj.Phone = phone;
        }
        logger.info(`Phone:${phone},`);
        let queryShop = null;
        if (shopId != null) {
            queryShop = await db.ShopInfo.findOne({
                where: {
                    ShopId: shopId
                }
            });
            if (queryShop == null) {
                throw `ShopId:${shopId}店面不存在`;
            }
        }
        logger.info("operateShop:");
        logger.info(operateShop);
        logger.info("queryShop:");
        logger.info(queryShop);
        switch (operateShop.Type) {
            case 0:
                if (shopId != null) {
                    if (queryShop.Type == 1) {
                        whereCustomerInfoObj.ShopId = shopId;
                    } else if (queryShop.Type == 2) {
                        whereCustomerInfoObj.ShopId = queryShop.ParentShopId;
                    }
                }
                break;
            case 1:
                if (shopId != null) {
                    if (queryShop.Type == 1) {
                        if (shopId != operateShopId) {
                            throw `无权限查询ShopId:${shopId}店面客户账户`;
                        }
                        whereCustomerInfoObj.ShopId = operateShopId;
                    } else if (queryShop.Type == 2) {
                        if (queryShop.ParentShopId != operateShopId) {
                            throw `无权限查询ShopId:${shopId}店面客户账户`;
                        }
                        whereCustomerInfoObj.ShopId = queryShop.ParentShopId;
                    } else {
                        throw `无权查询ShopId:${shopId}店面客户账户`;
                    }
                } else {
                    whereCustomerInfoObj.ShopId = operateShopId;
                }
                break;
            default:
                whereCustomerInfoObj.ShopId = operateShop.ParentShopId;
                break;
        }
        logger.info(whereCustomerInfoObj);
        let instance = await acctInfo.findAndCountAll({
            include: [{
                model: db.CustomerInfo,
                where: whereCustomerInfoObj,
                include: [{
                    model: db.ShopInfo,
                    where: {},
                    require: true
                }]
            }],
            offset: offset,
            limit: pageSize
        })
        if (instance) {
            logger.info(instance);
            let pages = Math.ceil(instance.count / pageSize);
            let json = {
                Array: [],
                Meta: {}
            };
            instance.rows.forEach((row) => {
                json.Array.push(row);
            });
            json.Meta["TotalPages"] = pages;
            json.Meta["CurrentRows"] = instance.rows.length;
            json.Meta["TotalRows"] = instance.count;
            json.Meta["CurrentPage"] = page;
            res.json(json).end();
        } else {
            throw "无此账户信息";
        }
    } catch (err) {
        logger.error(err);
        res.json({
            Error: {
                Message: err
            }
        }).end();
    }
});

router.post('/userpoints', async (req, res) => {
    let logger = res.locals.logger;
    let phone = !isNaN(util.checkPhone(req.body.Phone)) ? util.checkPhone(req.body.Phone) : 0;
    let db = res.locals.db;
    let sequelize = db.sequelize;
    let operateShopId = res.locals.shopid;
    let costPoints = util.makeNumericValue(req.body.CostPoint, 0);
    let costOrigin = util.makeNumericValue(req.body.CostMoney, 0);
    let costMoney = costOrigin;
    let rechargedMoney = util.makeNumericValue(req.body.RechargedMoney, 0);
    let bounus = 0
    let recommendPoints = 0
    let indirectRecommendPoints = 0
    let pointToMoney = 0;
    let thirdRecommendPoints = 0;
    logger.info(`phone: ${phone}, operateShopId: ${operateShopId}, 
         costMoney: ${costMoney},rechargedMoney:${rechargedMoney}`);
    if (phone == null) {
        res.json({
            Error: {
                Message: '客户号码参数不能为空'
            }
        }).end();
        return
    }
    if (costMoney < 0 || rechargedMoney < 0) {
        res.json({
            Error: {
                Message: '交易金额和积分须大于0'
            }
        }).end();
        return;
    }
    if (costMoney == 0 && rechargedMoney == 0) {
        res.json({
            Error: {
                Message: '需输入充值或交易金额'
            }
        }).end();
        return;
    }

    let operateShop = await db.ShopInfo.findOne({
        where: {
            ShopId: operateShopId
        }
    });

    logger.info(operateShop.Type);
    if (operateShop.Type == 1) {
        res.json({
            Error: {
                Message: '总店无权完成操作'
            }
        }).end();
        return;
    }

    if (!await util.isBelongsToByPhoneAsync(phone, operateShop.ParentShopId)) {
        res.json({
            Error: {
                Message: '无权操作其它总店客户账户'
            }
        }).end();
        return;
    }
    let customerInfo = null;
    let customerAccountInfo = null;
    let recommendCustomerInfo = null;
    let indirectRecommendCustomerInfo = null;
    let thirdRecommendCustomerInfo = null;
    let recommendCustomerAccountInfo = null;
    let indirectRecommendCustomerAccountInfo = null;
    let thirdRecommendCustomerAccountInfo = null;
    let date = Date.parse(Date());
    logger.info(date);
    let adminBounusRate = await db.BounusPointRate.findOne({
        where: {
            ShopId: operateShop.ParentShopId
        }
    });
    let adminShopInfo = null;
    //用户账户表、用户账户变动表、店铺账户表、店铺账户变动表、明细表
    sequelize.transaction(transaction => {
            return db.CustomerInfo.findOne({
                    where: {
                        Phone: phone,
                    },
                }, {
                    transaction: transaction
                })
                .then(async (row) => {
                    if (row.ShopId != operateShop.ParentShopId) {
                        throw '无权操作其它总店客户账户';
                    }
                    customerInfo = row;
                    if (customerInfo.Status != 1) {
                        throw "用户状态不正确，本次交易拒绝。";
                    }
                    recommendCustomerInfo = await getRecommendCustomer(customerInfo);
                    recommendCustomerInfo && logger.info(recommendCustomerInfo.toJSON());

                    indirectRecommendCustomerInfo = await getRecommendCustomer(recommendCustomerInfo);
                    indirectRecommendCustomerInfo && logger.info(indirectRecommendCustomerInfo.toJSON());

                    thirdRecommendCustomerInfo = await getRecommendCustomer(indirectRecommendCustomerInfo);
                    thirdRecommendCustomerInfo && logger.info(thirdRecommendCustomerInfo.toJSON());

                    let shopAcctChangeRecommendPointAmount = 0;

                    adminShopInfo = await db.ShopInfo.findOne({
                        where: {
                            ShopId: customerInfo.ShopId
                        }
                    }, {
                        transaction: transaction
                    });

                    let bounusRate = await db.BounusPointRate.findOne({
                        where: {
                            ShopId: operateShopId
                        }
                    }, {
                        transaction: transaction
                    });
                    logger.info(`bounusRate.Level:${bounusRate.Level}`);
                    switch (bounusRate.Level) {
                        case 1:
                            bounusRate = adminBounusRate;
                            break;
                        case 0:
                            bounusRate = await db.BounusPointRate.findOne({
                                where: {
                                    ShopId: 1
                                }
                            }, {
                                transaction: transaction
                            });
                            break;
                        default:
                            break;
                    }

                    customerAccountInfo = await findAccountInfo(db, customerInfo.CustomerId, transaction);

                    if (costPoints != 0) {
                        pointToMoney = customerAccountInfo.RemainPoints * adminBounusRate.PointToMoneyRate;
                        if (costMoney <= pointToMoney) {
                            costPoints = costMoney / adminBounusRate.PointToMoneyRate;
                            costMoney = 0;
                        } else {
                            costMoney -= pointToMoney;
                            costPoints = customerAccountInfo.RemainPoints;
                        }
                        pointToMoney = costPoints * adminBounusRate.PointToMoneyRate;
                    }
                    logger.info(`bounusRate: RecommendRate:${bounusRate.RecommendRate},Indirect:${bounusRate.IndirectRecommendRate},Third:${bounusRate.ThirdRecommendRate},ShopBounus:${bounusRate.ShopBounusPointRate}`);
                    recommendPoints = Math.floor(costMoney * bounusRate.RecommendRate);
                    indirectRecommendPoints = Math.floor(costMoney * bounusRate.IndirectRecommendRate);
                    thirdRecommendPoints = Math.floor(costMoney * bounusRate.ThirdRecommendRate);
                    bounus = Math.floor(costMoney * bounusRate.ShopBounusPointRate);
                    if (customerAccountInfo.RemainMoney + rechargedMoney < costMoney) {
                        // res.json({
                        //     Error: {
                        //         Message: "本次消费余额不足"
                        //     }
                        // }).end();
                        throw ({
                            Message: `本次消费余额不足`,
                            Mount: costMoney - customerAccountInfo.RemainMoney - rechargedMoney
                        });
                    }
                    let transactionOptions = {
                        ChargedMoney: rechargedMoney,
                        CustomedPoints: costPoints,
                        Date: date,
                        CustomedMoney: costMoney,
                        ShopId: operateShopId,
                        CustomerId: customerInfo.CustomerId,
                        PointToMoneyRate: adminBounusRate.PointToMoneyRate,
                        ShopBounusPoints: bounus
                    };
                    let shopAcctInfoOptions = {
                        CustomedMoney: costMoney,
                        ChargedMoney: rechargedMoney,
                        CustomedPoints: costPoints,
                        ShopBounusPoints: bounus,
                    };
                    await db.CustomerAccountInfo.increment({
                        RemainMoney: rechargedMoney - costMoney,
                        ChargedMoney: rechargedMoney,
                        CustomedMoney: costMoney,
                        ShopBounusPoints: bounus,
                        RemainPoints: bounus - costPoints,
                        CustomedPoints: costPoints,
                    }, {
                        where: {
                            CustomerId: customerInfo.CustomerId
                        }
                    }, {
                        transaction: transaction
                    });
                    logger.info("customerInfo CustomerAccountInfo increment ");
                    if (recommendCustomerInfo) {
                        await db.CustomerAccountInfo.increment({
                            RemainPoints: recommendPoints,
                            RecommendPoints: recommendPoints
                        }, {
                            where: {
                                CustomerId: recommendCustomerInfo.CustomerId
                            }
                        }, {
                            transaction: transaction
                        })
                        logger.info("recommendCustomerInfo CustomerAccountInfo increment ");
                        transactionOptions.RecommendPoints = recommendPoints;
                        transactionOptions.RecommendCustomerId = recommendCustomerInfo.CustomerId;
                        shopAcctInfoOptions.RecommendPoints = recommendPoints;
                    }
                    if (indirectRecommendCustomerInfo) {
                        await db.CustomerAccountInfo.increment({
                            RemainPoints: indirectRecommendPoints,
                            IndirectRecommendPoints: indirectRecommendPoints
                        }, {
                            where: {
                                CustomerId: indirectRecommendCustomerInfo.CustomerId
                            }
                        }, {
                            transaction: transaction
                        });
                        logger.info("indirectRecommendCustomerInfo CustomerAccountInfo increment ");
                        transactionOptions.IndirectRecommendPoints = indirectRecommendPoints;
                        transactionOptions.IndirectRecommendCustomerId = indirectRecommendCustomerInfo.CustomerId;
                        shopAcctInfoOptions.RecommendPoints += indirectRecommendPoints;
                    }

                    if (thirdRecommendCustomerInfo) {
                        await db.CustomerAccountInfo.increment({
                            RemainPoints: thirdRecommendPoints,
                            ThirdRecommendPoints: thirdRecommendPoints
                        }, {
                            where: {
                                CustomerId: thirdRecommendCustomerInfo.CustomerId
                            }
                        }, {
                            transaction: transaction
                        });
                        logger.info("thirdRecommendCustomerInfo CustomerAccountInfo increment ");
                        transactionOptions.ThirdRecommendPoints = thirdRecommendPoints;
                        transactionOptions.ThirdRecommendCustomerId = thirdRecommendCustomerInfo.CustomerId;
                        shopAcctInfoOptions.RecommendPoints += thirdRecommendPoints;
                    }

                    let transactionInstance = await db.TransactionDetail.create(
                        transactionOptions, {
                            transaction: transaction
                        }
                    );
                    logger.info("TransactionDetail create");
                    logger.info(transactionInstance.toJSON());
                    logger.info(shopAcctInfoOptions);
                    await db.ShopAccountInfo.increment(
                        shopAcctInfoOptions, {
                            where: {
                                ShopId: {
                                    [Op.or]: [
                                        customerInfo.ShopId,
                                        operateShopId
                                    ]
                                }
                            }
                        }, {
                            transaction: transaction
                        }
                    );
                    logger.info("ShopAccountInfo increment");
                    customerAccountInfo = await findAccountInfo(db, customerInfo.CustomerId, transaction);
                    let custAcctChange = await db.CustomerAccountChange.create({
                        CustomerId: customerInfo.CustomerId,
                        CustomedPoints: costPoints,
                        ShopBounusPoints: bounus,
                        Date: date,
                        ShopId: operateShopId,
                        CustomedMoney: costMoney,
                        ChargedMoney: rechargedMoney,
                        RemainMoney:customerAccountInfo.RemainMoney,
                        RemainPoints:customerAccountInfo.RemainPoints,
                        TransactionSeq: transactionInstance.TransactionSeq
                    }, {
                        transaction: transaction
                    });
                    logger.info("customerInfo CustomerAccountChange create");
                    logger.info(custAcctChange.toJSON());
                    if (recommendCustomerInfo && recommendPoints > 0) {
                        recommendCustomerAccountInfo = await findAccountInfo(db, recommendCustomerInfo.CustomerId, transaction);
                        custAcctChange = await db.CustomerAccountChange.create({
                            CustomerId: recommendCustomerInfo.CustomerId,
                            RecommendPoints: recommendPoints,
                            Date: date,
                            ShopId: operateShopId,
                            RemainMoney:recommendCustomerAccountInfo.RemainMoney,
                            RemainPoints:recommendCustomerAccountInfo.RemainPoints,
                            TransactionSeq: transactionInstance.TransactionSeq
                        }, {
                            transaction: transaction
                        });
                        shopAcctChangeRecommendPointAmount += recommendPoints;
                        logger.info("recommendCustomerInfo CustomerAccountChange create");
                        logger.info(custAcctChange.toJSON());
                        //recommendCustomerAccountInfo = await findAccountInfo(db, recommendCustomerInfo.CustomerId, transaction);
                    } else {
                        recommendPoints = 0;
                    }
                    if (indirectRecommendCustomerInfo && indirectRecommendPoints > 0) {
                        indirectRecommendCustomerAccountInfo = await findAccountInfo(db, indirectRecommendCustomerInfo.CustomerId, transaction);
                        custAcctChange = await db.CustomerAccountChange.create({
                            CustomerId: indirectRecommendCustomerInfo.CustomerId,
                            IndirectRecommendPoints: indirectRecommendPoints,
                            ShopId: operateShopId,
                            Date: date,
                            RemainMoney:indirectRecommendCustomerAccountInfo.RemainMoney,
                            RemainPoints:indirectRecommendCustomerAccountInfo.RemainPoints,
                            TransactionSeq: transactionInstance.TransactionSeq
                        }, {
                            transaction: transaction
                        });
                        shopAcctChangeRecommendPointAmount += indirectRecommendPoints;
                        logger.info("indirectRecommendCustomerInfo CustomerAccountChange create");
                        logger.info(custAcctChange.toJSON());
                        //indirectRecommendCustomerAccountInfo = await findAccountInfo(db, indirectRecommendCustomerInfo.CustomerId, transaction);
                    } else {
                        indirectRecommendPoints = 0;
                    }
                    if (thirdRecommendCustomerInfo && thirdRecommendPoints > 0) {
                        thirdRecommendCustomerAccountInfo = await findAccountInfo(db, thirdRecommendCustomerInfo.CustomerId, transaction);
                        custAcctChange = await db.CustomerAccountChange.create({
                            CustomerId: thirdRecommendCustomerInfo.CustomerId,
                            ThirdRecommendPoints: thirdRecommendPoints,
                            ShopId: operateShopId,
                            Date: date,
                            RemainMoney:thirdRecommendCustomerAccountInfo.RemainMoney,
                            RemainPoints:thirdRecommendCustomerAccountInfo.RemainPoints,
                            TransactionSeq: transactionInstance.TransactionSeq
                        }, {
                            transaction: transaction
                        });
                        shopAcctChangeRecommendPointAmount += thirdRecommendPoints;
                        logger.info("thirdRecommendCustomerInfo CustomerAccountChange create");
                        logger.info(custAcctChange.toJSON());
                        //thirdRecommendCustomerAccountInfo = await findAccountInfo(db, thirdRecommendCustomerInfo.CustomerId, transaction);
                    } else {
                        thirdRecommendPoints = 0;
                    }
                    let shopAcctChange = await db.ShopAccountChange.create({
                        CustomedPoints: costPoints,
                        ChargedMoney: rechargedMoney,
                        CustomedMoney: costMoney,
                        ShopBounusPoints: bounus,
                        RecommendPoints: shopAcctChangeRecommendPointAmount,
                        Date: date,
                        ShopId: operateShopId,
                        TransactionSeq: transactionInstance.TransactionSeq
                    }, {
                        transaction: transaction
                    });
                    logger.info("ShopAccountChange create");
                    logger.info(shopAcctChange.toJSON());
                    return db.CustomerAccountInfo.findOne({
                        where: {
                            CustomerId: customerInfo.CustomerId
                        },
                        include: {
                            model: db.CustomerInfo,
                            require: true
                        }
                    }, {
                        transaction: transaction
                    });
                })
        })
        .then(result => {
            logger.info(result.toJSON());
            let json = {
                Object: {}
            };
            json.Object.TransactionDetail = {
                ShopId: operateShopId,
                ChargedMoney: rechargedMoney,
                CustomedMoney: costMoney,
                CustomedPoints: costPoints,
                RecommendPoints: recommendPoints,
                IndirectRecommendPoints: indirectRecommendPoints,
                ThirdRecommendPoints: thirdRecommendPoints,
                ShopBounusPoints: bounus,
                Date: new Date(date),
            }
            if (costMoney != 0) {
                sendCostMessage(customerInfo.Name, 
                    operateShop.Name, 
                    bounus, 
                    costMoney,
                    result.RemainMoney, 
                    result.RemainPoints, 
                    customerInfo.Phone);
            }
            if (costOrigin == 0 && rechargedMoney != 0) {
                sendRechargeMessage(customerInfo.Name, 
                    operateShop.Name, 
                    rechargedMoney, 
                    result.RemainMoney, 
                    result.RemainPoints, 
                    customerInfo.Phone);
            }
            json.Object.CustomerAccountInfo = result.dataValues;
            if (recommendCustomerInfo) {
                json.Object.RecommendCustomerInfo = recommendCustomerInfo;
                json.Object.RecommendPoints = recommendPoints;
                if (recommendPoints != 0) {
                    sendRecommendMessage(recommendCustomerInfo.Name, 
                        operateShop.Name, 
                        costMoney, 
                        recommendPoints, 
                        recommendCustomerAccountInfo.RemainMoney, 
                        recommendCustomerAccountInfo.RemainPoints, 
                        recommendCustomerInfo.Phone);
                }
            } else {
                json.Object.RecommendCustomerInfo = null;
            }
            if (indirectRecommendCustomerInfo) {
                json.Object.IndirectRecommendCustomerInfo = indirectRecommendCustomerInfo;
                json.Object.IndirectRecommendPoints = indirectRecommendPoints;
                if (indirectRecommendPoints != 0) {
                    sendRecommendMessage(indirectRecommendCustomerInfo.Name, 
                        operateShop.Name, 
                        costMoney, 
                        indirectRecommendPoints, 
                        indirectRecommendCustomerAccountInfo.RemainMoney, 
                        indirectRecommendCustomerAccountInfo.RemainPoints, 
                        indirectRecommendCustomerInfo.Phone);
                }
            } else {
                json.Object.IndirectRecommendCustomerInfo = null;
            }
            if (thirdRecommendCustomerInfo) {
                json.Object.ThirdRecommendCustomerInfo = thirdRecommendCustomerInfo;
                json.Object.ThirdRecommendPoints = thirdRecommendPoints;
                if (thirdRecommendPoints != 0) {
                    sendRecommendMessage(thirdRecommendCustomerInfo.Name, 
                        operateShop.Name, 
                        costMoney, 
                        thirdRecommendPoints, 
                        thirdRecommendCustomerAccountInfo.RemainMoney, 
                        thirdRecommendCustomerAccountInfo.RemainPoints, 
                        thirdRecommendCustomerInfo.Phone);
                }
            } else {
                json.Object.ThirdRecommendCustomerInfo = null;
            }
            res.json(json).end();
        })
        .catch(err => {
            // Rolled back
            logger.error(err);
            res.json({
                Error: {
                    Message: err
                }
            }).end();
        });
});

// error 
router.use('/userpoints', (req, res) => {
    res.json({
        Error: {
            Message: "无此服务： " + req.method
        }
    }).end();
})

router.use((req, res, next) => {
    next();
})

async function sendMessage(phone, template, params) {
    return 'OK';
    let smsClient = new SMSClient({
        accessKeyId,
        secretAccessKey
    });
    return smsClient.sendSMS({
        PhoneNumbers: phone,
        SignName: "联动会员",
        TemplateCode: template,
        TemplateParam: params
    }).then(function (res) {
        let {
            Code
        } = res
        if (Code === 'OK') {
            //处理返回参数
            console.log(res)
        }
    }, function (err) {
        console.log(err)
    })
}
async function sendCostMessage(name, shop, bounus, cost, remainMoney, remainPoints, phone) {
    let param = JSON.stringify({
        name,
        shop,
        bounus,
        cost,
        remainMoney,
        remainPoints
    });
    phone = '17628185988';
    return sendMessage(phone, globalConfig.sms.costTemplate, param);
}
async function sendRecommendMessage(name, shop, cost, points, remainMoney, remainPoints, phone) {
    let param = JSON.stringify({
        name,
        shop,
        cost,
        points,
        remainMoney,
        remainPoints
    });
    phone = '17628185988';
    return sendMessage(phone, globalConfig.sms.recommendTemplate, param);
}
async function sendRechargeMessage(name, shop, recharge, remainMoney, remainPoints, phone) {
    let param = JSON.stringify({
        name,
        shop,
        recharge,
        remainMoney,
        remainPoints
    });
    phone = '17628185988';
    return sendMessage(phone, globalConfig.sms.rechargeTemplate, param);
}
async function findAccountInfo(db, id, transaction) {
    return await db.CustomerAccountInfo.findOne({
        where: {
            CustomerId: id
        }
    }, {
        transaction: transaction
    });
}
async function getRecommendCustomer(customer) {
    let recommendCustomer = null;
    if (customer != null) {
        recommendCustomer = await customer.getRecommendCustomerInfo();
        if (recommendCustomer && recommendCustomer.Status == 0) {
            recommendCustomer = null;
        }
    }
    return recommendCustomer;
}
module.exports = router;
