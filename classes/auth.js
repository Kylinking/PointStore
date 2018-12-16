const User = require('./user');
const Utility = require('./utility');
const Shop = require('./shops');
const jwt = require('jwt-simple');
const jwtSecret = require('../config/global.json').jwtSecret;
const expireDuration = 60; // 5*60s
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
                    token: this.EncodeToken({
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



    async Authenticate(req, res) {
        const token = this.GetTokenFromHeader(req.headers);
        if (!token) {
            console.log('!token');
            return this.invalidTokenResponse('Unauthorized', 'token 无效');
        }
        let decodedToken;
        try {
            decodedToken = this.DecodeToken(token);
        } catch (jwterror) {
            logger.warn(jwterror);
            return this.invalidTokenResponse('Unauthorized', 'token 无效');
        }
        if (decodedToken && !decodedToken.jwterror) {
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
            const now = Date.parse(new Date()) / 1000;
            if (now - iat > expire) {
                logger.warn(`过期token: now - iat:${now - iat} > expire:${expire}`);
                return this.invalidTokenResponse('Unauthorized', 'token已过期');
            }
            let user = await new User(username).InitAsync();
            let permissions = await user.GetPermissions();

        } else {
            return this.invalidTokenResponse('Unauthorized', 'token无效');
        }
    }

    invalidTokenResponse(status, detail) {
        return {
            success: false,
            status: httpStatusCode[status],
            response: Utility.MakeErrorResponse({
                id: 0,
                detail: detail
            })
        }
    }
    // 无效token 对象 

    GetTokenFromHeader(header) {
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

    Refresh(headers) {
        let token = this.GetTokenFromHeader(headers);
        console.log(token);
        if (token) {
            let refreshToken = this.RefreshToken(token);
            if (refreshToken.jwterror) {
                return this.invalidTokenResponse('Unauthorized', refreshToken.jwterror);
            }
            return {
                success: true,
                status: 200,
                response: {
                    token: refreshToken
                }
            };
        } else {
            return this.invalidTokenResponse('Unauthorized', 'token无效');
        }
    }

    DecodeToken(token) {
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
    EncodeToken(params, expire = expireDuration) {
        // jwt time count as seconds not millseconds
        const date = Date.parse(new Date()) / 1000;
        const payload = Object.assign(params, {
            iat: date,
            exp: expire + date,
            sub: "Authentication"
        });
        return this._EncodePayload(payload);
    }

    RefreshToken(token, expire = expireDuration) {
        let tokenBody = this.DecodeToken(token);
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