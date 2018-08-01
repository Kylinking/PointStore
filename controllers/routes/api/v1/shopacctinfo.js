'use strict';
var express = require('express');
var router = express.Router();
const Op = require('sequelize').Op;


router.get('/shoppoints', (req, res) => {
    var shopInfo = res.locals.db.ShopInfo;
    var logger = res.locals.logger;
    var customerInfo = res.locals.db.CustomerInfo;
    
});






// error 
router.use('/shoppoints', (req, res) => {
    res.status(404);
    res.json({
        error: {
            message: "Not Found. \nNo Service with " + req.method
        }
    }).end();
})

router.use((req, res, next) => {
    next();
})
module.exports = router;