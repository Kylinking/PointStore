module.exports = (sequelize, DataTypes) => {
    var CustomerAccountChange = sequelize.define('CustomerAccountChange', {
        PointsAmount: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        Type: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        Date:{
            type:DataTypes.INTEGER,
            allowNull:false,
        }
    });

    CustomerAccountChange.associate = function (models) {
        models.CustomerAccountChange.belongsTo(models.CustomerInfo, {
            as:'CustomerID',
          onDelete: "CASCADE",
          foreignKey: {
            allowNull: false
          }
        });
      };
      CustomerAccountChange.associate = function (models) {
        models.CustomerAccountChange.belongsTo(models.ShopInfo, {
          onDelete: "CASCADE",
          foreignKey: {
            name: 'ShopID',
            allowNull: false
          }
        });
      };
      CustomerAccountChange.associate = function (models) {
        models.CustomerAccountChange.belongsTo(models.CustomerInfo, {
          onDelete: "CASCADE",
          foreignKey: {
            name: 'CustomerID',
            allowNull: false
          }
        });
      };
   return CustomerAccountChange;
}