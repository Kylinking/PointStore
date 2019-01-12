let db = require('../models').db;
const Op = require('sequelize').Op;
const Model = require('./base');
let Role = class extends Model{
    constructor(roleName) {
        super(db.Role);
        this._roleName = roleName;
    }
    // ======================================
    // property area start
    get shop(){
        return this._shop;
    }






    // property area end
    // ======================================
    async GetPermissionsAsync() {
        let records = await this.role.getPermissions();
        for (let permission of records) {
            permissions.push({
                Action: permission.Action,
                Path: permission.Path
            });
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
            this._isExist = true;
            this._id = role.Id;
            this._attributes = {
                name:role.Name,
                
            }
        }
        return this;
    }
}

module.exports = Role;