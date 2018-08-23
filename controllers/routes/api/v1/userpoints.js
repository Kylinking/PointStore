'use strict';
var util = require('../../../../util/util');
var express = require('express');
var router = express.Router();
const Op = require('sequelize').Op;

router.get('/userpoints', async (req, res) => {
    var logger = res.locals.logger;
    var phone = isNaN(util.checkPhone(req.query.Phone))? null:req.query.Phone;
    var shopID = util.makeNumericValue(req.query.ShopID,null);
    let page = util.makeNumericValue(req.query.Page, 1);
    let pageSize = util.makeNumericValue(req.query.Size, 20);
    var offset = (page - 1) * pageSize;
    var acctInfo = res.locals.db.CustomerAccountInfo;
    var operateShopID = res.locals.ShopID;
    var whereCustomerInfoObj = {};
    var whereShopInfoObj = {};
    var roleOfOperatedShopID = await util.getRoleAsync(operateShopID);
    if (phone != null) {
        whereCustomerInfoObj.Phone = phone;
    }
    logger.info(`Phone:${phone},`)
    if (roleOfOperatedShopID == 'superman') {
        if (shopID != null && shopID != operateShopID) {
            if (await util.isAdminShopAsync(shopID)) {
                whereShopInfoObj.ParentShopID = shopID;
            } else {
                whereShopInfoObj.ShopID = shopID;
            }
        }
    } else if (roleOfOperatedShopID == 'admin') {
        whereShopInfoObj.ParentShopID = operateShopID;
        if ((shopID != null && !await util.isSubordinateAsync(operateShopID, shopID)) ||
            (phone != null && !await util.isBelongsToByPhoneAsync(phone, operateShopID))) {
            res.json({
                error: {
                    message: "无权查询其它总店下用户账户"
                }
            }).end();
            return;
        }
    } else {
        if ((shopID != null && shopID != operateShopID) ||
            (phone != null && !await util.isBelongsToByPhoneAsync(phone, operateShopID))) {
            res.json({
                error: {
                    message: "无权查询其它店面用户账户"
                }
            }).end();
            return;
        } else {
            whereShopInfoObj.ShopID = operateShopID;
        }
    }
    logger.info(whereShopInfoObj);
    logger.info(whereCustomerInfoObj);
    acctInfo.findAndCountAll({
        include: [{
            model: res.locals.db.CustomerInfo,
            where: whereCustomerInfoObj,
            include: [{
                model: res.locals.db.ShopInfo,
                where: whereShopInfoObj
            }]
        }],
        offset: offset,
        limit: pageSize
    }).then((instance) => {
        var pages = Math.ceil(instance.count / pageSize);
        var json = {
            data: []
        };
        instance.rows.forEach((row) => {
            json.data.push(row);
        });
        json["Pages"] = pages;
        json["Size"] = pageSize;
        res.json(json).end();
    }).catch(err => {
        res.json({
            error: {
                message: err
            }
        }).end();
    });
});

