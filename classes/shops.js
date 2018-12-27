let db = require('../models').db;
let shopModel = db.ShopInfo;
let Utility = require('./utility');
let Model = require('./base');

let Shop = class extends Model {
    constructor(shopId) {
        super(shopModel);
        this._id = shopId;
    }

//============= 属性 ==========










    async InitAsync() {
        let shop = await shopModel.findById(this._id);
        if (shop) {
            this._isExist = true;
            this._name = shop.Name;
            this._created = shop.CreatedAt;
            this._updated = shop.UpdatedAt;
            this._phone = shop.Phone;
            this._address = shop.Address;
            this._type = shop.Type;
            this._status = shop.Status;
            this._contact = shop.Contact;
        } else {
            this._isExist = false;
        }
        return this;
    }

    async GetCustomersAsync() {
        let customers = [];
        if (this._isExist) {
            customers = await this._shop.getCustomerInfos();
        }
        return customers;
    }

    async GetAccountAsync() {
        if (this._isExist) {
            return await this._shop.getShopAccountInfo();
        }
    }

    async GetAccountChangesAsync(params) {
        let {
            start,
            end
        } = {
            ...Utility.ComputeDate(params)
        };

    }

}

module.exports = Shop;