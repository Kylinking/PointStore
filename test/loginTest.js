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
            ShopID: "123",
            Password: "hello"
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
            ShopID: "012",
            Password: "hello"
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
            ShopID: "123",
            Password: "fake password"
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
            ShopID: "fake ID",
            Password: "fake password"
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