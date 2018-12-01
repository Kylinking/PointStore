'use strict';
let db = require('../models').db;
let log = require("../log/");
const SMSClient = require('@alicloud/sms-sdk');
const globalConfig = require('../config/global.json');
const secretAccessKey = globalConfig.sms.secretAccessKey;
const accessKeyId = globalConfig.sms.accessKeyId;
const signName = globalConfig.sms.SignName;
let testSmsPhone = "13890651725";

let SMS = {
    sendMessage:async function (phone, template, params,content) {
    for (let i of arguments){
        log.info(i);
    }
    return 'OK'; 
    phone = testSmsPhone;
    let smsClient = new SMSClient({
        accessKeyId,
        secretAccessKey
    });
    return smsClient.sendSMS({
        PhoneNumbers: phone,
        SignName: signName,
        TemplateCode: template,
        TemplateParam: params
    }).then(function (res) {
        let {
            Code
        } = res;
        let status = 0;
        if (Code === 'OK') {
            status = 1;    
        }
        let paramsObj = JSON.parse(params);
            db.ShortMessageInfo.create({
                CustomerName: paramsObj.name,
                ShopName:paramsObj.shop,
                Phone:phone,
                Template:template,
                SignName:signName,
                Content:content,
                Date:new Date(),
                Result:JSON.stringify(res),
                Status:status
            });
    }, function (err) {
            log.error(phone);
            log.error(template);
            log.error(params);
            let paramsObj = JSON.parse(params);
            db.ShortMessageInfo.create({
                CustomerName: paramsObj.name,
                ShopName:paramsObj.shop,
                Phone:phone,
                Template:template,
                SignName:signName,
                Content:content,
                Date:new Date(),
                Result:JSON.stringify(err),
                Status:0
            });
    })
},
sendRecommendMessage:async function (name, shop, bounus, remainMoney, remainPoints, phone) {
    let param = JSON.stringify({
        name,
        shop,
        bounus,
        remainMoney,
        remainPoints
    });
    let content = `尊敬的${name}用户，您推荐的朋友在${shop}完成消费，您获得该店推荐积分${bounus}分。 现您的账户余额为${remainMoney}元，可用积分为${remainPoints}分。`;
    return this.sendMessage(phone, globalConfig.sms.recommendTemplate, param,content);
},
sendRechargeMessage:async function (name, shop, payCash, remainMoney, remainPoints, phone) {
    let param = JSON.stringify({
        name,
        shop,
        payCash,
        remainMoney,
        remainPoints
    });
    let content = `尊敬的${name}用户，您在${shop}充值现金${payCash}元已经到帐。 现您的账户余额为${remainMoney}元，可用积分为${remainPoints}分。`;
    return this.sendMessage(phone, globalConfig.sms.rechargeTemplate, param,content);
},
sendMixCostMessage: async function (name, shop, costOrignal, discount, payCash,payBanlance,bounus,remainMoney,remainPoints, phone) {
    let param = JSON.stringify({
        name,
        shop,
        remainMoney,
        remainPoints,
        costOrignal, 
        discount, 
        payCash,
        payBanlance,
        bounus,
    });
    let content = `尊敬的${name}用户，您在${shop}消费共计${costOrignal}元。积分抵扣${discount}元，余额支付${payBanlance}元，支付现金${payCash}元，获得该店奖励积分${bounus}分。 现您的账户余额为${remainMoney}元，可用积分为${remainPoints}分。`;
    return this.sendMessage(phone, globalConfig.sms.mixCostTemplate, param,content);
},
sendNewMemberMessage: async function (name, shop,shopName,phone) {
    let param = JSON.stringify({
        name,
        shop,
        shopName
    });
    let content =`尊敬的${name}用户，恭喜你成为${shop}的联动会员，你在该店所有的消费都会获得积分，同时你也可以通过推荐朋友的消费来获得积分，积分可以在 ${shopName} 抵扣消费。`;
    return this.sendMessage(phone, globalConfig.sms.newMemberTemplate, param,content);
},
sendReversalCostMessage: async function (name, shop,transactionSeq,remainMoney,remainPoints,phone) {
    let param = JSON.stringify({
        name,
        shop,
        transactionSeq,
        remainMoney,
        remainPoints,
    });
    let content =`尊敬的${name}用户，您在${shop}发生的消费已撤销，查询编号为${transactionSeq},现您的账户余额为${remainMoney}元，可用积分为${remainPoints}分。`;
    return this.sendMessage(phone, globalConfig.sms.reversalCostTemplate, param,content);
},
sendReversalPointMessage: async function (name, shop,transactionSeq,remainMoney,remainPoints,phone) {
    let param = JSON.stringify({
        name,
        shop,
        transactionSeq,
        remainMoney,
        remainPoints,
    });
    let content =`尊敬的${name}用户，我们抱歉的通知您，因您的好友在${shop}发生的消费已撤销，您的奖励积分已退回，查询编号为${transactionSeq}。现您的账户余额为${remainMoney}元，可用积分为${remainPoints}分。`;
    return this.sendMessage(phone, globalConfig.sms.reversalPointTemplate, param,content);
},

sendRegisterMessage: async function (code,phone) {
    let param = JSON.stringify({
        code
    });
let content = `尊敬的用户，您正在申请小程序绑定联动会员，验证码为：${code}，5分钟内有效！`
return this.sendMessage(phone, globalConfig.sms.registerTemplate, param,content);
},

}

module.exports = SMS;