router.post('/userpoints', async (req, res) => {
    var logger = res.locals.logger;
    var phone = !isNaN(util.checkInt(req.body.Phone)) ? util.checkInt(req.body.Phone):0;
    var db = res.locals.db;
    var sequelize = db.sequelize;
    var operateShopID = res.locals.ShopID;
    var cost = !isNaN(util.checkInt(req.body.Cost))? util.checkInt(req.body.Cost):0;
    var recharged = !isNaN(util.checkInt(req.body.Recharged)) ? util.checkInt(req.body.Recharged):0;
    var bounus = !isNaN(util.checkInt(req.body.ShopBounusPoints))? util.checkInt(req.body.ShopBounusPoints):0;
    var recommendPoints = !isNaN(util.checkInt(req.body.RecommendPoints))? util.checkInt(req.body.RecommendPoints):0;
    var indirectRecommendPoints = !isNaN(util.checkInt(req.body.IndirectRecommendPoints))? util.checkInt(req.body.IndirectRecommendPoints):0;
    logger.info(`phone: ${phone}, operateShopID: ${operateShopID}, 
         cost: ${cost},recharged:${recharged}, bounus: ${bounus}, 
         recommendPoints: ${recommendPoints}, indirectRecommendPoints: ${indirectRecommendPoints}`);
    if (phone == null) {
        res.json({
            error: {
                message: '无客户电话信息'
            }
        }).end();
        return
    }
    if (cost < 0 || recharged < 0) {
        res.json({
            error: {
                message: '交易积分须大于等于0'
            }
        }).end();
        return;
    }
    if (bounus < 0 || recommendPoints < 0 || indirectRecommendPoints < 0) {
        res.json({
            error: {
                message: '奖励积分须大于等于0'
            }
        }).end();
        return;
    }
    var roleOfOperatedShopID = await util.getRoleAsync(operateShopID);
    logger.info(roleOfOperatedShopID);
    if (roleOfOperatedShopID != 'normal') {
        res.json({
            error: {
                message: '该用户无权完成操作'
            }
        }).end();
        return;
    }
    if (!await util.isBelongsToByPhoneAsync(phone, operateShopID)) {
        res.json({
            error: {
                message: '无权操作其它分店客户账户'
            }
        }).end();
        return;
    }
    var customerInfo = null;
    var recommendCustomerInfo = null;
    var indirectRecommendCustomerInfo = null;
    var date = Date.parse(Date());
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
                    customerInfo = row;
                    if (customerInfo.Status != 1){
                        throw "用户状态不正确，本次交易拒绝。";
                    }
                    recommendCustomerInfo = await customerInfo.getRecommendCustomerInfo();
                    logger.info(customerInfo.dataValues);

                    recommendCustomerInfo && logger.info(recommendCustomerInfo.dataValues);
                    if (recommendCustomerInfo){
                        indirectRecommendCustomerInfo = await recommendCustomerInfo.getRecommendCustomerInfo();
                    }    
                    
                    indirectRecommendCustomerInfo &&  logger.info(indirectRecommendCustomerInfo.dataValues);
                    var transactionOptions = {
                        ChargedPoints: recharged,
                        Date: date,
                        CustomedPoints: cost,
                        ShopBounusPoints: bounus,
                        ShopID: operateShopID,
                        CustomerID: customerInfo.CustomerID,
                    };
                    var shopAcctInfoOptions = {
                        CustomedPoints: cost,
                        RecommendPoints: 0,
                        ChargedPoints: recharged,
                        ShopBounusPoints: bounus
                    };
                    var shopAcctChangeRecommendPointAmount = 0;
                    var custAcctInfo = await db.CustomerAccountInfo.findOne(
                        {
                            where: {
                                CustomerID: customerInfo.CustomerID
                            }
                        }, {
                            transaction: transaction
                        }
                    )
                    if (custAcctInfo.RemainPoints + recharged + bounus < cost){
                        //res.json({error:{message:"本次消费积分余额不足"}}).end();
                        throw "本次消费积分余额不足" ;
                    }
                    await db.CustomerAccountInfo.increment({
                        RemainPoints: recharged - cost + bounus,
                        ShopBounusPoints: bounus,
                        ChargedPoints: recharged,
                        CustomedPoints: cost,
                    }, {
                        where: {
                            CustomerID: customerInfo.CustomerID
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
                                CustomerID: recommendCustomerInfo.CustomerID
                            }
                        }, {
                            transaction: transaction
                        })
                        logger.info("recommendCustomerInfo CustomerAccountInfo increment ");
                        transactionOptions.RecommendPoints = recommendPoints;
                        transactionOptions.RecommendCustomerID = recommendCustomerInfo.CustomerID;
                        shopAcctInfoOptions.RecommendPoints += recommendPoints;
                    }
                    if (indirectRecommendCustomerInfo) {
                        await db.CustomerAccountInfo.increment({
                            RemainPoints: indirectRecommendPoints,
                            IndirectRecommendPoints: indirectRecommendPoints
                        }, {
                            where: {
                                CustomerID: indirectRecommendCustomerInfo.CustomerID
                            }
                        }, {
                            transaction: transaction
                        });
                        logger.info("indirectRecommendCustomerInfo CustomerAccountInfo increment ");
                        transactionOptions.IndirectRecommendPoints = indirectRecommendPoints;
                        transactionOptions.IndirectRecommendCustomerID = indirectRecommendCustomerInfo.CustomerID;
                        shopAcctInfoOptions.RecommendPoints += indirectRecommendPoints;
                    }
                    var transactionInstance = await db.TransactionDetail.create(
                        transactionOptions, {
                            transaction: transaction
                        }
                    );
                    logger.info("TransactionDetail create");
                    await db.ShopAccountInfo.increment(
                        shopAcctInfoOptions, {
                            where: {
                                ShopID: operateShopID
                            }
                        }, {
                            transaction: transaction
                        }
                    );
                    logger.info("ShopAccountInfo increment");
                    await db.CustomerAccountChange.create({
                        CustomerID: customerInfo.CustomerID,
                        ChargedPoints: recharged,
                        CustomedPoints: cost,
                        ShopBounusPoints: bounus,
                        Date: date,
                        ShopID:operateShopID,
                        TransactionSeq:transactionInstance.TransactionSeq
                    }, {
                        transaction: transaction
                    });
                    
                    logger.info("customerInfo CustomerAccountChange create");
                    if (recommendCustomerInfo) {
                        await db.CustomerAccountChange.create({
                            CustomerID: recommendCustomerInfo.CustomerID,
                            RecommendPoints:recommendPoints,
                            Date: date,
                            ShopID:operateShopID,
                            TransactionSeq:transactionInstance.TransactionSeq
                    }, {
                            transaction: transaction
                        });
                        shopAcctChangeRecommendPointAmount += recommendPoints;
                        logger.info("recommendCustomerInfo CustomerAccountChange create");
                    }
                    if (indirectRecommendCustomerInfo) {
                        await db.CustomerAccountChange.create({
                            CustomerID: indirectRecommendCustomerInfo.CustomerID,
                            IndirectRecommendPoints:indirectRecommendPoints,
                            ShopID:operateShopID,
                            Date: date,
                            TransactionSeq:transactionInstance.TransactionSeq
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
                        RecommendPoints:shopAcctChangeRecommendPointAmount,
                        Date: date,
                        ShopID:operateShopID,
                        TransactionSeq:transactionInstance.TransactionSeq
                    }, {
                        transaction: transaction
                    });

                    return db.CustomerAccountInfo.findOne({
                        where:{
                            CustomerID:customerInfo.CustomerID
                        },include:{
                            model:db.CustomerInfo,
                            require:true
                        }
                    },{transaction:transaction});
                })
        })
        .then(result=>{
            logger.info(result);
            res.json({data:result}).end();
        })
        .catch(err => {
            // Rolled back
            logger.error(err);
            res.json({error:{message:err}}).end();
        });
});

module.exports = router;
