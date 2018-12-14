let db = require('../models').db;

class Base {
    constructor(model) {
        this._model = model;
        this._hasOne = [];
        this._hasMany = [];
        this._belongsTo = [];
        this._belongsToMany = [];
        this._attributes = {};
    }

    get id() {
        return this._id;
    }

    get typeName() {
        if (this._model) {
            return this._model.name;
        }
    }

    get attributes() {
        return this._attributes;
    }

    get resourceobj() {
        return {
            data: {
                id: this.id,
                type: this.typeName,
                attributes: this._attributes
            }
        }
    }

    get resourceIdentify() {
        return {
            id: this.id,
            type: this.typeName
        }
    }

    hasOne(derived) {
        this._hasOne.push(derived);
    }

    hasMany(derived) {
        this._hasMany.push(derived)
    }

    belongsTo(derived) {
        this._belongsTo.push(derived)
    }

    belongsToMany(derived) {
        this._belongsToMany.push(derived)
    }

    toJSON() {

    }
}

module.exports = Base;