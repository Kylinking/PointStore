module.exports = (sequelize, DataTypes) => {
    var CustomerAccountInfo = sequelize.define('CustomerAccountInfo', {
        Id:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement: true
        },
        RemainPoints: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue:0
        },
        RemainMoney: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ShopBounusPoints: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        // ChargedPoints: {
        //     type: DataTypes.INTEGER,
        //     allowNull: false,
        // },
        RecommendPoints: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        IndirectRecommendPoints: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ThirdRecommendPoints: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        CustomedPoints: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ChargedMoney:{
            type:DataTypes.FLOAT,
            allowNull:false,
        },
        CustomedMoney: {
            type: DataTypes.FLOAT,
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