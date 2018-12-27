'use strict';
let express = require('express');
let router = express.Router();
const logger = require('../../../../log');
const Shop = require('../../../../classes/shops');

router.get('/shops/:id', async (req, res, next) => {
    logger.info(`GET shops/:id:${req.params.id}`);
    let shop = await new Shop(req.params.id).InitAsync();
    
})
router.get('/shops', async (req, res, next) => {
    logger.info(`GET shops`);
    logger.info(`${req.params.id}`);

});

router.delete('/shops', async (req, res, next) => {});

router.post('/shops', async (req, res, next) => {});

router.patch('/shops', async (req, res, next) => {});

router.use((req, res, next) => {
    next();
})


module.exports = router;