'use strict';
let util = require('../../../../util/util');
let express = require('express');
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
                Data: [],
                Meta: {}
            };
            instance.rows.forEach((row) => {
                json.Data.push(row);
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
    //let rechargedPoints = util.makeNumericValue(req.body.RechargedPoint, 0);
    let costMoney = util.makeNumericValue(req.body.CostMoney, 0);
    let rechargedMoney = util.makeNumericValue(req.body.RechargedMoney, 0);
    let bounus = 0
    let recommendPoints = 0
    let indirectRecommendPoints = 0
    let pointToMoney = 0;
    let adminBounusRate = null;
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
    if (costMoney < 0 || rechargedMoney < 0 || costPoints < 0) {
        res.json({
            Error: {
                Message: '交易金额和积分须大于0'
            }
        }).end();
        return;
    }
    
    let operateShop = await db.ShopInfo.findOne({
        where:{
            ShopId:operateShopId
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
    if (costPoints != 0 ){
        adminBounusRate = await db.BounusPointRate.findOne({
            where: {
                ShopId: operateShop.ParentShopId
            }
        }); 
        pointToMoney = costPoints * adminBounusRate.PointToMoneyRate;
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
    let recommendCustomerInfo = null;
    let indirectRecommendCustomerInfo = null;
    let date = Date.parse(Date());
    logger.info(date);
    let json = {Data:{}};
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
                    recommendCustomerInfo = await customerInfo.getRecommendCustomerInfo();
                    logger.info(customerInfo.dataValues);

                    recommendCustomerInfo && logger.info(recommendCustomerInfo.dataValues);
                    if (recommendCustomerInfo) {
                        indirectRecommendCustomerInfo = await recommendCustomerInfo.getRecommendCustomerInfo();
                    }

                    indirectRecommendCustomerInfo && logger.info(indirectRecommendCustomerInfo.dataValues);
                    
                    let shopAcctInfoOptions = {
                        CustomedMoney: costMoney,
                        ChargedMoney:rechargedMoney,
                        //ChargedPoints: recharged,
                        CustomedPoints:costPoints,//  FIX !!!!!
                        ShopBounusPoints: bounus
                    };
                    let shopAcctChangeRecommendPointAmount = 0;

                    let adminShopInfo = await db.ShopInfo.findOne({
                        where: {
                            ShopId: customerInfo.ShopId
                        }
                    }, {
                        transaction: transaction
                    });

                    let bounusRate = null;
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
                            bounusRate = await db.BounusPointRate.findOne({
                                where: {
                                    ShopId: operateShopId
                                }
                            }, {
                                transaction: transaction
                            });
                            break;
                    }
                    logger.info(`bounusRate: RecommendRate:${bounusRate.RecommendRate},Indirect:${bounusRate.IndirectRecommendRate},ShopBounus:${bounusRate.ShopBounusPointRate}`);
                    recommendPoints = rechargedMoney * bounusRate.RecommendRate;
                    indirectRecommendPoints = rechargedMoney * bounusRate.IndirectRecommendRate;
                    bounus = rechargedMoney * bounusRate.ShopBounusPointRate;
                    let transactionOptions = {
                        ChargedMoney: rechargedMoney,
                   //     ChargedPoints: rechargedPoints,
                        CustomedPoints: costPoints,
                        Date: date,
                        CustomedMoney: costMoney,
                    };
                    let custAcctInfo = await db.CustomerAccountInfo.findOne({
                        where: {
                            CustomerId: customerInfo.CustomerId
                        }
                    }, {
                        transaction: transaction
                    });
                    if (custAcctInfo.RemainMoney + rechargedMoney < costMoney) {
                        //res.json({Error:{Message:"本次消费积分余额不足"}}).end();
                        throw "本次消费金额不足";
                    }
                    custAcctInfo = await db.CustomerAccountInfo.increment({
                        RemainMoney: rechargedMoney - costMoney,
                        ChargedMoney:rechargedMoney,
                        CustomedMoney:costMoney,
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
                    logger.info(custAcctInfo);
                    logger.info("customerInfo CustomerAccountInfo increment ");
                    json.Data.RemainMoney = custAcctInfo.RemainMoney;
                    json.Data.RemainPoints = custAcctInfo.RemainPoints;
                    json.Data.ChargedMoney = rechargedMoney;
                    json.Data.ShopBounusPoints = bounus;
                    json.Data.CustomedMoney = costMoney;
                    json.Data.CustomedPoints = costPoints;
                    json.Data.PointToMoney = pointToMoney;
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
                        shopAcctInfoOptions.RecommendPoints += recommendPoints;
                        json.Data.RecommendCustomerInfo = recommendCustomerInfo;
                        json.Data.RecommendPoints = recommendPoints;
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
                        json.Data.IndirectRecommendCustomerInfo = indirectRecommendCustomerInfo;
                        json.Data.IndirectRecommendPoints = indirectRecommendPoints;
                    }
                    let transactionInstance = await db.TransactionDetail.create(
                        transactionOptions, {
                            transaction: transaction
                        }
                    );
                    logger.info("TransactionDetail create");
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
                    await db.CustomerAccountChange.create({
                        CustomerId: customerInfo.CustomerId,
                        ChargedPoints: recharged,
                        CustomedPoints: cost,
                        ShopBounusPoints: bounus,
                        Date: date,
                        ShopId: customerInfo.ShopId,
                        TransactionSeq: transactionInstance.TransactionSeq
                    }, {
                        transaction: transaction
                    });

                    logger.info("customerInfo CustomerAccountChange create");
                    if (recommendCustomerInfo && recommendPoints > 0) {
                        await db.CustomerAccountChange.create({
                            CustomerId: recommendCustomerInfo.CustomerId,
                            RecommendPoints: recommendPoints,
                            Date: date,
                            ShopId: customerInfo.ShopId,
                            TransactionSeq: transactionInstance.TransactionSeq
                        }, {
                            transaction: transaction
                        });
                        shopAcctChangeRecommendPointAmount += recommendPoints;
                        logger.info("recommendCustomerInfo CustomerAccountChange create");
                    }
                    if (indirectRecommendCustomerInfo && indirectRecommendPoints > 0) {
                        await db.CustomerAccountChange.create({
                            CustomerId: indirectRecommendCustomerInfo.CustomerId,
                            IndirectRecommendPoints: indirectRecommendPoints,
                            ShopId: customerInfo.ShopId,
                            Date: date,
                            TransactionSeq: transactionInstance.TransactionSeq
                        }, {
                            transaction: transaction
                        });
                        shopAcctChangeRecommendPointAmount += indirectRecommendPoints
                        logger.info("indirectRecommendCustomerInfo CustomerAccountChange create");
                    }

                    await db.ShopAccountChange.create({
                        ChargedPoints: recharged,
                        CustomedPoints: cost,
                        ShopBounusPoints: bounus,
                        RecommendPoints: shopAcctChangeRecommendPointAmount,
                        Date: date,
                        ShopId: customerInfo.ShopId,
                        TransactionSeq: transactionInstance.TransactionSeq
                    }, {
                        transaction: transaction
                    });

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
            logger.info(result);
            res.json({
                Data: result
            }).end();
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

module.exports = router;
