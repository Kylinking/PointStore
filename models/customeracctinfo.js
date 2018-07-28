module.exports = (sequelize, DataTypes) => {
    var CustomerAccountInfo = sequelize.define('CustomerAccountInfo', {
        RemainPoints: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ShopBounusPoints: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ChargedPoints: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        RecommentBounusPoints: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        IndirectRecommendBounusPoints: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        CustomedPoints: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    });

    CustomerAccountInfo.associate = function (models) {
        models.CustomerAccountInfo.belongsTo(models.CustomerInfo, {
            as: 'CustomerID',
            onDelete: "CASCADE",
            foreignKey: {
                allowNull: false
            }
        });
    };
    return CustomerAccountInfo;
}