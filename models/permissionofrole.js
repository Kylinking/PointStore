module.exports = (sequelize, DataTypes) => {
  var PermissionOfRole = sequelize.define('PermissionOfRole', {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
  }, {
    updatedAt: 'UpdatedAt',
    createdAt: 'CreatedAt'
  });
  PermissionOfRole.associate = function (models) {
    models.PermissionOfRole.belongsTo(models.Role, {
      onDelete: "CASCADE",
      foreignKey: {
        name: 'RoleId',
        allowNull: false,
        unique: "permissionofrole"
      }
    });
    models.PermissionOfRole.belongsTo(models.Permission, {
      onDelete: "CASCADE",
      foreignKey: {
        name: 'PermissionId',
        allowNull: false,
        unique: "permissionofrole"
      }
    });
  };

  return PermissionOfRole;
}