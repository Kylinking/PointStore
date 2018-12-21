const User = require('../../../../classes/user');
const Utility = require('../../../../classes/utility');
let express = require('express');
let router = express.Router();
const logger = require('../../../../log');
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

router.post('/users', async (req, res, next) => {
    let conditions = res.locals.requestInfo.conditions;
    let customerId = conditions.customerId ? conditions.customerId : null;
    let shopId = conditions.shopId ? conditions.shopId : null;
    let user = new User(conditions.username);
    let response = await user.Add(conditions);
    res.status(response.status).json(response.content).end();
});

module.exports = router;