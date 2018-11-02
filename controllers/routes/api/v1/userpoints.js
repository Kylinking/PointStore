'use strict';
let util = require('../../../../util/util');
let SMS = require('../../../../util/sms');
let express = require('express');
let router = express.Router();
const Op = require('sequelize').Op;
const hundredTime = 100;
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
                json.Array.push(util.ConvertObj2Result(row.toJSON()));
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
    let costOrigin = Math.round(util.makeNumericValue(req.body.CostMoney, 0)*hundredTime);
    let costMoney = costOrigin;
    let rechargedMoney = Math.round(util.makeNumericValue(req.body.RechargedMoney, 0)*hundredTime);
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
                    recommendPoints = Math.round(costMoney * bounusRate.RecommendRate);
                    indirectRecommendPoints = Math.round(costMoney * bounusRate.IndirectRecommendRate);
                    thirdRecommendPoints = Math.round(costMoney * bounusRate.ThirdRecommendRate);
                    bounus = Math.round(costMoney * bounusRate.ShopBounusPointRate);
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
                        RemainMoney: customerAccountInfo.RemainMoney,
                        RemainPoints: customerAccountInfo.RemainPoints,
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
                            RemainMoney: recommendCustomerAccountInfo.RemainMoney,
                            RemainPoints: recommendCustomerAccountInfo.RemainPoints,
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
                            RemainMoney: indirectRecommendCustomerAccountInfo.RemainMoney,
                            RemainPoints: indirectRecommendCustomerAccountInfo.RemainPoints,
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
                            RemainMoney: thirdRecommendCustomerAccountInfo.RemainMoney,
                            RemainPoints: thirdRecommendCustomerAccountInfo.RemainPoints,
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
            json.Object.TransactionDetail = util.ConvertObj2Result({
                ShopId: operateShopId,
                ChargedMoney: (rechargedMoney),
                CustomedMoney: (costMoney),
                CustomedPoints: (costPoints),
                RecommendPoints: (recommendPoints),
                IndirectRecommendPoints: (indirectRecommendPoints),
                ThirdRecommendPoints: (thirdRecommendPoints),
                ShopBounusPoints: (bounus),
                Date: new Date(date),
            });
            if (costMoney != 0) {
                SMS.sendMixCostMessage(customerInfo.Name,
                    operateShop.Name,
                    util.Convert2Result(costOrigin),
                    util.Convert2Result(costOrigin - costMoney),
                    util.Convert2Result(rechargedMoney),
                    util.Convert2Result(costMoney - rechargedMoney > 0 ? costMoney - rechargedMoney : 0),
                    util.Convert2Result(bounus),
                    util.Convert2Result(result.RemainMoney),
                    util.Convert2Result(result.RemainPoints),
                    customerInfo.Phone);
            }
            if (costOrigin == 0 && rechargedMoney != 0) {
                SMS.sendRechargeMessage(customerInfo.Name,
                    operateShop.Name,
                    util.Convert2Result(rechargedMoney),
                    util.Convert2Result(result.RemainMoney),
                    util.Convert2Result(result.RemainPoints),
                    customerInfo.Phone);
            }
            json.Object.CustomerAccountInfo = util.ConvertObj2Result(result.toJSON());
            if (recommendCustomerInfo) {
                json.Object.RecommendCustomerInfo = recommendCustomerInfo;
                json.Object.RecommendPoints = util.Convert2Result(recommendPoints);
                if (recommendPoints != 0) {
                    SMS.sendRecommendMessage(recommendCustomerInfo.Name,
                        operateShop.Name,
                        util.Convert2Result(recommendPoints),
                        util.Convert2Result(recommendCustomerAccountInfo.RemainMoney),
                        util.Convert2Result(recommendCustomerAccountInfo.RemainPoints),
                        recommendCustomerInfo.Phone);
                }
            } else {
                json.Object.RecommendCustomerInfo = null;
            }
            if (indirectRecommendCustomerInfo) {
                json.Object.IndirectRecommendCustomerInfo = indirectRecommendCustomerInfo;
                json.Object.IndirectRecommendPoints = util.Convert2Result(indirectRecommendPoints);
                if (indirectRecommendPoints != 0) {
                    SMS.sendRecommendMessage(indirectRecommendCustomerInfo.Name,
                        operateShop.Name,
                        util.Convert2Result(indirectRecommendPoints),
                        util.Convert2Result(indirectRecommendCustomerAccountInfo.RemainMoney),
                        util.Convert2Result(indirectRecommendCustomerAccountInfo.RemainPoints),
                        indirectRecommendCustomerInfo.Phone);
                }
            } else {
                json.Object.IndirectRecommendCustomerInfo = null;
            }
            if (thirdRecommendCustomerInfo) {
                json.Object.ThirdRecommendCustomerInfo = thirdRecommendCustomerInfo;
                json.Object.ThirdRecommendPoints = util.Convert2Result(thirdRecommendPoints);
                if (thirdRecommendPoints != 0) {
                    SMS.sendRecommendMessage(thirdRecommendCustomerInfo.Name,
                        operateShop.Name,
                        util.Convert2Result(thirdRecommendPoints),
                        util.Convert2Result(thirdRecommendCustomerAccountInfo.RemainMoney),
                        util.Convert2Result(thirdRecommendCustomerAccountInfo.RemainPoints),
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

router.delete('/userpoints', async (req, res) => {
    let logger = res.locals.logger;
    let phone = !isNaN(util.checkPhone(req.body.Phone)) ? util.checkPhone(req.body.Phone) : 0;
    let db = res.locals.db;
    let sequelize = db.sequelize;
    let operateShopId = res.locals.shopid;
    let transactionSeq = util.makeNumericValue(req.body.Seq, null);
    let password = req.body.Password || null;
    try {
        if (transactionSeq === null) {
            throw "需要原交易序号";
        }
        if (password === null) {
            throw "需要店面密码";
        }
        if (phone === null) {
            throw "需要客户手机号";
        }
        let login = await db.Login.findById(operateShopId);
        if (login.Password !== password) {
            throw "店面密码不正确";
        }
        let transcationRecord = await db.TransactionDetail.findById(transactionSeq);
        if (!transcationRecord) {
            throw "原交易不存在";
        }
        if (transcationRecord.Reversal != 0) {
            throw "冲正交易不允许二次冲正";
        }
        let customerInfo = await db.CustomerInfo.findOne({
            where: {
                Phone: phone
            }
        });
        if (customerInfo.CustomerId !== transcationRecord.CustomerId) {
            throw "客户手机号与交易客户不一致";
        }
        let date = new Date();
        let t = sequelize.transaction(transaction => {
            return db.TransactionDetail.create({
                CustomerId: transcationRecord.CustomerId,
                RecommendCustomerId: transcationRecord.RecommendCustomerId,
                IndirectRecommendCustomerId: transcationRecord.IndirectRecommendCustomerId,
                ThirdRecommendCustomerId: transcationRecord.ThirdRecommendCustomerId,
                PointToMoneyRate: transcationRecord.PointToMoneyRate,
                RecommendPoints: transcationRecord.RecommendPoints,
                IndirectRecommendPoints: transcationRecord.IndirectRecommendPoints,
                ThirdRecommendPoints: transcationRecord.ThirdRecommendPoints,
                ShopBounusPoints: transcationRecord.ShopBounusPoints,
                CustomedPoints: transcationRecord.CustomedPoints,
                ChargedMoney: transcationRecord.ChargedMoney,
                CustomedMoney: transcationRecord.CustomedMoney,
                Date: Date.parse(date),
                Reversal: 1,
                ShopId:operateShopId,
                ReversalTransactionSeq: transactionSeq
            }, {
                transaction
            }).then(async (reversalTransc)=>{
            transcationRecord.set("Reversal",1);
            transcationRecord.set('ReversalTransactionSeq', reversalTransc.TransactionSeq);
            await transcationRecord.save({
                transaction: transaction
            });
            transcationRecord = transcationRecord.toJSON();
            let reversal = await db.ReversalRecord.create({
                OrignTransactionSeq: transactionSeq,
                CustomerId: customerInfo.CustomerId,
                ReversalTransactionSeq:reversalTransc.TransactionSeq
            }, {
                transaction: transaction
            });
            let ShopAccountInfo = await db.ShopAccountInfo.decrement({
                CustomedPoints: transcationRecord.CustomedPoints,
                ChargedMoney: transcationRecord.ChargedMoney,
                CustomedMoney: transcationRecord.CustomedMoney,
                ShopBounusPoints: transcationRecord.ShopBounusPoints,
                RecommendPoints: (transcationRecord.RecommendPoints +
                    transcationRecord.IndirectRecommendPoints +
                    transcationRecord.ThirdRecommendPoints),
            },{
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
            });
            let shopAcctChange = await db.ShopAccountChange.findOne({
                where: {
                    TransactionSeq: transactionSeq,
                }
            }, {
                transaction: transaction
            });
            let revarsalShopAcctChange = await db.ShopAccountChange.create({
                CustomedPoints: -transcationRecord.CustomedPoints,
                ChargedMoney: -transcationRecord.ChargedMoney,
                CustomedMoney: -transcationRecord.CustomedMoney,
                ShopBounusPoints: -transcationRecord.ShopBounusPoints,
                RecommendPoints: -(transcationRecord.RecommendPoints +
                    transcationRecord.IndirectRecommendPoints +
                    transcationRecord.ThirdRecommendPoints),
                Date: Date.parse(date),
                ShopId: operateShopId,
                TransactionSeq: transcationRecord.TransactionSeq,
                Reversal: 1,
                ReversalId: shopAcctChange.Id
            }, {
                transaction: transaction
            });
            shopAcctChange.set("Reversal", 1);
            shopAcctChange.set("ReversalId", revarsalShopAcctChange.Id);
            await shopAcctChange.save({transaction:transaction});
            logger.info(shopAcctChange.toJSON());

            let customerAccountInfo = await db.CustomerAccountInfo.findById(transcationRecord.CustomerId, {
                transaction: transaction
            });
            logger.info(customerAccountInfo.toJSON());
            await customerAccountInfo.decrement({
                RemainMoney: transcationRecord.ChargedMoney - transcationRecord.CustomedMoney,
                RemainPoints: transcationRecord.ShopBounusPoints - transcationRecord.CustomedPoints,
                ShopBounusPoints: transcationRecord.ShopBounusPoints,
                CustomedPoints: transcationRecord.CustomedPoints,
                ChargedMoney: transcationRecord.ChargedMoney,
                CustomedMoney: transcationRecord.CustomedMoney
            }, {
                transaction: transaction
            });
            logger.info(customerAccountInfo);
            let customerAcctChange = await db.CustomerAccountChange.findOne({
                where: {
                    CustomerId: transcationRecord.CustomerId,
                    TransactionSeq: transactionSeq
                }
            });
            let reversalCustomerAccountChange = await db.CustomerAccountChange.create({
                CustomerId: transcationRecord.CustomerId,
                CustomedPoints: -transcationRecord.CustomedPoints,
                ShopBounusPoints: -transcationRecord.ShopBounusPoints,
                Date: Date.parse(date),
                ShopId: operateShopId,
                CustomedMoney: -transcationRecord.CustomedMoney,
                ChargedMoney: -transcationRecord.ChargedMoney,
                RemainMoney: customerAccountInfo.RemainMoney 
                - transcationRecord.ChargedMoney 
                + transcationRecord.CustomedMoney,
                RemainPoints: customerAccountInfo.RemainPoints 
                - transcationRecord.ShopBounusPoints
                + transcationRecord.CustomedPoints,
                TransactionSeq: transcationRecord.TransactionSeq,
                Reversal: 1,
                ReversalId: customerAcctChange.Id
            }, {
                transaction: transaction
            });
            customerAcctChange.set('Reversal', 1);
            customerAcctChange.set('ReversalId', reversalCustomerAccountChange.Id);
            await customerAcctChange.save({transaction:transaction});

            if (transcationRecord.RecommendCustomerId !== null && transcationRecord.RecommendPoints != 0) {
                let customerAcctChange = await db.CustomerAccountChange.findOne({
                    where: {
                        CustomerId: transcationRecord.RecommendCustomerId,
                        TransactionSeq: transactionSeq
                    }
                });
                customerAccountInfo = await db.CustomerAccountInfo.findById(transcationRecord.RecommendCustomerId, {
                    transaction: transaction
                });
                await customerAccountInfo.decrement({
                    RemainPoints: transcationRecord.RecommendPoints,
                    RecommendPoints: transcationRecord.RecommendPoints,
                }, {
                    transaction: transaction
                });
                logger.info("recommend ")
                reversalCustomerAccountChange = await db.CustomerAccountChange.create({
                    CustomerId: transcationRecord.RecommendCustomerId,
                    RecommendPoints: -transcationRecord.RecommendPoints,
                    RemainPoints: customerAccountInfo.RemainPoints -transcationRecord.RecommendPoints,
                    RemainMoney: customerAccountInfo.RemainMoney,
                    TransactionSeq: transcationRecord.TransactionSeq,
                    Date: Date.parse(date),
                    ShopId: operateShopId,
                    Reversal: 1,
                    ReversalId: customerAcctChange.Id
                }, {
                    transaction: transaction
                });
                customerAcctChange.set('Reversal', 1);
                customerAcctChange.set('ReversalId', reversalCustomerAccountChange.Id);
                await customerAcctChange.save({transaction:transaction});
            }

            if (transcationRecord.IndirectRecommendCustomerId !== null && transcationRecord.IndirectRecommendPoints != 0) {
                customerAcctChange = await db.CustomerAccountChange.findOne({
                    where: {
                        CustomerId: transcationRecord.IndirectRecommendCustomerId,
                        TransactionSeq: transactionSeq
                    }
                });
                customerAccountInfo = await db.CustomerAccountInfo.findById(transcationRecord.IndirectRecommendCustomerId, {
                    transaction: transaction
                });
                await customerAccountInfo.decrement({
                    RemainPoints: transcationRecord.IndirectRecommendPoints,
                    IndirectRecommendPoints: transcationRecord.IndirectRecommendPoints,
                }, {
                    transaction: transaction
                });
                await customerAccountInfo.reload();
                reversalCustomerAccountChange = await db.CustomerAccountChange.create({
                    CustomerId: transcationRecord.IndirectRecommendCustomerId,
                    IndirectRecommendPoints: -transcationRecord.IndirectRecommendPoints,
                    RemainPoints: customerAccountInfo.RemainPoints-transcationRecord.IndirectRecommendPoints,
                    RemainMoney: customerAccountInfo.RemainMoney,
                    TransactionSeq: transcationRecord.TransactionSeq,
                    Date: Date.parse(date),
                    ShopId: operateShopId,
                    Reversal: 1,
                    ReversalId: customerAcctChange.Id
                }, {
                    transaction: transaction
                });
                customerAcctChange.set('Reversal', 1);
                customerAcctChange.set('ReversalId', reversalCustomerAccountChange.Id);
                await customerAcctChange.save({transaction:transaction});
            }

            if (transcationRecord.ThirdRecommendCustomerId !== null && transcationRecord.ThirdRecommendPoints != 0) {
                customerAcctChange = await db.CustomerAccountChange.findOne({
                    where: {
                        CustomerId: transcationRecord.ThirdRecommendCustomerId,
                        TransactionSeq: transactionSeq
                    }
                });
                customerAccountInfo = await db.CustomerAccountInfo.findById(transcationRecord.ThirdRecommendCustomerId, {
                    transaction: transaction
                });
                await customerAccountInfo.decrement({
                    RemainPoints: transcationRecord.ThirdRecommendPoints,
                    ThirdRecommendPoints: transcationRecord.ThirdRecommendPoints,
                }, {
                    transaction: transaction
                });
                await customerAccountInfo.reload();
                reversalCustomerAccountChange = await db.CustomerAccountChange.create({
                    CustomerId: transcationRecord.ThirdRecommendCustomerId,
                    ThirdRecommendPoints: -transcationRecord.ThirdRecommendPoints,
                    RemainPoints: customerAccountInfo.RemainPoints-transcationRecord.ThirdRecommendPoints,
                    RemainMoney: customerAccountInfo.RemainMoney,
                    TransactionSeq: transcationRecord.TransactionSeq,
                    Date: Date.parse(date),
                    ShopId: operateShopId,
                    Reversal: 1,
                    ReversalId: customerAcctChange.Id
                }, {
                    transaction: transaction
                });
                customerAcctChange.set('Reversal', 1);
                customerAcctChange.set('ReversalId', reversalCustomerAccountChange.Id);
                await customerAcctChange.save({transaction:transaction});
            }

            res.json({Object:{
                TransactionDetail: util.ConvertObj2Result( reversalTransc.toJSON())
            }}).end();
        });
    }); 
}catch (error) {
        logger.error(error);
        res.json({
            Error: {
                Message: error
            }
        }).end();
    }
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
