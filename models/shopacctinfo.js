module.exports = (sequelize, DataTypes) => {
    var ShopAccountInfo = sequelize.define('ShopAccountInfo', {
        Id:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement: true
        },
        CustomedPoints: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        RecommendPoints: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ChargedPoints:{
            type:DataTypes.INTEGER,
            allowNull:false,
        },
        ShopBounusPoints:{
            type:DataTypes.INTEGER,
            allowNull:false,
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

    ShopAccountInfo.associate = function (models) {
        models.ShopAccountInfo.belongsTo(models.ShopInfo, {
          onDelete: "CASCADE",
          foreignKey: {
            name:"ShopId",
            allowNull: false
          }
        });
      };
   return ShopAccountInfo;
}