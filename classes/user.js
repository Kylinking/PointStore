let db = require('../models').db;
let userModel = db.User;
let Role = require('./role');
let Users = class {
    constructor(name) 
    {
        this.name = name;
    }

    CheckPassword(password)
    {
        if (this.password == password)
            return true;
        return false;
    }

    GetRoleNames()
    {
        if (this.isExist){
            return this.roleNames;
        }
    }
    async GetPermissions()
    {
        if (!this.isExist) return;
        if (!this._permissions){
            this._permissions =  await this.role.GetPermissionsAsync();
        }
        return this._permissions;
    }

    toJSON()
    {
        if(this.isExist){
            return {
                Id:this.id,
                Name:this.name,
                Roles:this.GetRoleNames(),
                Password:this.password,
                CreatedAt:this.created,
                UpdatedAt:this.updated,
                Permission:this.GetPermissions(),
            };
        }
        return {};
    }
    async InitAsync()
    {
        try {
            let user = await userModel.findOne({
                where: {
                    Name: this.name
                }
            });
            if (user){
                this._user = user;
                this.isExist = true;
                this.id = user.Id;
                this.name = user.Name;
                this.roleNames = user.Role;
                this.password = user.Password;
                this.created= user.CreatedAt;
                this.updated = user.UpdatedAt;
                this.role = new Role(this.roleName);
            }else{
                this.isExist = false;
            }  
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}

module.exports = Users;