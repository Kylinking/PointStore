var log4js = require('log4js');
log4js.configure({
    appenders:{
        console:{type:'console'},
        file:{type:'dateFile',filename:'./log/access.log',pattern:'yyyy-MM-dd',alwaysIncludePattern :true},
    },
    categories:{
        default:{appenders:['file','console'],level:'trace'},
        file:{appenders:['file'],level:'trace'},
    }
  });
var logger = log4js.getLogger();
logger.level = 'trace';
module.exports = logger;