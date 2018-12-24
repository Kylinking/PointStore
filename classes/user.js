/*jslint es6 */
const db = require('../models').db;
const Model = require('./base');
const Role = require('./role');
const logger = require('../log');
const Utility = require('./utility');
const httpStatusCode = require('./http_status_code');
const isSequelizeError = require('./Sequelize/error');
let Users = class extends Model {
    constructor(params) {
        super(db.User);
        // () have to be here for the stupid ES syntax 
        ({
            name: this._name,
            id: this._id
        } = params);
        logger.info(`test${this._name}`);
        logger.info(`${params}`);
    }
    // ======================================
    // property area start
    get name() {
        return this._name;
    }
    get roleNames() {
        return JSON.parse(this._roleNames);
    }
    get shopId() {
        return this._shopId;
    }

    get password() {
        return this._password
    }

    // property area end
    // ======================================
    async GetPermissionsAsync() {
        if (!this._permissions) {
            this._permissions = [];
            let roles = await this.GetRolesAsync();
            for (let role of roles) {
                if (role.isExist) {
                    let perms = await role.GetPermissionsAsync();
                    this._permissions = this._permissions.concat(perms);
                }
            }
        }
        return this._permissions;
    }
    async GetRolesAsync() {
        if (!this._roles) {
            this._roles = [];
            for (let roleName of this.roleNames) {
                let role = await new Role(roleName).InitAsync();
                if (role.resourceIdentify) {
                    this._roles.push(role);
                }
            }
        }
        return this._roles;
    }
    async InitAsync() {
        try {
            let user = this._instance ||
                this._id && await this._GetInstanceByIdAsync() ||
                this._name && await this._GetInstanceByNameAsync() ||
                null;
            if (user) {
                this._instance = user;
                this._isExist = true;
                this._id = user.Id;
                this._attributes = {
                    name: user.Name,
                    role: JSON.parse(user.Role),
                    created: user.CreatedAt,
                    updated: user.UpdatedAt,
                }
                this._roleNames = user.Role;
                this._password = user.Password;
                this._shopId = user.ShopId;
            } else {
                this._isExist = false;
            }
            return this;
        } catch (error) {
            throw error;
        }
    }

    async Update(conditions) {
        try {
            const {
                username,
                roles,
                password,
            } = { ...conditions
            };
            let instance = await this._model.findOne({
                where: {
                    Id: this._id
                }
            });
            if (instance) {
                console.log(roles);
                //username && instance.set('Name', username);
                roles !== undefined && instance.set('Role', roles);
                password !== undefined && instance.set('Password', password);
                await instance.save();
                this._instance = instance;
                return Utility.ResponseResource(await this.InitAsync());
            } else {
                return Utility.MakeErrorResponse({
                    id: 0,
                    detail: '用户不存在'
                })
            }
        } catch (error) {
            logger.error(error);
            let resonseError = '服务器内部错误，请联系技术支持！';
            logger.error(`name:password:shopId:customerId => ${this._name}:${password}:${shopId}:${customerId}`);
            if (isSequelizeError(error)) {
                resonseError = '数据错误。请联系技术支持！'
            }
            return Utility.MakeErrorResponse({
                id: 0,
                status: httpStatusCode['Internal Server Error'],
                detail: resonseError
            });
        }
    }

    async Add(conditions) {
        const {
            roles,
            password,
            shopId,
            customerId
        } = { ...conditions
        };
        if (!password)
            try {
                let instance = await this._model.findOne({
                    where: {
                        Name: this._name
                    }
                });
                if (instance) {
                    return Utility.MakeErrorResponse({
                        status: httpStatusCode['Conflict'],
                        id: instance.Id,
                        detail: '用户名重复'
                    });
                } else {
                    instance = await this._model.create({
                        Name: this._name,
                        Role: roles,
                        Password: password,
                        ShopId: shopId,
                        CustomerId: customerId
                    });
                    if (instance) {
                        this._instance = instance;
                        return Utility.ResponseResource(await this.InitAsync());
                    }
                }
            } catch (error) {
                logger.error(error);
                let resonseError = '服务器内部错误，请联系技术支持！';
                logger.error(`name:password:shopId:customerId => ${this._name}:${password}:${shopId}:${customerId}`);
                if (isSequelizeError(error)) {
                    resonseError = '数据错误。请联系技术支持！'
                }
                return Utility.MakeErrorResponse({
                    id: 0,
                    status: httpStatusCode['Internal Server Error'],
                    detail: resonseError
                });
            }
    }

    async _GetInstanceByNameAsync() {
        return await this._model.findOne({
            where: {
                Name: this._name
            }
        });
    }

    async _GetInstanceByIdAsync() {
        return await this._model.findById(this._id);
    }

}

module.exports = Users;