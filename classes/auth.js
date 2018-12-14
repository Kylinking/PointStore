let User = require('./user');
let Utility = require('./utility');
let Shop = require('./shops');
let Auth = class {
    constructor(username, password) {
        this._name = username;
        this.password = password;
    }

    get password() {
        return this._password;
    }

    set password(value) {
        this._password = value;
    }

    async Login() {
        let user = await new User(this._name).InitAsync();
        if (user.CheckPassword(this.password)) {
            let relationships = [{
                "user": user.resourceIdentify
            }, ];
            let shop = await (new Shop(user.shopId)).InitAsync();
            relationships.push({
                "shop": shop.resourceIdentify
            });
            let roles = await user.GetRoles();
            for (let i of roles) {
                relationships.push({
                    "role": i
                });
            }
            return Utility.MakeResponse({
                id: 0,
                type: 'auth',
                attributes: {
                    token: Utility.EncodeToken({
                        user: user.id,
                        role: user.roleNames,
                        shop: user.shopId
                    })
                },
                relationships: relationships
            })
        }
    }

    Authenticate(resJson) {

    }

    Refresh(token) {

        const redisClient = require('../models').redisClient;
        const redisGetAsync = Utility.MakeAsyncRedisMethod(redisClient.get, redisClient);
    }

}