'use strict';

module.exports = async (models) => {
    await models.Login.create({
        Id: 123,
        Password: "hello"
    });
    await models.Login.create({
        Id: 124,
        Password: "hello"
    });
    await models.Login.create({
        Id: 12,
        Password: "hello"
    });
    await models.Login.create({
        Id: 11,
        Password: "hello"
    });
    await models.Login.create({
        Id: 1,
        Password: "hello"
    });
    await models.ShopInfo.create({
        ShopId: 1,
        Name: "Superman",
        Phone: "00000000",
        Address: "宇宙中心",
        Status: 1,
        Type:0
    });
    await models.BounusPointRate.create({
        RecommendRate: 0.1,
        IndirectRecommendRate: 0.05,
        ShopBounusPointRate: 0,
        ShopId: 1,
        Level:0,
    });
    await models.ShopInfo.create({
        ShopId: 12,
        Name: "A总店",
        Phone: "012012012",
        Address: "市中区",
        Status: 1,
        Type:1,
        ParentShopId: 1
    });
    await models.ShopAccountInfo.create({
        CustomedPoints:80,
        RecommendPoints:160,
        ChargedPoints:260,
        ShopBounusPoints:100,
        ShopId:12
    });
    await models.BounusPointRate.create({
        RecommendRate: 0.2,
        IndirectRecommendRate: 0.09,
        ShopBounusPointRate: 0.05,
        ShopId: 12,
        Level:1,
    });
    await models.ShopInfo.create({
        ShopId: 11,
        Name: "B总店",
        Phone: "011011011",
        Address: "市中区",
        Status: 1,
        Type:1,
        ParentShopId: 1
    });
    await models.ShopAccountInfo.create({
        CustomedPoints:40,
        RecommendPoints:80,
        ChargedPoints:130,
        ShopBounusPoints:50,
        ShopId:11
    });
    await models.BounusPointRate.create({
        RecommendRate: 0.1,
        IndirectRecommendRate: 0.05,
        ShopBounusPointRate: 0,
        ShopId: 11,
        Level:1
    });
    await models.ShopInfo.create({
        ShopId: 123,
        Name: "春华路分店",
        Phone: "123123123",
        Address: "市中区",
        Status: 1,
        Type:2,
        ParentShopId: 12
    });
    await models.ShopAccountInfo.create({
        CustomedPoints:40,
        RecommendPoints:80,
        ChargedPoints:130,
        ShopBounusPoints:50,
        ShopId:123
    });
    
    await models.BounusPointRate.create({
        RecommendRate: 0,
        IndirectRecommendRate: 0,
        ShopBounusPointRate: 0,
        ShopId: 123,
        Level:0,
    });
    await models.ShopInfo.create({
        ShopId: 112,
        Name: "蟠龙路分店",
        Phone: "112112112",
        Address: "市中区",
        Status: 1,
        Type:2,
        ParentShopId: 11
    });
    await models.BounusPointRate.create({
        RecommendRate: 0.5,
        IndirectRecommendRate: 0.5,
        ShopBounusPointRate: 0.5,
        ShopId: 112,
        Level:1,
    });
    await models.ShopAccountInfo.create({
        CustomedPoints:40,
        RecommendPoints:80,
        ChargedPoints:130,
        ShopBounusPoints:50,
        ShopId:112
    });
    await models.ShopInfo.create({
        ShopId: 124,
        Name: "柏杨路分店",
        Phone: "124124124",
        Address: "市中区",
        Status: 1,
        Type:2,
        ParentShopId: 12
    });
    await models.ShopAccountInfo.create({
        CustomedPoints:40,
        RecommendPoints:80,
        ChargedPoints:130,
        ShopBounusPoints:50,
        ShopId:124
    });
    await models.BounusPointRate.create({
        RecommendRate: 1,
        IndirectRecommendRate: 1,
        ShopBounusPointRate: 1,
        ShopId: 124,
        Level:2,
    });
    await models.CustomerInfo.create({
        Name: "小红",
        Address: "市中区",
        Status: 1,
        Phone: 111111,
        Sex: "女",
        Age: 13,
        ShopId: 123,
    });
    await models.CustomerInfo.create({
        Name: "小张",
        Address: "市中区",
        Status: 1,
        Phone: 144444,
        Sex: "女",
        Age: 13,
        ShopId: 123,
        RecommendCustomerId:1
    });
    await models.CustomerInfo.create({
        Name: "小明",
        Address: "市中区",
        Status: 1,
        Phone: 122222,
        Sex: "女",
        Age: 13,
        ShopId: 124,
    });
    await models.CustomerInfo.create({
        Name: "小强",
        Address: "市中区",
        Status: 1,
        Phone: 1333333,
        Sex: "男",
        Age: 13,
        ShopId: 112,
    });
    await models.CustomerAccountInfo.create({
        RemainPoints:100,
        ShopBounusPoints:20,
        ChargedPoints:60,
        RecommendPoints:30,
        IndirectRecommendPoints:10,
        CustomedPoints:20,
        CustomerId:1
    });
    await models.CustomerAccountInfo.create({
        RemainPoints:120,
        ShopBounusPoints:30,
        ChargedPoints:70,
        RecommendPoints:30,
        IndirectRecommendPoints:10,
        CustomedPoints:20,
        CustomerId:2
    });
    await models.CustomerAccountInfo.create({
        RemainPoints:120,
        ShopBounusPoints:30,
        ChargedPoints:70,
        RecommendPoints:30,
        IndirectRecommendPoints:10,
        CustomedPoints:20,
        CustomerId:3
    });
    await models.CustomerAccountInfo.create({
        RemainPoints:120,
        ShopBounusPoints:30,
        ChargedPoints:70,
        RecommendPoints:30,
        IndirectRecommendPoints:10,
        CustomedPoints:20,
        CustomerId:4
    });
   




}