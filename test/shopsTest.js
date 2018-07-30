require('./loginTest');
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
const token = require('../config/test.json').token;
const tokenAdmin = require('../config/test.json').tokenAdmin;
const tokenSuperman = require('../config/test.json').tokenSuperman;
const tokenOtherAdmin = require('../config/test.json').tokenOtherAdmin;
chai.use(chaiHttp);

describe('Get shopInfos',()=>{
    it('it should return array', done=>{
        chai.request(server)
            .get('/api/v1/shops')
            .set("TOKEN",token)
            .end((err,res)=>{
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('data');
                res.body.data.should.be.a('array');
                res.body.data.should.have.length(1);
                done(); 
            })
    })
});

describe('总店取分店信息',()=>{
    it('it should return array', done=>{
        chai.request(server)
            .get('/api/v1/shops')
            .set("TOKEN",tokenAdmin)
            .end((err,res)=>{
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('data');
                res.body.data.should.be.a('array');
                res.body.should.have.property('Pages');
                res.body.should.have.property('Size');
                res.body.Pages.should.be.gt(0);
                res.body.Size.should.be.gt(0);
                res.body.data.should.have.length(2);
                done(); 
            })
    })
});

describe('Super Get shopInfos',()=>{
    it('it should return array', done=>{
        chai.request(server)
            .get('/api/v1/shops')
            .query({Type:1})
            .set("TOKEN",tokenSuperman)
            .end((err,res)=>{
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('data');
                res.body.data.should.be.a('array');
                res.body.should.have.property('Pages');
                res.body.should.have.property('Size');
                res.body.Pages.should.be.gt(0);
                res.body.Size.should.be.gt(0);
                res.body.data.should.have.length(2);
                done(); 
            })
    })
});

describe('Super Get some shopInfos',()=>{
    it('it should return array', done=>{
        chai.request(server)
            .get('/api/v1/shops')
            .query({Type:1,ShopID:12})
            .set("TOKEN",tokenSuperman)
            .end((err,res)=>{
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('data');
                res.body.data.should.be.a('array');
                res.body.should.have.property('Pages');
                res.body.should.have.property('Size');
                res.body.Pages.should.be.gt(0);
                res.body.Size.should.be.gt(0);
                res.body.data.should.have.length(2);
                done(); 
            })
    })
});

describe('分店建分店', () => {
    it('it should return error', (done) => {
        let data = {
            Name: "test分店",
            Address: "市中区",
            Status: 1,
            Phone: 143431
        };
        chai.request(server)
            .post('/api/v1/shops')
            .set("TOKEN",token)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('error');
                done();
            });
    });
});

describe('总店建分店', () => {
    it('it should create a shopInfo and return info', (done) => {
        let data = {
            Name: "总店建分店",
            Address: "市中区",
            Status: 1,
            Phone: '125125125'
        };
        chai.request(server)
            .post('/api/v1/shops')
            .set("TOKEN",tokenAdmin)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('data');
                res.body.data.should.have.property('ShopID');
                res.body.data.should.have.property('Name');
                res.body.data.should.have.property('Address');
                res.body.data.should.have.property('Status');
                res.body.data.should.have.property('Phone');
                res.body.data.should.have.property('ParentShopID');
                done();
            });
    });
});

describe('Superman建总店', () => {
    it('it should create a shopInfo and return info', (done) => {
        let data = {
            Name: "新总店",
            Address: "市中区",
            Status: 1,
            Phone: '013013013',
        };
        chai.request(server)
            .post('/api/v1/shops')
            .set("TOKEN",tokenSuperman)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('data');
                res.body.data.should.have.property('ShopID');
                res.body.data.should.have.property('Name');
                res.body.data.should.have.property('Address');
                res.body.data.should.have.property('Status');
                res.body.data.should.have.property('Phone');
                res.body.data.should.have.property('ParentShopID');
                done();
            });
    });
});

