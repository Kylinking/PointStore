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
            defaultValue:0,
        },
        RemainMoney: {
            type: DataTypes.INTEGER,
            defaultValue:0,
            allowNull: false,
        },
        ShopBounusPoints: {
            type: DataTypes.INTEGER,
            defaultValue:0,
            allowNull: false,
        },
        RecommendPoints: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue:0,
        },
        IndirectRecommendPoints: {
            type: DataTypes.INTEGER,
            defaultValue:0,
            allowNull: false,
        },
        ThirdRecommendPoints: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue:0,
        },
        CustomedPoints: {
            type: DataTypes.INTEGER,
            defaultValue:0,
            allowNull: false,
        },
        ChargedMoney:{
            type:DataTypes.INTEGER,
            defaultValue:0,
            allowNull:false,
        },
        CustomedMoney: {
            type: DataTypes.INTEGER,
            defaultValue:0,
            allowNull: false,
        },
    },{
        updatedAt:'UpdatedAt',
        createdAt:'CreatedAt'
    });

    CustomerAccountInfo.associate = function (models) {
        models.CustomerAccountInfo.belongsTo(models.CustomerInShop, {
            onDelete: "CASCADE",
            foreignKey: {
                name: 'CustomerInShopId',
                allowNull: false,
                unique:true
            }
        });
    };
    return CustomerAccountInfo;
}