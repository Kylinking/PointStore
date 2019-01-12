'use strict';
let express = require('express');
let router = express.Router();
let jwt = require('jwt-simple');
let jwtSecret = require('../../config/global.json').jwtSecret;
let util = require('../../util/util');
let https = require('https');
let SMS = require('../../util/sms');
let globalConfig = require('../../config/global.json');
router.post('/login', async function (req, res, next) {
    let code = req.body.Code;
    let db = res.locals.db;
    let token = req.body.Token;
    let appid = globalConfig.appid;
    let appSecret = globalConfig.appSecret;
    let url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`
    if (code) {
        https.get(url, (result) => {
            result.on('data', async (buffer) => {
                let jsonObj = JSON.parse(buffer.toString());
                console.log(jsonObj);
                if (jsonObj.errcode){
                    res.json({Code:400,Error:{Message:`Code参数错误,errorcode:${jsonObj.errcode},message:${jsonObj.errmsg}`}}).end();
                    return;
                }
                let record = await db.WechatUser.findOne({
                    where: {
                        WechatId: jsonObj.openid
                    }
                })
                if (instances.count > 0) {
                    let json = {
                        Array: []
                    };
                    let customerInfo;
                    for (let record of instances.rows) {
                        customerInfo = (await record.getCustomerInfo()).toJSON();
                        logger.info(customerInfo);
                        let customerAccountInfo = await db.CustomerAccountInfo.findOne({
                            where: {
                                CustomerId: customerInfo.CustomerId
                            }
                        });
                        customerInfo.CustomerAccountInfo = util.ConvertObj2Result(customerAccountInfo.toJSON());
                        customerInfo.ShopInfo = await db.ShopInfo.findById(customerInfo.ShopId);
                        json.Array.push(customerInfo);
                    }
                    token = jwt.encode({
                        WechatId: decoded.WechatId,
                        Phone: customerInfo.Phone
                    }, jwtSecret);
                    res.json({
                        Code: 200,
                        Data: {
                            CustomerInfo: customerInfo,
                            Token: token
                        }
                    }).end();
                } else {
                    token = jwt.encode({
                        WechatId: jsonObj.openid
                    }, jwtSecret);
                    res.json({
                        Code: 204,
                        Data: {
                            Token: token
                        }
                    }).end();
                }
            })
        })
    } else if (token) {
        try {
            let decoded = jwt.decode(token, jwtSecret);
            console.log(decoded);
            let record = await db.WechatUser.findOne({
                where: {
                    WechatId: decoded.WechatId
                }
            });
            if (instances.count > 0) {
                let json = {
                    Array: []
                };
                let customerInfo;
                for (let record of instances.rows) {
                    customerInfo = (await record.getCustomerInfo()).toJSON();
                    logger.info(customerInfo);
                    let customerAccountInfo = await db.CustomerAccountInfo.findOne({
                        where: {
                            CustomerId: customerInfo.CustomerId
                        }
                    });
                    customerInfo.CustomerAccountInfo = util.ConvertObj2Result(customerAccountInfo.toJSON());
                    customerInfo.ShopInfo = await db.ShopInfo.findById(customerInfo.ShopId);
                    json.Array.push(customerInfo);
                }
                token = jwt.encode({
                    WechatId: decoded.WechatId,
                    Phone: customerInfo.Phone
                }, jwtSecret);
                json.Code = 200;
                json.Token = token;
                res.json(json).end();
            } else {
                res.json({
                    Code: 204,
                    Data: {
                        Token: token
                    }
                }).end();
            }
        } catch (error) {
            console.log(error);
            res.json({
                Code: 400,
                Error: {
                    Message: "Token 无效"
                }
            }).end();
            return;
        }
    } else {
        res.json({
            Code: 400,
            Error: {
                Message: "无登录信息"
            }
        }).end();
        return;
    }
});

router.post('/register', async function (req, res, next) {
    let token = req.body.Token;
    let phone = isNaN(util.checkPhone(req.body.Phone)) ? null : req.body.Phone;
    let verifyCode = req.body.VerifyCode;
    let redisClient = res.locals.redisClient;
    let logger = res.locals.logger;
    let db = res.locals.db;
    if (phone === null) {
        res.json({
            Code: 400,
            Error: {
                Message: "绑定用户需要手机号"
            }
        }).end();
        return;
    }
    try {
        let decoded = jwt.decode(token, jwtSecret);
        console.log(decoded);
        if (decoded.Phone != phone) {
            res.json({
                Code: 400,
                Error: {
                    Message: "手机号与验证码不符"
                }
            }).end();
            redisClient.del(decoded.WechatId);
            return;
        }
        let record = await db.WechatUser.findOne({
            where: {
                WechatId: decoded.WechatId
            }
        })
        if (record) {
            res.json({
                Code: 409,
                Error: {
                    Message: "用户已存在"
                }
            }).end();
            redisClient.del(decoded.WechatId);
            return;
        }
        // redis 取验证码
        try {
            const {
                promisify
            } = require('util');
            const getAsync = promisify(redisClient.get).bind(redisClient);
            var reply = await getAsync(decoded.WechatId);
            if (reply == null) {
                res.json({
                    Code: 400,
                    Error: {
                        Message: "验证码无效"
                    }
                }).end();
                return;
            } else {
                if (reply == verifyCode) {
                    redisClient.del(decoded.WechatId);
                    let customerInfo = await db.CustomerInfo.findOne({
                        where: {
                            Phone: phone
                        }
                    });
                    if (customerInfo) {
                        await db.WechatUser.create({
                            WechatId: decoded.WechatId,
                            CustomerId: customerInfo.CustomerId
                        });
                        let customerAccountInfo = db.CustomerAccountInfo.findOne({
                            where: {
                                CustomerId: customerInfo.CustomerId
                            }
                        });
                        customerInfo = customerInfo.toJSON();
                        customerInfo.CustomerAccountInfo = customerAccountInfo;
                        res.json({
                            Code: 200,
                            Data: {
                                CustomerInfo:customerInfo
                            }
                        }).end();
                    } else {
                        res.json({
                            Code: 400,
                            Error: {
                                Message: "该手机号未注册，无法绑定"
                            }
                        }).end();
                        return;
                    }
                } else {
                    res.json({
                        Code: 400,
                        Error: {
                            Message: "验证码无效"
                        }
                    }).end();
                }
            }
        } catch (error) {
            res.json({
                Code: 500,
                Error: {
                    Message: "系统错误，请联系系统管理员。Redis Error：" + error.message
                }
            }).end();
            return;
        }
    } catch (error) {
        console.log(error);
        res.json({
            Code: 400,
            Error: {
                Message: "Token 无效"
            }
        }).end();
        return;
    }
});

router.post('/verify', async function (req, res, next) {
    let token = req.body.Token;
    let phone = isNaN(util.checkPhone(req.body.Phone)) ? null : req.body.Phone;
    let redisClient = res.locals.redisClient;
    let logger = res.locals.logger;
    if (phone === null) {
        res.json({
            Code: 400,
            Error: {
                Message: "请输入手机号"
            }
        }).end();
        return;
    }
    console.log(req.ip.toString());
    const {
        promisify
    } = require('util');
    const getAsync = promisify(redisClient.get).bind(redisClient);
    let reply = await getAsync(req.ip.toString());
    if (reply) {
        res.json({
            Code: 429,
            Error: {
                Message: "请求太频繁！"
            }
        }).end();
        return;
    }
    try {
        console.log(token);
        let decoded = jwt.decode(token, jwtSecret);
        console.log(decoded);
        let verifyCode = GetVerifyCode();
        console.log(verifyCode);
        SMS.sendRegisterMessage(verifyCode, phone);
        redisClient.set(decoded.WechatId, verifyCode);
        redisClient.set(req.ip.toString(), new Date());
        redisClient.expire(decoded.WechatId, 5 * 60);
        redisClient.expire(req.ip.toString(), 30);
        token = jwt.encode({
            WechatId: decoded.WechatId,
            Phone: phone
        }, jwtSecret);
        res.json({
            Code: 200,
            Data: {
                Token: token
            }
        }).end();
    } catch (error) {
        console.log(error);
        res.json({
            Code: 400,
            Error: {
                Message: "Token无效"
            }
        }).end();
        return;
    }
})

router.post('/history', async function (req, res, next) {
    let db = res.locals.db;
    let token = req.body.Token;
    let page = util.makeNumericValue(req.body.Page, 1);
    let pageSize = util.makeNumericValue(req.body.Size, 20);
    let offset = (page - 1) * pageSize;
    let startDate = req.body.Start || null;
    let endDate = req.body.End || null;
    let shopId = req.body.ShopId || null;
    endDate = Date.parse(moment(endDate).format());
    startDate = Date.parse(moment(startDate).format());
    if (isNaN(endDate) && isNaN(startDate)) {
        endDate = Date.parse(moment().format());
        startDate = Date.parse(moment().subtract(30, 'days').format());
    } else if (isNaN(endDate) && !isNaN(startDate)) {
        endDate = Date.parse(moment(startDate).add(30, 'days').format());
    } else if (!isNaN(endDate) && isNaN(startDate)) {
        startDate = Date.parse(moment(endDate).subtract(30, 'days').format());
    } else {
        if (endDate < startDate) {
            [endDate, startDate] = [startDate, endDate];
        }
    }
    logger.info(`startDate:${startDate},endDate:${endDate}`);

    let whereObj = {
        Date: {
            [Op.and]: [{
                [Op.gt]: Date.parse(moment(startDate).format("YYYY-MM-DD 00:00:00"))
            },
            {
                [Op.lt]: Date.parse(moment(endDate).add(1, "days").format("YYYY-MM-DD 00:00:00"))
            }
            ]
        }
    };
    if (token) {
        try {
            let decoded = jwt.decode(token, jwtSecret);
            logger.info(decoded);
            let instances = await db.WechatUser.findAndCountAll({
                where: {
                    WechatId: decoded.WechatId
                }
            });
            if (instances.count > 0) {
                whereObj.CustomerId = { [Op.or]: [] };
                for (let record of instances.rows) {
                    whereObj.CustomerId[Op.or].push(record.CustomerId);
                }
                let details = await db.CustomerAccountChange.findAndCountAll({
                    where: whereObj,
                    limit: pageSize,
                    offset: offset,
                    order: [
                        ['id', 'DESC']
                    ],
                });
                let data = [];
                for (let ele of details.rows) {
                    ele.Date = new Date(ele.Date);
                    ele.dataValues.ShopName = (await ele.getShopInfo()).Name;
                    data.push(util.ConvertObj2Result(ele.toJSON()));
                }
                let pages = Math.ceil(details.count / pageSize);
                let customerInfo = (await instances.rows[0].getCustomerInfo());
                let shopInfo = (await customerInfo.getShopInfo()).toJSON();
                customerInfo = customerInfo.toJSON();
                customerInfo.ShopInfo = shopInfo;
                let result = {
                    Array: data,
                    CustomerInfo: customerInfo,
                    Meta: {
                        PageSize: pageSize,
                        TotalPages: pages,
                        CurrentRows: details.rows.length,
                        TotalRows: details.count,
                        CurrentPage: page
                    }
                };
                result.Code = 200;
                res.json(result).end();
            } else {
                res.json({
                    Code: 400,
                    Error: {
                        Message: "Token无效"
                    }
                }).end();
            }
        } catch (error) {
            logger.info(error);
            res.json({
                Code: 400,
                Error: {
                    Message: "Token 无效"
                }
            }).end();
            return;
        }
    } else {
        res.json({
            Code: 400,
            Error: {
                Message: "需要传送Token"
            }
        }).end();
        return;
    }
});

function GetVerifyCode() {
    let code = [];
    for (let i = 0; i < 6; i++) {
        code.push((Math.ceil(Math.random() * 10) % 10));
    }
    return code.join('');
}
module.exports = router;