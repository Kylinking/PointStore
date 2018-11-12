'use strict';
let util = require('../../../../util/util');
let express = require('express');
let router = express.Router();
const Op = require('sequelize').Op;
let SMS = require('../../../../util/sms');

router.get('/customers', async (req, res) => {
    let customerInfo = res.locals.db.CustomerInfo;
    let shopInfo = res.locals.db.ShopInfo;
    let db = res.locals.db;
    let logger = res.locals.logger;
    let operateShopId = res.locals.shopid;
    let queryShopId = util.makeNumericValue(req.query.ShopId, null);
    let phone = isNaN(util.checkPhone(req.query.Phone)) ? null : req.query.Phone;
    let page = util.makeNumericValue(req.query.Page, 1);
    let pageSize = util.makeNumericValue(req.query.Size, 20);
    let name = req.query.Name || null;
    let offset = (page - 1) * pageSize;
    let recommendPhone = isNaN(util.checkPhone(req.query.RecommendPhone)) ? null : req.query.RecommendPhone;
    let recommendId = null;
    let recommendCustomer;
    let whereObj = {};
    if (phone != null) whereObj.Phone = {
        [Op.like]: `%${phone}%`
    };
    if (name != null) whereObj.Name = {
        [Op.like]: `%${name}%`
    };
    if (recommendPhone != null) {
        recommendCustomer = await customerInfo.findOne({
            where: {
                Phone: recommendPhone
            }
        });
        if (recommendCustomer) {
            recommendId = recommendCustomer.CustomerId;
        }
    };
    if (recommendId != null) {
        whereObj.RecommendCustomerId = recommendId;
    };
    try {
        let operateShop = await db.ShopInfo.findOne({
            where: {
                ShopId: operateShopId
            }
        });
        let queryShop = null;
        if (queryShopId !== null) {
            queryShop = await db.ShopInfo.findOne({
                where: {
                    ShopId: queryShopId
                }
            });
            if (queryShop == null) {
                throw `ShopId:${queryShopId}店面不存在`;
            }
        }
        let includeObj = [{
            model: shopInfo,
            required: true
        }, {
            model: customerInfo,
            as: "RecommendCustomerInfo",
            required: false
        }];
        switch (operateShop.Type) {
            case 0:
                if (queryShopId != null) {
                    if (queryShop.Type == 1) {
                        whereObj.ShopId = queryShopId;
                    } else if (queryShop.Type == 2) {
                        whereObj.ShopId = queryShop.ParentShopId;
                    }
                }
                break;
            case 1:
                if (queryShopId != null) {
                    if (queryShop.Type == 1) {
                        if (queryShopId != operateShopId) {
                            throw `无权限查询ShopId:${queryShopId}店面客户信息`;
                        }
                        whereObj.ShopId = queryShopId;
                    } else if (queryShop.Type == 2) {
                        if (queryShop.ParentShopId != operateShopId) {
                            throw `无权限查询ShopId:${queryShopId}店面客户信息`;
                        }
                        whereObj.ShopId = queryShop.ParentShopId;
                    } else {
                        throw `无权查询ShopId:${queryShopId}客户信息`
                    }
                } else {
                    whereObj.ShopId = operateShopId;
                }
                break;
            default:
                whereObj.ShopId = operateShop.ParentShopId;
                break;
        }
        logger.info(`whereObj:${whereObj},include:${includeObj}`);
        let instance = await customerInfo.findAndCountAll({
            where: whereObj,
            //include: includeObj,
            limit: pageSize,
            offset: offset
        });
        let json = {
            Array: [],
            Meta: {}
        };
        let pages = Math.ceil(instance.count / pageSize);
        for (let row of instance.rows) {
            //add CustomerAccountInfo to records
            let record = await db.CustomerAccountInfo.findOne({
                where: {
                    CustomerId: row.CustomerId
                }
            });
            let recommendCustomer = await row.getRecommendCustomerInfo();
            if (recommendCustomer) {
                row.dataValues["RecommendPhone"] = recommendCustomer.Phone;
            } else {
                row.dataValues["RecommendPhone"] = null;
            }
            row.dataValues["CustomerAccountInfo"] = util.ConvertObj2Result(record.toJSON());
            json.Array.push(row);
        }
        json.Meta["TotalPages"] = pages;
        json.Meta["CurrentRows"] = instance.rows.length;
        json.Meta["TotalRows"] = instance.count;
        json.Meta["CurrentPage"] = page;
        logger.info(json);
        res.json(json).end();
    } catch (error) {
        logger.error(error);
        res.json({
            Error: {
                Message: error
            }
        }).end();
    }
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
    let operateShopId = res.locals.shopid;
    let shopId = util.makeNumericValue(req.body.ShopId, null);
    let recommendCustomerId = null;
    let recommendPhone = isNaN(util.checkPhone(req.body.RecommendPhone)) ? null : req.body.RecommendPhone;
    logger.info('POST /customers')
    logger.info(`phone:${phone},status:${status},name:${name},sex:${sex},age:${age},recommendPhone:${recommendPhone},address:${address}`);
    [phone, sex, name].forEach(elem => {
        if (elem == null) {
            res.json({
                Error: {
                    Message: "Name,Phone,Sex不能为空！"
                }
            });
            return;
        }
    });
    let operatedShop;
    let queryShop;
    try {
        // if (await res.locals.db.CustomerInfo.findOne({
        //     where: {
        //         Phone: phone,
        //         ShopId:
        //     }
        // })){
        //      throw "客户联系电话已存在";
        // }
        operatedShop = await res.locals.db.ShopInfo.findOne({
            where: {
                ShopId: operateShopId
            }
        });
        if (shopId != null) {
            queryShop = await res.locals.db.ShopInfo.findOne({
                where: {
                    ShopId: shopId
                }
            });
        }
        let createCondition = {
            Name: name,
            Address: address,
            Status: status,
            Phone: phone,
            Sex: sex,
            Age: age,
        };
        if (operatedShop.Type === 1) {
            createCondition.ShopId = operateShopId;
        } else if (operatedShop.Type === 0) {
            if (shopId == null || await util.isSupermanAsync(shopId)) {
                throw "需要客户归属总店Id"
            } else {
                if (queryShop.Type == 1) {
                    createCondition.ShopId = shopId;
                } else if (queryShop.Type == 2) {
                    createCondition.ShopId = queryShop.ParentShopId;
                }
            }
        } else {
            if (shopId !== null && shopId !== operatedShop.ParentShopId) {
                throw `无权创建该店面客户信息,ShopId:${shopId}.`;
            } else {
                createCondition.ShopId = operatedShop.ParentShopId;
            }
        }
        if (recommendPhone != null) {
            if (recommendPhone == phone){
                throw "推荐人不能是自己";
            }
            let recommendCustomer = await res.locals.db.CustomerInfo.findOne({
                where: {
                    Phone: recommendPhone
                }
            });
            logger.info(recommendCustomer);
            if (recommendCustomer != null) {
                recommendCustomerId = recommendCustomer.CustomerId;
                if (!await util.isBelongsToByIdAsync(recommendCustomerId, createCondition.ShopId)) {
                    throw "推荐人电话号码不是本店会员号码";
                } else {
                    createCondition.RecommendCustomerId = recommendCustomerId;
                }
            }else{
                throw "推荐人电话号码不是本店会员号码";
            }
        }
        logger.info(`createCondition:${createCondition.toString()}`);
        let newCustomer;
        let newCustomerAccount;
        res.locals.db.sequelize.transaction(async transaction => {
            try {
                newCustomer = await customerInfo.create(createCondition, {
                    transaction: transaction
                });
                newCustomerAccount = await res.locals.db.CustomerAccountInfo.create({
                    CustomerId: newCustomer.CustomerId,
                    ShopBounusPoints: 0,
                    RecommendPoints: 0,
                    IndirectRecommendPoints: 0,
                    ThirdRecommendPoints: 0,
                    CustomedPoints: 0,
                    RemainPoints: 0,
                    ChargedMoney: 0,
                    CustomedMoney: 0,
                    RemainMoney: 0,
                }, {
                    transaction: transaction
                });
                logger.info('POST /customers success');
                res.json({
                    Object: newCustomer
                }).end();
                SMS.sendNewMemberMessage(newCustomer.Name, operatedShop.Name, "阿文造型")
            } catch (error) {
                if (error.name != null) {
                    if (error.errors[0].type == "unique violation") {
                        error = "客户联系电话已存在";
                    }
                }
                logger.error(error);
                res.json({
                    Error: {
                        Message: error
                    }
                }).end();
            }
        });
    } catch (error) {
        logger.error(error);
        res.json({
            Error: {
                Message: error
            }
        }).end();
    }
});

