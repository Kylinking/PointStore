'use strict';

let path = require('path');
let jwt = require('jwt-simple');
let jwtSecret = require('../../../config/global.json').jwtSecret;
const util = require("../../../util/util");
const db = require('../../../models').db;
const logger = require('../../../log');
const redisClient = require('../../../models').redisClient;


var Authentication = {
    authenticate: async function(req,res,next)
    {
        let token = req.header('TOKEN');
        try {
            let {user,timeStamp} = {...jwt.decode(token, jwtSecret)}; 
            // user:{id:xxxx,name:xxxx,role:['casher'] or ['casher', 'advance']}
            // timeStamp expired in 60s or used 5 times
            try {
                const redisGetAsync = MakeAsyncRedisMethod(redisClient.get,redisClient);
                let reply = await redisGetAsync(timeStamp);
                if (reply == null) {
                    next(new Error("登录失效"));
                    return;
                } else if(--reply == 0){
                    redisClient.del(timeStamp);
                }else{
                    redisClient.decr(timeStamp);
                }
            } catch (error) {
                console.log(error);
                res.json({
                    Error: {
                        Message: "系统错误，请联系系统管理员。Redis Error!\n" + error.message
                    }
                }).end();
                return;
            }
            let action = req.method.toString().toUpperCase();
            let path = req.path.toString();
            let roleId = [1];
            let permissionIds = [];
            for(let id of roleId){
                (await db.PermissionOfRole.findAndCountAll({where:{RoleId:id}})).rows.map(element=>{
                    permissionIds.push(element.PermissionId);
                });
            }
            for (let id of permissionIds){
                console.log(id);
                let permission = await db.Permission.findOne({where:{
                    Action:action,
                    Id:id
                }})
                console.log(req.path);
                console.log(permission.Path);
                let re = new RegExp(permission.Path);
                if (re.test(path) ) next();
            }
            //next(new Error('无访问权限'));
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
function MakeAsyncRedisMethod(fn,redisClient)
{
    const promisify = require('util').promisify;
    return promisify(fn).bind(redisClient);
}

module.exports = Authentication;