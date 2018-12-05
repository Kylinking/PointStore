'use strict';

let path = require('path');
let jwt = require('jwt-simple');
let jwtSecret = require('../../../config/global.json').jwtSecret;
const util = require("../../../util/util");
const db = require('../models').db;
const logger = require('../../../log');
const redisClient = db.redisClient;


let Authentication = {
    authenticate: async function(req,res,next)
    {
        let token = req.header('TOKEN');
        try {
            let decoded = jwt.decode(token, jwtSecret);
            logger.info(decoded);
            let {user,timeStamp} = {...decoded}; 
            // user:{id:xxxx,name:xxxx,role:['casher'] or ['casher', 'advance']}
            // timeStamp expired in 60s or used 5 times
            try {
                const {
                    promisify
                } = require('util');
                const redisGetAsync = promisify(redisClient.get).bind(redisClient);
                let reply = await redisGetAsync(timeStamp);
                if (reply == null) {
                    next(new Error("登录失效"));
                } else if(--replay == 0){
                    redisClient.del(timeStamp);
                }else{
                    redisClient.decr(timeStamp);
                }
            } catch (error) {
                res.json({
                    Error: {
                        Message: "系统错误，请联系系统管理员。Redis Error!\n" + error.message
                    }
                }).end();
                return;
            }
            let action = req.method.toString().toUpperCase();
            let path = req.path.toString();
            //Permission.path is a regular expression to test this path
        } catch (error) {
            logger.error(error);
            res.json({
                Error: {
                    Message: "Token 无效"
                }
            }).end();
            return;
        }
        
    }


}

module.exports = Authentication;