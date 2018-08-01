'use strict';
var util = require('../../../../util/util');
var express = require('express');
var router = express.Router();
const Op = require('sequelize').Op;

router.get('/userpoints',async (req,res)=>{
    var logger = res.locals.logger;
    var phone = req.query.Phone || '';
    var shopID = req.query.ShopID || '';
    var page = parseInt(req.query.Page || 1);
    var pageSize = parseInt(req.query.Size || 20);
    var offset = (page - 1) * pageSize;
    var acctInfo = res.locals.db.CustomerAccountInfo;

    var instance = await acctInfo.findOne({
        where:{
            Include:[
                {
                    model:res.locals.db.CustomerInfo,
                    where:{
                        Phone:phone
                    }
                },
                {

                }
            ]
        }
    })
    

});