let db = require('../models').db;
const Op = require('sequelize').Op;
const Model = require('./base');
let Role = class extends Model {
    constructor(roleName) {
        super(db.Role);
        this._roleName = roleName;
    }
    // ======================================
    // property area start



    // property area end
    // ======================================
    async GetPermissionsAsync() {
        let permissions = [];
        let records = await this.role.getPermissions();
        for (let permission of records) {
            permissions.push(permission.toJSON());
        }
        this.permissions = permissions;
        return permissions;
    }

    async InitAsync() {
        if (!this._isExist) {
            let role = (await this._model.findOne({
                where: {
                    Name: this._roleName
                }
            }));
            if (role) {
                this._isExist = true;
                this._id = role.Id;
                this._attributes = {
                    name: role.Name,
                }
                this.role = role;
            } else {
                this._isExist = false;
            }
        }
        return this;
    }
}

module.exports = Role;