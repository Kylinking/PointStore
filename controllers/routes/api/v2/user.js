/*jslint es6 */
const User = require('../../../../classes/user');
const Utility = require('../../../../classes/utility');
let express = require('express');
let router = express.Router();
const logger = require('../../../../log');
router.post('/users', async (req, res, next) => {
    let conditions = res.locals.requestInfo.conditions;
    let user = new User({
        name: conditions.username
    });
    let response = await user.Add(conditions);
    res.status(response.status).json(response.content).end();
});

router.put('/users/:id', async (req, res, next) => {
    let conditions = res.locals.requestInfo.conditions;
    logger.info(conditions);
    let user = new User({
        id: req.params.id
    });
    let response = await user.Update(conditions);
    res.status(response.status).json(response.content).end();
});

router.get('/users/:id', async (req, res, next) => {
    if (!isNaN(Utility.checkNumber(req.params.id))) {
        let user = await new User({
            id: req.params.id
        }).InitAsync();
        const response = Utility.GetResponse(user);
        logger.info(response);
        res.status(response.status).json(response.content).end();
    } else {
        next();
    }
});
module.exports = router;