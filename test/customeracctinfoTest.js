require('./loginTest');
require('./customersTest');
require('./shopsTest');
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
const token = require('../config/test.json').token;
const tokenAdmin = require('../config/test.json').tokenAdmin;
const tokenSuperman = require('../config/test.json').tokenSuperman;
const tokenOtherAdmin = require('../config/test.json').tokenOtherAdmin;
chai.use(chaiHttp);

describe('总店取客户账户信息', () => {
    it('返回4条数据', (done) => {
        chai.request(server)
            .get('/api/v1/userpoints')
            .set("TOKEN",tokenAdmin)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Array');
                res.body.Array.should.be.a('array');
                res.body.Meta.should.have.property('TotalPages');
                res.body.Meta.should.have.property('CurrentPage');
                res.body.Meta.should.have.property('TotalRows');
                res.body.Meta.should.have.property('CurrentRows');
                res.body.Meta.TotalRows.should.eq(23);
                done();
            });
    });
});

describe('Superman取客户账户信息', () => {
    it('返回4条数据', (done) => {
        chai.request(server)
            .get('/api/v1/userpoints')
            .query({ShopId:12})
            .set("TOKEN",tokenSuperman)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Array');
                res.body.Array.should.be.a('array');
                res.body.Meta.should.have.property('TotalPages');
                res.body.Meta.should.have.property('CurrentPage');
                res.body.Meta.should.have.property('TotalRows');
                res.body.Meta.should.have.property('CurrentRows');
                res.body.Meta.TotalRows.should.eq(23);
                done();
            });
    });
});

describe('Superman取客户账户信息', () => {
    it('返回7条数据', (done) => {
        chai.request(server)
            .get('/api/v1/userpoints')
            .set("TOKEN",tokenSuperman)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Array');
                res.body.Array.should.be.a('array');
                res.body.Meta.should.have.property('TotalPages');
                res.body.Meta.should.have.property('CurrentPage');
                res.body.Meta.should.have.property('TotalRows');
                res.body.Meta.should.have.property('CurrentRows');
                res.body.Meta.TotalRows.should.eq(28);
                done();
            });
    });
});

describe('分店取客户账户信息', () => {
    it('返回3条数据', (done) => {
        chai.request(server)
            .get('/api/v1/userpoints')
            .set("TOKEN",token)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Array');
                res.body.Array.should.be.a('array');
                res.body.Meta.should.have.property('TotalPages');
                res.body.Meta.should.have.property('CurrentPage');
                res.body.Meta.should.have.property('TotalRows');
                res.body.Meta.should.have.property('CurrentRows');
                res.body.Meta.TotalRows.should.eq(23);
                done();
            });
    });
});

describe('Superman取客户账户信息', () => {
    it('返回1条数据', (done) => {
        chai.request(server)
            .get('/api/v1/userpoints')
            .query({Phone:13890651234})
            .set("TOKEN",tokenSuperman)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Array');
                res.body.Array.should.be.a('array');
                res.body.Array.should.have.length(1);
                res.body.Meta.should.have.property('TotalPages');
                res.body.Meta.should.have.property('CurrentPage');
                res.body.Meta.should.have.property('TotalRows');
                res.body.Meta.should.have.property('CurrentRows');
                done();
            });
    });
});

describe('分店取客户账户信息', () => {
    it('返回1条数据', (done) => {
        chai.request(server)
            .get('/api/v1/userpoints')
            .query({Phone:13890651234})
            .set("TOKEN",token)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Array');
                res.body.Array.should.be.a('array');
                res.body.Array.should.have.length(1);
                res.body.Meta.should.have.property('TotalPages');
                res.body.Meta.should.have.property('CurrentPage');
                res.body.Meta.should.have.property('TotalRows');
                res.body.Meta.should.have.property('CurrentRows');
                done();
            });
    });
});

describe('分店取不同总店客户账户信息', () => {
    it('返回错误', (done) => {
        chai.request(server)
            .get('/api/v1/userpoints')
            .query({Phone:13890651237})
            .set("TOKEN",token)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Array');
                res.body.Array.should.have.length(0);
                done();
            });
    });
});

describe('总店取不同总店下的客户账户信息', () => {
    it('返回错误', (done) => {
        chai.request(server)
            .get('/api/v1/userpoints')
            .query({Phone:13890651236})
            .set("TOKEN",tokenOtherAdmin)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.Array.should.have.length(0);
                res.body.should.have.property('Array');
                done();
            });
    });
});