'use strict';
module.exports = (sequelize, DataTypes)=>{
    let BounusPointRate =  sequelize.define('BounusPointRate',{
        Id:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement: true
        },
        RecommendRate:{
            type:DataTypes.FLOAT,
            allowNull:false,
        },
        IndirectRecommendRate:{
            type:DataTypes.FLOAT,
            allowNull:false,
        },
        ThirdRecommendRate:{
            type:DataTypes.FLOAT,
            allowNull:false,
            defaultValue:0.01
        },
        ShopBounusPointRate:{
            type:DataTypes.FLOAT,
            allowNull:false,
        },
        Level:{
            type:DataTypes.INTEGER,
            allowNull: false,
            defaultValue:2
        },
        PointToMoneyRate:{
            type:DataTypes.FLOAT,
            allowNull: false,
            defaultValue:0
        }
    },{
        updatedAt:'UpdatedAt',
        createdAt:'CreatedAt'
    });
    BounusPointRate.associate = function (models) {
        models.BounusPointRate.belongsTo(models.ShopInfo, {
          onDelete: "CASCADE",
          foreignKey: {
            name: 'ShopId',
            allowNull: false
          }
        });
    };
    return BounusPointRate;
};
