'use strict';
module.exports = (sequelize, DataTypes)=>{
    let BounusPointRate =  sequelize.define('BounusPointRate',{
        RecommendRate:{
            type:DataTypes.FLOAT,
            allowNull:true,
        },
        IndirectRecommendRate:{
            type:DataTypes.FLOAT,
            allowNull:true,
        },
        ShopBounusPointRate:{
            type:DataTypes.FLOAT,
            allowNull:true,
        },
        Level:{
            type:DataTypes.FLOAT,
            allowNull:true,
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
