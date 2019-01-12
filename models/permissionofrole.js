module.exports = (sequelize, DataTypes)=>{
    var PermissionOfRole = sequelize.define('PermissionOfRole',{},{
      updatedAt: 'UpdatedAt',
      createdAt: 'CreatedAt'
  });
  return PermissionOfRole;
}