describe('Superman建分店', () => {
    it('it should create a shopInfo and return info', (done) => {
        let data = {
            Name: "Superman建分店",
            Address: "市中区",
            Status: 1,
            Phone: '113113113',
            ParentShopID:11,
        };
        chai.request(server)
            .post('/api/v1/shops')
            .set("TOKEN",tokenSuperman)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('data');
                res.body.data.should.have.property('ShopID');
                res.body.data.should.have.property('Name');
                res.body.data.should.have.property('Address');
                res.body.data.should.have.property('Status');
                res.body.data.should.have.property('Phone');
                res.body.data.should.have.property('ParentShopID');
                done();
            });
    });
});

describe('分店关分店', () => {
    it('it should return error', (done) => {
        let data = {
            ShopID:124
        };
        chai.request(server)
            .delete('/api/v1/shops')
            .set("TOKEN",token)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('error');
                done();
            });
    });
});

describe('别的总店关分店', () => {
    it('it should return error', (done) => {
        let data = {
            ShopID:124
        };
        chai.request(server)
            .delete('/api/v1/shops')
            .set("TOKEN",tokenOtherAdmin)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('error');
                done();
            });
    });
});
describe('总店关分店', () => {
    it('it should return error', (done) => {
        let data = {
            ShopID:124
        };
        chai.request(server)
            .delete('/api/v1/shops')
            .set("TOKEN",tokenAdmin)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('data');
                res.body.data.should.have.property('ShopID');
                res.body.data.should.have.property('Name');
                res.body.data.should.have.property('Address');
                res.body.data.should.have.property('Status');
                res.body.data.should.have.property('Phone');
                done();
            });
    });
});

describe('总店重复关分店', () => {
    it('it should return error', (done) => {
        let data = {
            ShopID:124
        };
        chai.request(server)
            .delete('/api/v1/shops')
            .set("TOKEN",tokenAdmin)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('error');
                res.body.error.should.have.property('message');
                done();
            });
    });
});

describe('Superman关分店', () => {
    it('it should return info', (done) => {
        let data = {
            ShopID:123
        };
        chai.request(server)
            .delete('/api/v1/shops')
            .set("TOKEN",tokenSuperman)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('data');
                res.body.data.should.have.property('ShopID');
                res.body.data.should.have.property('Name');
                res.body.data.should.have.property('Address');
                res.body.data.should.have.property('Status');
                res.body.data.should.have.property('Phone');
                done();
            });
    });
});

describe('Superman重复关分店', () => {
    it('it should return error', (done) => {
        let data = {
            ShopID:123
        };
        chai.request(server)
            .delete('/api/v1/shops')
            .set("TOKEN",tokenSuperman)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('error');
                res.body.error.should.have.property('message');
                done();
            });
    });
});

describe('分店改分店', () => {
    it('it should return error', (done) => {
        let data = {
            ShopID:124,
            Name:"改名"
        };
        chai.request(server)
            .patch('/api/v1/shops')
            .set("TOKEN",token)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('error');
                done();
            });
    });
});

describe('总店改分店', () => {
    it('it should return info', (done) => {
        let data = {
            ShopID:124,
            Name:"总店改名"
        };
        chai.request(server)
            .patch('/api/v1/shops')
            .set("TOKEN",tokenAdmin)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('data');
                res.body.data.should.have.property('ShopID');
                res.body.data.should.have.property('Name');
                res.body.data.should.have.property('Address');
                res.body.data.should.have.property('Status');
                res.body.data.should.have.property('Phone');
                done();
            });
    });
});

describe('别的总店改分店', () => {
    it('it should return info', (done) => {
        let data = {
            ShopID:124,
            Name:"改名"
        };
        chai.request(server)
            .patch('/api/v1/shops')
            .set("TOKEN",tokenOtherAdmin)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('error');
                done();
            });
    });
});

describe('Superman改分店', () => {
    it('it should return info', (done) => {
        let data = {
            ShopID:123,
            Name:"Superman改名"
        };
        chai.request(server)
            .patch('/api/v1/shops')
            .set("TOKEN",tokenSuperman)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('data');
                res.body.data.should.have.property('ShopID');
                res.body.data.should.have.property('Name');
                res.body.data.should.have.property('Address');
                res.body.data.should.have.property('Status');
                res.body.data.should.have.property('Phone');
                done();
            });
    });
});



