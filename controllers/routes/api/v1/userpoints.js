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
                throw `ShopId:${queryShopId}店面不存在`;
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
                        whereCustomerInfoObj.ShopId = queryShopId;
                    } else if (queryShop.Type == 2) {
                        whereCustomerInfoObj.ShopId = queryShop.ParentShopId;
                    }
                }
                break;
            case 1:
                if (shopId != null) {
                    if (queryShop.Type == 1) {
                        if (queryShopId != operateShopId) {
                            throw `无权限查询ShopId:${queryShopId}店面客户账户`;
                        }
                        whereCustomerInfoObj.ShopId = operateShopId;
                    } else if (queryShop.Type == 2) {
                        if (queryShop.ParentShopId != operateShopId) {
                            throw `无权限查询ShopId:${queryShopId}店面客户账户`;
                        }
                        whereCustomerInfoObj.ShopId = queryShop.ParentShopId;
                    } else {
                        throw `无权查询ShopId:${queryShopId}店面客户账户`;
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
                    where:{},
                    require:true
                }]
            }],
            offset: offset,
            limit: pageSize
        })
        if (instance) {
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
            throw "无账户信息";
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
    let cost = util.makeNumericValue(req.body.Cost, 0);
    let recharged = util.makeNumericValue(req.body.Recharged, 0);
    let bounus = util.makeNumericValue(req.body.ShopBounusPoints, 0);
    let recommendPoints = util.makeNumericValue(req.body.RecommendPoints, 0);
    let indirectRecommendPoints = util.makeNumericValue(req.body.IndirectRecommendPoints, 0);
    logger.info(`phone: ${phone}, operateShopId: ${operateShopId}, 
         cost: ${cost},recharged:${recharged}, bounus: ${bounus}, 
         recommendPoints: ${recommendPoints}, indirectRecommendPoints: ${indirectRecommendPoints}`);
    if (phone == null) {
        res.json({
            Error: {
                Message: '客户号码参数不能为空'
            }
        }).end();
        return
    }
    if (cost < 0 || recharged < 0) {
        res.json({
            Error: {
                Message: '交易积分须大于等于0'
            }
        }).end();
        return;
    }
    if (bounus < 0 || recommendPoints < 0 || indirectRecommendPoints < 0) {
        res.json({
            Error: {
                Message: '奖励积分须大于等于0'
            }
        }).end();
        return;
    }
    let roleOfOperatedShopId = await util.getRoleAsync(operateShopId);
    logger.info(roleOfOperatedShopId);
    if (roleOfOperatedShopId == 'admin') {
        res.json({
            Error: {
                Message: '该用户无权完成操作'
            }
        }).end();
        return;
    }
    if (!await util.isBelongsToByPhoneAsync(phone, operateShopId)) {
        res.json({
            Error: {
                Message: '无权操作其它分店客户账户'
            }
        }).end();
        return;
    }
    let customerInfo = null;
    let recommendCustomerInfo = null;
    let indirectRecommendCustomerInfo = null;
    let date = Date.parse(Date());
    logger.info(date);
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
                    if (roleOfOperatedShopId == 'normal' && row.ShopId != operateShopId) {
                        throw '无权操作其它分店客户账户';
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
                    let transactionOptions = {
                        ChargedPoints: recharged,
                        Date: date,
                        CustomedPoints: cost,
                        ShopBounusPoints: bounus,
                        ShopId: customerInfo.ShopId,
                        CustomerId: customerInfo.CustomerId,
                    };
                    let shopAcctInfoOptions = {
                        CustomedPoints: cost,
                        RecommendPoints: 0,
                        ChargedPoints: recharged,
                        ShopBounusPoints: bounus
                    };
                    let shopAcctChangeRecommendPointAmount = 0;

                    let shopInfo = await db.ShopInfo.findOne({
                        where: {
                            ShopId: customerInfo.ShopId
                        }
                    }, {
                        transaction: transaction
                    });

                    let bounusRate = await db.BounusPointRate.findOne({
                        where: {
                            ShopId: customerInfo.ShopId
                        }
                    }, {
                        transaction: transaction
                    });
                    logger.info(`bounusRate.Level:${bounusRate.Level}`);
                    switch (bounusRate.Level) {
                        case 1:
                            bounusRate = await db.BounusPointRate.findOne({
                                where: {
                                    ShopId: shopInfo.ParentShopId
                                }
                            }, {
                                transaction: transaction
                            });
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
                    logger.info(`bounusRate: RecommendRate:${bounusRate.RecommendRate},Indirect:${bounusRate.IndirectRecommendRate},ShopBounus:${bounusRate.ShopBounusPointRate}`);
                    recommendPoints = recharged * bounusRate.RecommendRate;
                    indirectRecommendPoints = recharged * bounusRate.IndirectRecommendRate;
                    bounus = recharged * bounusRate.ShopBounusPointRate;


                    let custAcctInfo = await db.CustomerAccountInfo.findOne({
                        where: {
                            CustomerId: customerInfo.CustomerId
                        }
                    }, {
                        transaction: transaction
                    })
                    if (custAcctInfo.RemainPoints + recharged + bounus < cost) {
                        //res.json({Error:{Message:"本次消费积分余额不足"}}).end();
                        throw "本次消费金额不足";
                    }
                    await db.CustomerAccountInfo.increment({
                        RemainPoints: recharged - cost + bounus,
                        ShopBounusPoints: bounus,
                        ChargedPoints: recharged,
                        CustomedPoints: cost,
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
                        shopAcctInfoOptions.RecommendPoints += recommendPoints;
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
                                        shopInfo.ParentShopId
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
