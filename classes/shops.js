let db = require('../models').db;
let shopModel = db.ShopInfo;
let UTIL = require('./utility');

let Shop = class {
    constructor(userId){
        this.userId = userId;
        this.isExist = false;
    }

    async InitAsync(){
        this._shop = await shopModel.findOne({where:{UserId:this.userId}});
        if (this._shop){
            this.isExist = true;
        }
    }

    async GetCustomersAsync()
    {
        let customers = [];
        if (this.isExist){
            customers = await this._shop.getCustomerInfos();
        }
        return customers;
    }

    async GetAccountAsync()
    {
        if(this.isExist){
            return await this._shop.getShopAccountInfo();
        }
    }

    async GetAccountChangesAsync(params){
        let {start,end} = {...UTIL.ComputeTime(params)};
        
    }

}

module.exports = Shop;