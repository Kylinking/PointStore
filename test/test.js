'use strict';

module.exports = (models)=>{
    models.Login.create({
        ID:"123",
        Password:"hello"
    }).then(login=>{
        console.log(login.toJSON());
    })
    models.ShopInfo.create({
        ShopID:"123",
        Name:"春华路",
        Phone:"1234567",
        Address:"市中区",
        Status:1
    }).then(shop=>{
        console.log(shop.toJSON());
    })
}