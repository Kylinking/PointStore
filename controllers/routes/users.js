'use strict';
let express = require('express');
let router = express.Router();
let jwt = require('jwt-simple');
let jwtSecret = require('../../config/global.json').jwtSecret;
let util = require('../../util/util');
let https = require('https');
let SMS = require('../../util/sms');
let globalConfig = require('../../config/global.json');
router.get('/login', async function (req, res, next) {
    let code = req.query.Code;
    let db = res.locals.db;
    let token = req.query.Token;
    console.log(token);
    let appid = globalConfig.appid;
    let appSecret = globalConfig.appSecret;
    let url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`
    if (code) {
        https.get(url, (result) => {
            result.on('data', async (buffer) => {
                let jsonObj = JSON.parse(buffer.toString());
                console.log(jsonObj);
                let record = await db.WechatUser.findOne({
                    where: {
                        WechatId: jsonObj.openid
                    }
                })
                if (record) {
                    let customerInfo = (await record.getCustomerInfo()).toJSON();
                    console.log(customerInfo);
                    let customerAccountInfo = await db.CustomerAccountInfo.findOne({
                        where: {
                            CustomerId: customerInfo.CustomerId
                        }
                    });
                    customerInfo.CustomerAccountInfo = util.ConvertObj2Result(customerAccountInfo.toJSON());
                    res.json({
                        Data: customerInfo
                    }).end();
                } else {
                    let token = jwt.encode({
                        WechatId: jsonObj.openid
                    }, jwtSecret);
                    res.json({
                        Data: {
                            Code: 204,
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
            if (record) {
                let customerInfo = (await record.getCustomerInfo()).toJSON();
                console.log(customerInfo);
                let customerAccountInfo = await db.CustomerAccountInfo.findOne({
                    where: {
                        CustomerId: customerInfo.CustomerId
                    }
                });
                customerInfo.CustomerAccountInfo = util.ConvertObj2Result(customerAccountInfo.toJSON());
                res.json({
                    Code: 200,
                    Data: customerInfo
                }).end();
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

router.get('/register', async function (req, res, next) {
    let token = req.query.Token;
    let phone = isNaN(util.checkPhone(req.query.Phone)) ? null : req.query.Phone;
    let verifyCode = req.query.VerifyCode;
    let redisClient = res.locals.redisClient;
    let logger = res.locals.logger;
    let db = res.locals.db;
    if (phone === null){
        res.json({
            Code:400,
            Error:{Message:"绑定用户需要手机号"}
        }).end();
        return;
    }
    try {
        let decoded = jwt.decode(token, jwtSecret);
        console.log(decoded);
        if (decoded.Phone != phone){
            res.json({
                Code:400,
                Error:{Message:"手机号与验证码不符"}
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
                            CustomerId:customerInfo.CustomerId
                        });
                        let customerAccountInfo = db.CustomerAccountInfo.findOne({
                            where:{CustomerId:customerInfo.CustomerId}
                        });
                        customerInfo = customerInfo.toJSON();
                        customerInfo.CustomerAccountInfo = customerAccountInfo;
                        res.json({Code:200,Data:{customerInfo}}).end();
                    }else{
                        res.json({
                            Code: 400,
                            Error: {
                                Message: "该手机号未注册，无法绑定"
                            }
                        }).end();
                        return;
                    }
                }else{
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
                Code:500,
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

router.get('/verify',async function (req, res, next) {
    let token = req.query.Token;
    let phone = isNaN(util.checkPhone(req.query.Phone)) ? null : req.query.Phone;
    let redisClient = res.locals.redisClient;
    let logger = res.locals.logger; 
    if (phone === null){
        res.json({
            Code:400,
            Error:{Message:"请输入手机号"}
        }).end();
        return;
    }
    console.log(req.ip.toString());
    const {
        promisify
    } = require('util');
    const getAsync = promisify(redisClient.get).bind(redisClient);
    let reply = await getAsync(req.ip.toString());
    if (reply){
        res.json({Code:429,Error:{Message:"请求太频繁！"}}).end();
        return;
    }
    try {
        console.log(token);
        let decoded = jwt.decode(token, jwtSecret);
        console.log(decoded);
        let verifyCode = GetVerifyCode();
        console.log(verifyCode);
        SMS.sendRegisterMessage(verifyCode,phone);
        redisClient.set(decoded.WechatId,verifyCode);
        redisClient.set(req.ip.toString(),new Date());
        redisClient.expire(decoded.WechatId,5*60);
        redisClient.expire(req.ip.toString(),30);
        token = jwt.encode({
            WechatId:decoded.WechatId,
            Phone:phone
        },jwtSecret);
        res.json({Code:200,Data:{Token:token}}).end();
    }catch(error){
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

function GetVerifyCode()
{
    let code = [];
    for (let i=0;i<6;i++){
        code.push((Math.ceil(Math.random()*10)%10));
    }
    return code.join('');
}
module.exports = router;