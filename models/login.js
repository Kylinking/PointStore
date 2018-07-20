var sequelize = require("./index").sequelize;
const Sequelize = require('sequelize');
var Login = sequelize.define('Login',{
        ShopID:{
            type:Sequelize.INTEGER,
            primaryKey:true,
            allowNull: false,            
        },
        Password:{
            type:Sequelize.TEXT,
            primaryKey:false,
            allowNull: false,
        }
    }
)

module.exports = Login;

