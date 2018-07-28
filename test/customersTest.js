require('./loginTest');
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJTaG9wSUQiOjEyM30.7f9YHrKohwNUajhlGB1RPzGTjBt0eOcOA30KknLRugI';
const tokenAdmin = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJTaG9wSUQiOiIwMTIifQ.WjAXQ_WFM95fd2c5keiFZrduOWc1SOzc8q4Y-zjKUYo";
chai.use(chaiHttp);

describe('Create customerinfo', () => {
    it('it should create a customerinfo and return info', (done) => {
        let customer = {
            Name: "小明",
            Address: "市中区",
            Status: 1,
            Phone: 123321,
            Sex: "男",
            Age: 11,
            ShopID:123
        };
        chai.request(server)
            .post('/api/v1/customers')
            .set("TOKEN",token)
            .send(customer)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('data');
                res.body.data.should.have.property('CustomerID');
                res.body.data.should.have.property('Name');
                res.body.data.should.have.property('Sex');
                res.body.data.should.have.property('Age');
                res.body.data.should.have.property('Address');
                res.body.data.should.have.property('Status');
                res.body.data.should.have.property('Phone');
                done();
            });
    });
});

describe('Create customerinfo with duplicated phone', () => {
    it('it should return error', (done) => {
        let customer = {
            Name: "小明",
            Address: "市中区",
            Status: 1,
            Phone: 123321,
            Sex: "男",
            Age: 11,
            ShopID:123
        };
        chai.request(server)
            .post('/api/v1/customers')
            .set("TOKEN",token)
            .send(customer)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('error');
                res.body.error.should.have.property('message');
                done();
            });
    });
});

describe('delete customerinfo', () => {
    it('it should set a customerinfo status=0 and return customerinfo', (done) => {
        let customer = {
            CustomerID:1
        };
        chai.request(server)
            .delete('/api/v1/customers')
            .set("TOKEN",token)
            .send(customer)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('data');
                res.body.data.should.have.property('CustomerID');
                res.body.data.should.have.property('Name');
                res.body.data.should.have.property('Sex');
                res.body.data.should.have.property('Age');
                res.body.data.should.have.property('Address');
                res.body.data.should.have.property('Status');
                res.body.data.should.have.property('Phone');
                done();
            });
    });
});

describe('delete customerinfo with deleted customer', () => {
    it('it should return error', (done) => {
        let customer = {
            CustomerID:1
        };
        chai.request(server)
            .delete('/api/v1/customers')
            .set("TOKEN",token)
            .send(customer)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('error');
                res.body.error.should.have.property('message');
                done();
            });
    });
});

describe('get customerinfo', () => {
    it('it should return 2 users', (done) => {
        chai.request(server)
            .get('/api/v1/customers')
            .set("TOKEN",tokenAdmin)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('data');
                res.body.data.should.be.a('array');
                res.body.data.should.have.length(2);
                done();
            });
    });
});

describe('get customerinfo', () => {
    it('it should return 1 user', (done) => {
        chai.request(server)
            .get('/api/v1/customers')
            .set("TOKEN",token)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('data');
                res.body.data.should.be.a('array');
                res.body.data.should.have.length(1);
                done();
            });
    });
});