router.delete('/customers', async (req, res) => {
    let customerInfo = res.locals.db.CustomerInfo;
    let logger = res.locals.logger;
    let db = res.locals.db;
    let operateShopId = res.locals.shopid;
    let phone = isNaN(util.checkPhone(req.body.Phone)) ? null : req.body.Phone;
    logger.info('DELETE /customers');
    if (phone == null) {
        res.json({
            Error: {
                Message: "客户电话不能为空"
            }
        }).end();
        return;
    }
    let operateShop = await db.ShopInfo.findOne({
        where: {
            ShopId: operateShopId
        }
    });
    let whereObj = {
        Phone: phone
    };
    switch (operateShop.Type) {
        case 2:
            whereObj.ShopId = operateShop.ParentShopId;
            break;
        case 1:
            whereObj.ShopId = operateShopId;
            break;
        default:
            break;
    }

    let instance = await customerInfo.findOne({
        where: whereObj
    });
    if (instance) {
        if (instance.Status == 0) {
            res.json({
                Error: {
                    Message: "该客户已注销"
                }
            }).end();
            return;
        }
        instance.set('Status', 0);
        instance.save().then((row) => {
        logger.info('DELETE /customers success');
        res.json({
                Object: row
            }).end();
        }).catch((error) => {
            res.json({
                Error: {
                    Message: "数据写入失败"
                }
            }).end();
        });
    } else {
        logger.info(`无此客户`);
        res.json({
            Error: {
                Message: "无此客户"
            }
        }).end();
    }
});

