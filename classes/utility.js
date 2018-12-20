const moment = require('moment');
const redisClient = require('../models').redisClient;
const httpStatusCode = require('./http_status_code');
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
    static GetResponse(obj) {
        if (obj.isExist) {
            return this.ResponseResource(obj);
        }
        return this.ResponseResourceNotExist();
    }
    static ResponseResource(obj) {
        let content = {
            data: {
                id: obj.id,
                type: obj.typeName,
                attributes: obj.attributes,
            }
        }
        if (obj.relationships) {
            content.data.relationships = obj.relationships;
        }
        if (obj.link) {
            content = Object.assign(content, {
                link: obj.link
            })
        }
        return {
            status: httpStatusCode['OK'],
            content
        };
    }
    static MakeErrorResponse(obj) {
        return {
            status: obj.status || httpStatusCode['Bad Request'],
            content: {
                error: {
                    id: obj.id,
                    detail: obj.detail
                }
            }
        };
    }
    static ResponseResourceNotExist() {
        return this.MakeErrorResponse({
            id: 0,
            detail: '请求资源不存在'
        });
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

    static checkNumber(value) {
        if (/^(\-|\+)?([0-9]+\.)?([0-9]+|Infinity)$/.test(value))
            return Number(value);
        return NaN;
    }
}
module.exports = Utility;