let db = require('../models').db;
let roleModel = db.Role;
const Op = require('sequelize').Op;
let Role = class {
    constructor(roleNames = []) {
        this.roleNames = roleNames;
    }
    async GetPermissionsAsync() {
        let  permissions = [];
        let queryWhere = {
            Name: {
                [Op.or]: []
            }
        };
        for (let roleName of this.roleNames) {
            queryWhere.Name[Op.or].push(roleName);
        }
        let roles = await roleModel.findAll({
            where:queryWhere
        });
        for(let role of roles){
            let records = await role.getPermissions();
            for (let permission of records){
                permissions.push(
                    {
                        Action:permission.Action,
                        Path:permission.Path
                    }
                );
            }
        }
        this.permissions = permissions;
        return permissions;
    }
    
}

module.exports = Role;