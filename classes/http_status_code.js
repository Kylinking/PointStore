// HTTP 状态码 
// https://zh.wikipedia.org/wiki/HTTP%E7%8A%B6%E6%80%81%E7%A0%81
const status = {
    'OK': 200,
    'Created': 201,
    'Accepted': 202,
    'No Content': 204,

    'See Other': 303,
    'Not Modified': 304,

    'Bad Request': 400,
    'Unauthorized': 401,
    'Forbidden': 403,
    'Not Found': 404,
    'Method Not Allowed': 405,
    'Not Acceptable': 406,
    'Request Timeout': 408,
    'Conflict': 409,
    'Request Entity Too Large': 413,
    'Requested Range Not Satisfiable': 416,
    'Too Many Requests': 429,

    'Not Implemented': 501,
    'Internal Server Error': 500,
    'Service Unavailable': 503,
}
module.exports = status;