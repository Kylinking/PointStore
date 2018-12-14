const db = require('../models').db;
const Model = require('./base');
const Role = require('./role');
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
            this._roles = new Role(this.roleNames);
            this._permissions = await this.role.GetPermissionsget();
        }
        return this._permissions;
    }
    async GetRoles() {
        this._roles = [];
        for (let roleName of this.roleNames) {
            let role = new Role(roleName);
            await role.InitAsync();
            this._roles.push(role.resourceIdentify);
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