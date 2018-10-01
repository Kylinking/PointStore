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
describe('Login with correct ShopId & Password', () => {
    it('it should get token', (done) => {
        let info = {
            ShopId: 1,
            Password: "hello"
        };
        chai.request(server)
            .post('/login')
            .send(info)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Data');
                res.body.Data.should.have.property('Token');
                res.body.Data.Token.length.should.be.gt(0);
                res.body.Data.should.have.property('Message');
                done();
            });
    });
});
describe('Login with correct ShopId & Password', () => {
    it('it should get token', (done) => {
        let info = {
            ShopId: 124,
            Password: "hello"
        };
        chai.request(server)
            .post('/login')
            .send(info)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Data');
                res.body.Data.should.have.property('Token');
                res.body.Data.Token.length.should.be.gt(0);
                res.body.Data.should.have.property('Message');
                done();
            });
    });
});
describe('Login with correct ShopId & Password', () => {
    it('it should get token', (done) => {
        let info = {
            ShopId: 11,
            Password: "hello"
        };
        chai.request(server)
            .post('/login')
            .send(info)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Data');
                res.body.Data.should.have.property('Token');
                res.body.Data.Token.length.should.be.gt(0);
                res.body.Data.should.have.property('Message');
                done();
            });
    });
});

describe('Login with correct ShopId & Password', () => {
    it('it should get token', (done) => {
        let info = {
            ShopId: 123,
            Password: "hello"
        };
        chai.request(server)
            .post('/login')
            .send(info)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Data');
                res.body.Data.should.have.property('Token');
                res.body.Data.Token.length.should.be.gt(0);
                res.body.Data.should.have.property('Message');
                done();
            });
    });
});
describe('Login with correct ShopId & Password', () => {
    it('it should get token', (done) => {
        let info = {
            ShopId: 12,
            Password: "hello"
        };
        chai.request(server)
            .post('/login')
            .send(info)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Data');
                res.body.Data.should.have.property('Token');
                res.body.Data.Token.length.should.be.gt(0);
                res.body.Data.should.have.property('Message');
                done();
            });
    });
});
describe('Login with correct ShopId & fake Password', () => {
    it('it should return error', (done) => {
        let info = {
            ShopId: 123,
            Password: "fake password"
        };
        chai.request(server)
            .post('/login')
            .send(info)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.not.have.property('Data');
                res.body.should.have.property('Error');
                res.body.Error.should.have.property('Message');
                res.body.Error.Message.should.be.eq("密码错误");
                done();
            });
    })
});
describe('Login with fake ShopId & fake Password', () => {
    it('it should return error', (done) => {
        let info = {
            ShopId: 1000,
            Password: "fake password"
        };
        chai.request(server)
            .post('/login')
            .send(info)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.not.have.property('Data');
                res.body.should.have.property('Error');
                res.body.Error.should.have.property('Message');
                res.body.Error.Message.should.be.eq("用户不存在");
                done();
            });
    })
});