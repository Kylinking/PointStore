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
        ShopBounusPointRate:{
            type:DataTypes.FLOAT,
            allowNull:false,
        },
        Level:{
            type:DataTypes.INTEGER,
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
