const User = require('../../../../classes/user');
const Utility = require('../../../../classes/utility');
let express = require('express');
let router = express.Router();
const logger = require('../../../../log');
router.get('/users/:id', async (req, res, next) => {
    console.log(res.locals.requestInfo);
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