module.exports = (sequelize, DataTypes)=>{
    var Role = sequelize.define('Role',{
        Id:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement: true
        },
        Name:{
            type: DataTypes.STRING,
            unique:true,
            allowNull: false,
        },
    },{
        updatedAt: 'UpdatedAt',
        createdAt: 'CreatedAt'
    }
    );
   Role.associate = function (models) {
    models.Role.belongsToMany(models.Permission, {
       through:'PermissionOfRole'
    });
  };
  return Role;
}