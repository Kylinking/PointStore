'use strict';

var log4js = require('log4js');
let path = require('path');
let logDir = path.resolve(__dirname+'/LOG');
log4js.configure({
    appenders:{
        console:{type:'console'},
        file:{type:'dateFile',filename:logDir,pattern:'yyyy-MM-dd',alwaysIncludePattern :true},
    },
    categories:{
        default:{appenders:['file','console'],level:'trace'},
        file:{appenders:['file'],level:'trace'},
    }
  });
var logger = log4js.getLogger();
logger.level = 'trace';
module.exports = logger;