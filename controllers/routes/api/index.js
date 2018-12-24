'use strict';

const express = require('express');
let router = express.Router();
const path = require('path');
const fs = require('fs');
const basename = path.basename(__filename);
let apis = [];
const version = 'v2';
const Auth = require('../../../classes/auth');
const TokenRouter = require('./v2/token');
const parseRequest = require('../../../middleware/parseRequest');
// Auto push routes into array apis, .js files in the vX folder will be treated as routes;  
fs
    .readdirSync(path.join(__dirname, version))
    .filter(file => {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.endsWith('.js') && (file != 'token.js'));
    })
    .forEach(file => {
        file = file.substring(0, file.lastIndexOf('.'));
        apis.push(require(path.join(__dirname, version, file)));
    });
// get token or refresh token
router.use(`/${version}`, TokenRouter);

// check permissions 
router.use(
    `/${version}`,
    async (req, res, next) => {
            let auth = new Auth();
            let result = await auth.Authenticate(req, res);
            //next()
            result.success ? next() : next(result);
        },
        parseRequest,
        apis
);

router.use((err, req, res, next) => {
    res.locals.logger.error(err);
    res.status(err.status).json(err.content).end();
})

module.exports = router;