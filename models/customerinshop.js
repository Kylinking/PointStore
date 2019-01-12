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

    return CustomerInShop;
};