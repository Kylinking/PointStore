'use strict';

var express = require('express');
var router = express.Router();
var path = require('path'); 
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

router.use('/',apis);

router.use((err,req,res,next)=>{
   // res.status(err.status || 500);
    res.json({error:{message:err.message}}).end();
})



module.exports = router;
