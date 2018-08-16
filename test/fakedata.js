'use strict';

module.exports = async (models) => {
    await models.Login.create({
        ID: 123,
        Password: "hello"
    });
    await models.Login.create({
        ID: 124,
        Password: "hello"
    });
    await models.Login.create({
        ID: 12,
        Password: "hello"
    });
    await models.Login.create({
        ID: 11,
        Password: "hello"
    });
    await models.Login.create({
        ID: 1,
        Password: "hello"
    });
    await models.ShopInfo.create({
        ShopID: 1,
        Name: "Superman",
        Phone: "00000000",
        Address: "宇宙中心",
        Status: 1,
        Type:0
    });
    await models.ShopInfo.create({
        ShopID: 12,
        Name: "A总店",
        Phone: "012012012",
        Address: "市中区",
        Status: 1,
        Type:1,
        ParentShopID: 1
    });
    await models.ShopInfo.create({
        ShopID: 11,
        Name: "B总店",
        Phone: "011011011",
        Address: "市中区",
        Status: 1,
        Type:1,
        ParentShopID: 1
    });
    await models.ShopInfo.create({
        ShopID: 123,
        Name: "春华路分店",
        Phone: "123123123",
        Address: "市中区",
        Status: 1,
        Type:2,
        ParentShopID: 12
    });
    await models.ShopInfo.create({
        ShopID: 112,
        Name: "蟠龙路分店",
        Phone: "112112112",
        Address: "市中区",
        Status: 1,
        Type:2,
        ParentShopID: 11
    });
    await models.ShopInfo.create({
        ShopID: 124,
        Name: "柏杨路分店",
        Phone: "124124124",
        Address: "市中区",
        Status: 1,
        Type:2,
        ParentShopID: 12
    });
    await models.CustomerInfo.create({
        Name: "小红",
        Address: "市中区",
        Status: 1,
        Phone: 111111,
        Sex: "女",
        Age: 13,
        ShopID: 123,
    });
    await models.CustomerInfo.create({
        Name: "小张",
        Address: "市中区",
        Status: 1,
        Phone: 144444,
        Sex: "女",
        Age: 13,
        ShopID: 123,
        RecommendCustomerID:1
    });
    await models.CustomerInfo.create({
        Name: "小明",
        Address: "市中区",
        Status: 1,
        Phone: 122222,
        Sex: "女",
        Age: 13,
        ShopID: 124,
    });
    await models.CustomerInfo.create({
        Name: "小强",
        Address: "市中区",
        Status: 1,
        Phone: 1333333,
        Sex: "男",
        Age: 13,
        ShopID: 112,
    });
    await models.CustomerAccountInfo.create({
        RemainPoints:100,
        ShopBounusPoints:20,
        ChargedPoints:60,
        RecommendPoints:30,
        IndirectRecommendPoints:10,
        CustomedPoints:20,
        CustomerID:1
    });
    await models.CustomerAccountInfo.create({
        RemainPoints:120,
        ShopBounusPoints:30,
        ChargedPoints:70,
        RecommendPoints:30,
        IndirectRecommendPoints:10,
        CustomedPoints:20,
        CustomerID:2
    });
    await models.CustomerAccountInfo.create({
        RemainPoints:120,
        ShopBounusPoints:30,
        ChargedPoints:70,
        RecommendPoints:30,
        IndirectRecommendPoints:10,
        CustomedPoints:20,
        CustomerID:3
    });
    await models.CustomerAccountInfo.create({
        RemainPoints:120,
        ShopBounusPoints:30,
        ChargedPoints:70,
        RecommendPoints:30,
        IndirectRecommendPoints:10,
        CustomedPoints:20,
        CustomerID:4
    });
    await models.ShopAccountInfo.create({
        CustomedPoints:40,
        RecommendPoints:80,
        ChargedPoints:130,
        ShopBounusPoints:50,
        ShopID:123
    })




}