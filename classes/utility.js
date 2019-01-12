const moment = require('moment');
const redisClient = require('../models').redisClient;
const jwt = require('jwt-simple');
const jwtSecret = require('../config/global.json').jwtSecret;
const expireDuration = 3;// 60s
let Utility = class {
    static ComputeTime(timePoints){
        let {start,end} = {...timePoints};
        start = start || null;
        end = end || null;
        end = Date.parse(moment(end).format("MM DD YYYY"));
        start = Date.parse(moment(start).format("MM DD YYYY"));
        if (isNaN(end) && isNaN(start)) {
            end = Date.parse(moment().format());
            start = Date.parse(moment().subtract(30, 'days').format("MM DD YYYY"));
        } else if (isNaN(end) && !isNaN(start)) {
            end = Date.parse(moment(start).add(30, 'days').format("MM DD YYYY"));
        } else if (!isNaN(end) && isNaN(start)) {
            start = Date.parse(moment(end).subtract(30, 'days').format("MM DD YYYY"));
        } else {
            if (end < start) {
                [end, start] = [start, end];
            }
        }
        return {start,end};
    }

    static MakeResponse(obj)
    {
        let response = {
            data:{
                id:obj.id,
                type:obj.type,
                attributes:obj.attributes,
                relationships:obj.relationships
            }
        }
        if (obj.link){
            response = Object.assign(response,{
                link:obj.link
            })
        }
        return response;
    }

    static DecodeToken(token){
        try {
            return jwt.decode(token,jwtSecret);
        } catch (error) {
            //console.log(error.message);
            if(error.message == 'Token expired'){
                return {jwterror:error.message};
            }
            return {jwterror:'Token invalid'};
        }
    }
    static _EncodePayload(payload){
        return jwt.encode(payload,jwtSecret);
    }
    // 小程序端token无失效时间，店铺端失效时间为5分钟
    static EncodeToken(params,expire=expireDuration){
        // jwt time count as seconds not millseconds
        const date = Date.parse(new Date())/1000;
        const payload = Object.assign(params,{
            iat:date,
            exp:expire+date,
            sub:"Authentication"
        });
        return Utility._EncodeToken(payload);
    }

    static RefreshToken(token,expire=expireDuration){
        let tokenBody = Utility.DecodeToken(token);
        if (tokenBody.jwterror){
            return tokenBody;
        }
        const date = Date.parse(new Date())/1000;
        const payload = Object.assign(tokenBody,{
            iat:date,
            exp:date+expire,
        })
        return Utility._EncodeToken(payload);
    }

    static MakeAsyncRedisMethod(fn,redisClient){
        const promisify = require('util').promisify;
        return promisify(fn).bind(redisClient);
    }
}
module.exports = Utility;