module.exports = (sequelize, DataTypes)=>{
    var CustomerInShop = sequelize.define('CustomerInShop',{
        Id:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement: true,
        },
    },{
        updatedAt:'UpdatedAt',
        createdAt:'CreatedAt'
    });
    CustomerInShop.associate = function (models) {
    models.CustomerInShop.hasOne(models.CustomerAccountInfo,{
        onDelete: "CASCADE",
        foreignKey: {
            name: 'CustomerInShopId',
            allowNull: false
        }
    });
    models.CustomerInShop.hasMany(models.CustomerAccountChange, {
        onDelete: "CASCADE",
        foreignKey: {
            name: 'CustomerInShopId',
            allowNull: false,
        }
      });
      models.CustomerInShop.hasOne(models.TransactionDetail, {
        onDelete: "CASCADE",
        foreignKey: {
          name: 'CustomerInShopId',
          allowNull: false
        }
      });
  
      models.CustomerInShop.hasOne(models.TransactionDetail, {
        onDelete: "CASCADE",
        as: 'RecommendCustomer',
        foreignKey: {
          name: 'RecommendCustomerInShopId',
          allowNull: true
        }
      });
      models.CustomerInShop.hasOne(models.TransactionDetail, {
        onDelete: "CASCADE",
        as: 'IndirectRecommendCustomer',
        foreignKey: {
          name: 'IndirectRecommendCustomerInShopId',
          allowNull: true
        }
      });
      models.CustomerInShop.hasOne(models.TransactionDetail, {
        onDelete: "CASCADE",
        as: 'ThirdRecommendCustomer',
        foreignKey: {
          name: 'ThirdRecommendCustomerInShopId',
          allowNull: true
        }
      });


    }
    return CustomerInShop;
};