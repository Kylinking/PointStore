'use strict';

var express = require('express');
var router = express.Router();
var path = require('path'); 
var jwt = require('jwt-simple');
var jwtSecret = require('../../../config/global.json').jwtSecret;
var fs = require('fs');
var basename = path.basename(__filename);
var apis = [];
const version = 'v1';

fs  
    .readdirSync(path.join(__dirname,version))
    .filter(file => {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.endsWith('.js'));
    })
    .forEach(file => {
        file = file.substring(0,file.lastIndexOf('.'));
        apis.push(require(path.join(__dirname,version,file)));
    });

router.use('/',(req,res,next)=>{
    var apiFile = path.join(__dirname,req.path);
    if(apiFile.endsWith('\\')){
        apiFile = apiFile.substring(0,apiFile.length-1);
    }
    apiFile += '.js';    
    if(!fs.existsSync(apiFile)){
        next(new Error("404 Not Found"));
    }
    next();
});

//Check authentication and expire time
router.use('/',(req,res,next)=>{
    let token = req.header('TOKEN');
    let redisClient = res.locals.redisClient;
    res.locals.logger.info("header token :" + token);
    var decoded = jwt.decode(token, jwtSecret);
    res.locals.logger.info(decoded);
    res.locals.ShopID = decoded.ShopID;
    redisClient.get(decoded.ShopID, function(err, reply) {
        if (err) console.log(err);
        if (reply == null){
            next({message:"登录失效"});
        }
    });
    next();
})

router.use('/'+version,apis);

router.use((err,req,res,next)=>{
    //res.status(err.status || 500);
    console.log(__filename);
    res.json({error:{message:err.message}});
    next(err);
})

module.exports = router;
