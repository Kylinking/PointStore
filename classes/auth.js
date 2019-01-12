const User = require('./user');
const Utility = require('./utility');
const Shop = require('./shops');
const jwt = require('jwt-simple');
const jwtSecret = require('../config/global.json').jwtSecret;
const expireDuration = 5 * 60; // 5*60s
const logger = require('../log');
const httpStatusCode = require('./htt_status_code');
const Auth = class {
    constructor(username, password) {
        this._name = username;
        this._password = password;
    }

    get password() {
        return this._password;
    }

    set password(value) {
        this._password = value;
    }

    async Login() {
        const user = await new User(this._name).InitAsync();
        if (user && user.password == this._password) {
            let shop = await (new Shop(user.shopId)).InitAsync();
            return {
                success: true,
                status: 200,
                response: {
                    token: this._EncodeToken({
                        userid: user.id,
                        username: user.name,
                        role: user.roleNames,
                        shop: user.shopId
                    })
                }
            }
        } else {
            return {
                success: false,
                status: httpStatusCode['Unauthorized'],
                response: Utility.MakeErrorResponse({
                    id: 0,
                    detail: "用户名或密码错误。",
                })
            };
        }
    }

    Refresh(body) {
        let token = body.token;
        if (token) {
            let refreshToken = this._RefreshToken(token);
            if (refreshToken.jwterror) {
                return this._InvalidTokenResponse('Unauthorized', refreshToken.jwterror);
            }
            return {
                success: true,
                status: 200,
                response: {
                    token: refreshToken
                }
            };
        } else {
            return this._InvalidTokenResponse('Unauthorized', 'token无效');
        }
    }

    async Authenticate(req, res) {
        const token = this._GetTokenFromHeader(req.headers);
        if (!token) {
            return this._InvalidTokenResponse('Unauthorized', 'token 无效');
        }
        let decodedToken = this._DecodeToken(token);
        if (!decodedToken.jwterror) {
            let {
                iat,
                exp,
                userid,
                username,
                roles,
                shop,
                customer
            } = {
                ...decodedToken
            };
            logger.info(`iat:${iat},exp:${exp},userid:${userid},roles:${roles},
                         username:${username},shop:${shop},customer:${customer}`)
            let user = await new User(username).InitAsync();
            let permissions = await user.GetPermissions();

        } else {
            logger.warn(decodedToken);
            return this._InvalidTokenResponse('Unauthorized', decodedToken.jwterror);
        }
    }

    _InvalidTokenResponse(status, detail) {
        return {
            success: false,
            status: httpStatusCode[status],
            response: Utility.MakeErrorResponse({
                id: 0,
                detail: detail
            })
        }
    }

    _GetTokenFromHeader(header) {
        if (!header || !header.authorization) {
            return undefined;
        }
        let array = header.authorization.split(' ');
        console.log(array)
        if (array.length != 2) {
            return undefined;
        }
        return array[1];
    }

    _DecodeToken(token) {
        try {
            return jwt.decode(token, jwtSecret);
        } catch (error) {
            //console.log(error.message);
            if (error.message == 'Token expired') {
                return {
                    jwterror: 'token过期'
                };
            }
            return {
                jwterror: 'token无效'
            };
        }
    }

    _EncodePayload(payload) {
        return jwt.encode(payload, jwtSecret);
    }

    // 小程序端token无失效时间，店铺端失效时间为5分钟
    _EncodeToken(params, expire = expireDuration) {
        // jwt time count as seconds not millseconds
        const date = Date.parse(new Date()) / 1000;
        const payload = Object.assign(params, {
            iat: date,
            exp: expire + date,
            sub: "Authentication"
        });
        return this._EncodePayload(payload);
    }

    _RefreshToken(token, expire = expireDuration) {
        let tokenBody = this._DecodeToken(token);
        if (tokenBody.jwterror) {
            return tokenBody;
        }
        const date = Date.parse(new Date()) / 1000;
        const payload = Object.assign(tokenBody, {
            iat: date,
            exp: date + expire,
        })
        return this._EncodePayload(payload);
    }
}

module.exports = Auth;