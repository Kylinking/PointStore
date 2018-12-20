const db = require('../models').db;
const Model = require('./base');
const Role = require('./role');
const logger = require('../log');
let Users = class extends Model {
    constructor(params) {
        super(db.User);
        this._name = params.name;
        this._id = params.id;
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
            let user = this._id && await this._GetInstanceByIdAsync() ||
                this._name && await this._GetInstanceByNameAsync() ||
                null;
            if (user) {
                this._instance = user;
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