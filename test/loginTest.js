let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
let should = chai.should();
let db = require('../models').db;

chai.use(chaiHttp);

before(async ()=>{
   await db.sequelize.sync({force:true});
   await require('./fakedata.js')(db);
});
describe('Login with correct ShopID & Password', () => {
    it('it should get token', (done) => {
        let info = {
            shopid: 1,
            password: "hello"
        };
        chai.request(server)
            .post('/login')
            .send(info)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('data');
                res.body.data.should.have.property('token');
                res.body.data.token.length.should.be.gt(0);
                res.body.data.should.have.property('message');
                done();
            });
    });
});
describe('Login with correct ShopID & Password', () => {
    it('it should get token', (done) => {
        let info = {
            shopid: 124,
            password: "hello"
        };
        chai.request(server)
            .post('/login')
            .send(info)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('data');
                res.body.data.should.have.property('token');
                res.body.data.token.length.should.be.gt(0);
                res.body.data.should.have.property('message');
                done();
            });
    });
});
describe('Login with correct ShopID & Password', () => {
    it('it should get token', (done) => {
        let info = {
            shopid: 11,
            password: "hello"
        };
        chai.request(server)
            .post('/login')
            .send(info)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('data');
                res.body.data.should.have.property('token');
                res.body.data.token.length.should.be.gt(0);
                res.body.data.should.have.property('message');
                done();
            });
    });
});

describe('Login with correct ShopID & Password', () => {
    it('it should get token', (done) => {
        let info = {
            shopid: 123,
            password: "hello"
        };
        chai.request(server)
            .post('/login')
            .send(info)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('data');
                res.body.data.should.have.property('token');
                res.body.data.token.length.should.be.gt(0);
                res.body.data.should.have.property('message');
                done();
            });
    });
});
describe('Login with correct ShopID & Password', () => {
    it('it should get token', (done) => {
        let info = {
            shopid: 12,
            password: "hello"
        };
        chai.request(server)
            .post('/login')
            .send(info)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('data');
                res.body.data.should.have.property('token');
                res.body.data.token.length.should.be.gt(0);
                res.body.data.should.have.property('message');
                done();
            });
    });
});
describe('Login with correct ShopID & fake Password', () => {
    it('it should return error', (done) => {
        let info = {
            shopid: 123,
            password: "fake password"
        };
        chai.request(server)
            .post('/login')
            .send(info)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.not.have.property('data');
                res.body.should.have.property('error');
                res.body.error.should.have.property('message');
                res.body.error.message.should.be.eq("密码错误");
                done();
            });
    })
});
describe('Login with fake ShopID & fake Password', () => {
    it('it should return error', (done) => {
        let info = {
            shopid: 1000,
            password: "fake password"
        };
        chai.request(server)
            .post('/login')
            .send(info)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.not.have.property('data');
                res.body.should.have.property('error');
                res.body.error.should.have.property('message');
                res.body.error.message.should.be.eq("用户不存在");
                done();
            });
    })
});