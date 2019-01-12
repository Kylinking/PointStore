const db = require('../models').db;
const Model = require('./base');
const Role = require('./role');
const logger = require('../log');
let Users = class extends Model {
    constructor(name) {
        super(db.User);
        this._name = name;
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
    async GetPermissions() {
        if (!this._permissions) {
            this._permissions = [];
            logger.warn(await this.GetRolesAsync());
            for (let role of await this.GetRolesAsync()) {
                if (role.isExist) {
                    this._permissions.concat(await role.GetPermissionsAsync())
                }
            }
        }
        logger.info(this._permissions);
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
            let user = await this._model.findOne({
                where: {
                    Name: this._name
                }
            });
            console.log(user);
            if (user) {
                this._user = user;
                this._isExist = true;
                this._id = user.Id;
                this._attributes = {
                    name: user.Name,
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

    async Refresh() {
        return await this.InitAsync();
    }
}

module.exports = Users;