module.exports = function (req, res, next) {
    let obj = {
        path: req.path,
        query: req.query,
        body: req.body,
        pathInfo: parseUrl(req.path),
        conditions: parseConditions(req.query, req.body)
    };
    res.locals.requestInfo = obj;
    console.log(obj);
    next();
}

function parseUrl(path) {
    const controllers = path.split('/').splice(1);
    let requestResource = [];
    for (let i = 0; i < controllers.length;) {
        let controllerObj = {};
        if (/^\d+$/.test(controllers[i + 1])) {
            controllerObj.id = controllers[i + 1];
            controllerObj.controller = controllers[i];
            i += 2;
        } else {
            controllerObj.id = 'all';
            controllerObj.controller = controllers[i];
            i += 1;
        }
        // console.log(controllerObj)
        controllerObj.sub = null;
        requestResource.push(controllerObj);
    }
    let pathInfo = requestResource[0];
    for (let i = 0; i < requestResource.length - 1; i++) {
        if (requestResource[i + 1]) {
            requestResource[i].sub = requestResource[i + 1];
        }
    }
    return pathInfo;
}

function parseConditions(query, body) {
    // filter, order
    let conditions = Object.assign(query, body);
    return conditions;
}