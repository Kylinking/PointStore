const moment = require('moment');
const redisClient = require('../models').redisClient;
let Utility = class {
    static ComputeDate(timePoints) {
        let {
            start,
            end
        } = {
            ...timePoints
        };
        start = start || null;
        end = end || null;
        end = Date.parse(moment(end).format("MM DD YYYY"));
        start = Date.parse(moment(start).format("MM DD YYYY"));
        if (isNaN(end) && isNaN(start)) {
            end = Date.parse(moment().format());
            start = Date.parse(moment().subtract(30, 'days').format("MM DD YYYY"));
        } else if (isNaN(end) && !isNaN(start)) {
            end = Date.parse(moment(start).add(30, 'days').format("MM DD YYYY"));
        } else if (!isNaN(end) && isNaN(start)) {
            start = Date.parse(moment(end).subtract(30, 'days').format("MM DD YYYY"));
        } else {
            if (end < start) {
                [end, start] = [start, end];
            }
        }
        return {
            start,
            end
        };
    }

    static MakeResponse(obj) {
        let response = {
            data: {
                id: obj.id,
                type: obj.type,
                attributes: obj.attributes,
                relationships: obj.relationships
            }
        }
        if (obj.link) {
            response = Object.assign(response, {
                link: obj.link
            })
        }
        return response;
    }
    static MakeErrorResponse(obj) {
        return {
            error: {
                id: obj.id,
                detail: obj.detail
            }
        };
    }

    static MakeAsyncRedisMethod(fn, redisClient) {
        const promisify = require('util').promisify;
        return promisify(fn).bind(redisClient);
    }

    static redis() {
        if (!redisClient.redisGetAsync) {
            const redisGetAsync = MakeAsyncRedisMethod(redisClient.get, redisClient);
            redisClient = Object.assign(redisClient, {
                redisGetAsync
            });
        }
        if (!redisClient.redisSetAsync) {
            const redisSetAsync = MakeAsyncRedisMethod(redisClient.set, redisClient);
            redisClient = Object.assign(redisClient, {
                redisSetAsync
            });
        }
        return redisClient;
    }
}
module.exports = Utility;