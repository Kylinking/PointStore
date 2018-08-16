require('./loginTest');
require('./customeracctinfoTest');
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
const token = require('../config/test.json').token;
const tokenAdmin = require('../config/test.json').tokenAdmin;
const tokenSuperman = require('../config/test.json').tokenSuperman;
const tokenOtherAdmin = require('../config/test.json').tokenOtherAdmin;
const token124 = require('../config/test.json').token124;
chai.use(chaiHttp);

describe('客户充值', () => {
    it('返回客户账户信息', (done) => {
        let data = {
            Phone:122222,
            Recharged:20
        }
        chai.request(server)
            .post('/api/v1/userpoints')
            .set("TOKEN",token124)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('data');
                res.body.data.RemainPoints.should.be.eq(140);
                done();
            });
    });
});

describe('客户充值', () => {
    it('返回客户账户信息', (done) => {
        let data = {
            Phone:111222229,
            Recharged:2000,
            RecommendPoints:200,
            IndirectRecommendPoints:130,
            ShopBounusPoints:20
        }
        chai.request(server)
            .post('/api/v1/userpoints')
            .set("TOKEN",token)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('data');
                res.body.data.RemainPoints.should.be.eq(2020);
                done();
            });
    });
});

describe('客户消费', () => {
    it('返回客户账户信息', (done) => {
        let data = {
            Phone:122222,
            Cost:20
        }
        chai.request(server)
            .post('/api/v1/userpoints')
            .set("TOKEN",token124)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('data');
                res.body.data.RemainPoints.should.be.eq(120);
                done();
            });
    });
});

describe('客户推荐奖励', () => {
    it('返回客户账户信息', (done) => {
        let data = {
            Phone:122222,
            RecommendPoints:20
        }
        chai.request(server)
            .post('/api/v1/userpoints')
            .set("TOKEN",token124)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('data');
                res.body.data.RemainPoints.should.be.eq(120);
                done();
            });
    });
});

describe('客户二级推荐奖励', () => {
    it('返回客户账户信息', (done) => {
        let data = {
            Phone:122222,
            IndirectRecommendPoints:20
        }
        chai.request(server)
            .post('/api/v1/userpoints')
            .set("TOKEN",token124)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('data');
                res.body.data.RemainPoints.should.be.eq(120);
                done();
            });
    });
});

describe('店面奖励', () => {
    it('返回客户账户信息', (done) => {
        let data = {
            Phone:122222,
            ShopBounusPoints:20
        }
        chai.request(server)
            .post('/api/v1/userpoints')
            .set("TOKEN",token124)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('data');
                res.body.data.RemainPoints.should.be.eq(140);
                done();
            });
    });
});

describe('客户推荐奖励', () => {
    it('返回客户账户信息', (done) => {
        let data = {
            Phone:111222229,
            RecommendPoints:20
        }
        chai.request(server)
            .post('/api/v1/userpoints')
            .set("TOKEN",token)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('data');
                res.body.data.RemainPoints.should.be.eq(2020);
                done();
            });
    });
});

describe('客户二级推荐奖励', () => {
    it('返回客户账户信息', (done) => {
        let data = {
            Phone:111222229,
            IndirectRecommendPoints:20
        }
        chai.request(server)
            .post('/api/v1/userpoints')
            .set("TOKEN",token)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('data');
                res.body.data.RemainPoints.should.be.eq(2020);
                done();
            });
    });
});