router.patch('/customers', async (req, res) => {
    let customerInfo = res.locals.db.CustomerInfo;
    let logger = res.locals.logger;
    let operateShopId = res.locals.shopid;
    let db = res.locals.db;
    let phone = isNaN(util.checkPhone(req.body.Phone)) ? null : req.body.Phone;
    let status = util.makeNumericValue(req.body.Status, null);
    let name = req.body.Name || null;
    let address = req.body.Address || null;
    let sex = req.body.Sex || null;
    let age = util.makeNumericValue(req.body.Age, null);
    let customerId = util.makeNumericValue(req.body.CustomerId, null);
    //let recommendCustomerId = util.makeNumericValue(req.body.RecommendCustomerId, null);
    let recommendPhone = isNaN(util.checkPhone(req.body.RecommendPhone)) ? null : req.body.RecommendPhone;
    logger.info(`PATCH /customers`);
    logger.info(`phone:${phone},status:${status},name:${name},address:${address},age:${age},customerId:${customerId}`);
    if (customerId == null) {
        res.json({
            Error: {
                Message: "CustomerId不能为空"
            }
        }).end();
        return;
    }
    let operateShop = await db.ShopInfo.findOne({
        where: {
            ShopId: operateShopId
        }
    });
    let whereObj = {};
    whereObj.CustomerId = customerId;
    switch (operateShop.Type) {
        case 0:
            break;
        case 1:
            whereObj.ShopId = operateShopId;
            break;
        default:
            whereObj.ShopId = operateShop.ParentShopId;
            break;
    }
    try {
        let instance = await customerInfo.findOne({
            where: whereObj
        });
        if (instance) {
            logger.info('before:')
            logger.info(instance);
            if (phone != null) {
                let customer = await customerInfo.findOne({
                        where: {
                            Phone: phone
                        }
                    });
                if (customer && customer.CustomerId != instance.CustomerId) 
                {
                    throw "电话号码已存在";
                }
                if (recommendPhone != null) {
                    if (recommendPhone == phone || recommendPhone == instance.Phone){
                        throw "推荐人不能是自己";
                    }
                }
                instance.set("Phone", phone);
            }
            if (recommendPhone != null) {
                let recommendCustomer = await customerInfo.findOne({
                    where: {
                        Phone: recommendPhone
                    }
                });
                if (recommendCustomer != null) {
                    if (!await util.isBelongsToByIdAsync(recommendCustomer.CustomerId, instance.ShopId)) {
                        throw "推荐人电话号码不是本店会员号码";
                    } else {
                        instance.set('RecommendCustomerId', recommendCustomer.CustomerId);
                    }
                } else {
                    throw "推荐人电话号码不是本店会员号码";
                }
            }else{
                instance.set('RecommendCustomerId', null)
            }
            if (status != null) {
                instance.set('Status', status);
            }
            instance.set('Address', address);
            instance.set('Name', name);
            if (sex != null) instance.set('Sex', sex);
            instance.set('Age', age);
            instance.save().then((row) => {
            logger.info(`PATCH /customers success`);
            logger.info('after:')
            logger.info(row);
            res.json({
                    Object: row
                }).end();
            }).catch((err) => {
                logger.error(err);
                res.json({
                    Error: {
                        Message: err
                    }
                }).end();
            })
        }
    } catch (error) {
        logger.error(error);
        res.json({
            Error: {
                Message: error
            }
        }).end();
    }
});

router.use('/customers', (req, res) => {
    logger.info(`${req.path}无服务`);
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