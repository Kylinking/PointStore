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
                res.body.should.have.property('data');
                res.body.data.should.be.a('array');
                res.body.data.should.have.length(4);
                res.body.should.have.property('Pages');
                done();
            });
    });
});

describe('Superman取客户账户信息', () => {
    it('返回4条数据', (done) => {
        chai.request(server)
            .get('/api/v1/userpoints')
            .query({shopid:12})
            .set("TOKEN",tokenSuperman)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('data');
                res.body.data.should.be.a('array');
                res.body.data.should.have.length(4);
                res.body.should.have.property('Pages');
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
                res.body.should.have.property('data');
                res.body.data.should.be.a('array');
                res.body.data.should.have.length(7);
                res.body.should.have.property('Pages');
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
                res.body.should.have.property('data');
                res.body.data.should.be.a('array');
                res.body.data.should.have.length(3);
                res.body.should.have.property('Pages');
                done();
            });
    });
});

describe('Superman取客户账户信息', () => {
    it('返回1条数据', (done) => {
        chai.request(server)
            .get('/api/v1/userpoints')
            .query({phone:111111})
            .set("TOKEN",tokenSuperman)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('data');
                res.body.data.should.be.a('array');
                res.body.data.should.have.length(1);
                res.body.should.have.property('Pages');
                done();
            });
    });
});

describe('分店取客户账户信息', () => {
    it('返回1条数据', (done) => {
        chai.request(server)
            .get('/api/v1/userpoints')
            .query({phone:111111})
            .set("TOKEN",token)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('data');
                res.body.data.should.be.a('array');
                res.body.data.should.have.length(1);
                res.body.should.have.property('Pages');
                done();
            });
    });
});

describe('分店取不同分店客户账户信息', () => {
    it('返回错误', (done) => {
        chai.request(server)
            .get('/api/v1/userpoints')
            .query({phone:122222})
            .set("TOKEN",token)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('error');
                done();
            });
    });
});

describe('总店取不同总店下的客户账户信息', () => {
    it('返回错误', (done) => {
        chai.request(server)
            .get('/api/v1/userpoints')
            .query({phone:122222})
            .set("TOKEN",tokenOtherAdmin)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('error');
                done();
            });
    });
});