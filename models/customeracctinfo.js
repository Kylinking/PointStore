module.exports = (sequelize, DataTypes) => {
    var CustomerAccountInfo = sequelize.define('CustomerAccountInfo', {
        Id:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement: true
        },
        RemainPoints: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue:0,
        },
        RemainMoney: {
            type: DataTypes.FLOAT,
            defaultValue:0,
            allowNull: false,
        },
        ShopBounusPoints: {
            type: DataTypes.FLOAT,
            defaultValue:0,
            allowNull: false,
        },
        RecommendPoints: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue:0,
        },
        IndirectRecommendPoints: {
            type: DataTypes.FLOAT,
            defaultValue:0,
            allowNull: false,
        },
        ThirdRecommendPoints: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue:0,
        },
        CustomedPoints: {
            type: DataTypes.FLOAT,
            defaultValue:0,
            allowNull: false,
        },
        ChargedMoney:{
            type:DataTypes.FLOAT,
            defaultValue:0,
            allowNull:false,
        },
        CustomedMoney: {
            type: DataTypes.FLOAT,
            defaultValue:0,
            allowNull: false,
        },
    },{
        updatedAt:'UpdatedAt',
        createdAt:'CreatedAt'
    });

    CustomerAccountInfo.associate = function (models) {
        models.CustomerAccountInfo.belongsTo(models.CustomerInfo, {
            onDelete: "CASCADE",
            foreignKey: {
                name: 'CustomerId',
                allowNull: false
            }
        });
    };
    return CustomerAccountInfo;
}