let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
let should = chai.should();
let db = require('../models').db;

chai.use(chaiHttp);

describe('Create customerinfo', () => {
    it('it should create a customerinfo and return info', (done) => {
        let customer = {
            Name: "小明",
            Address: "市中区",
            Status: 1,
            Phone: 123321,
            Sex: "男",
            Age: 11
        };
        chai.request(server)
            .post('/api/v1/customers')
            .send(customer)
            .end((err, res) => {
                console.log(err);
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

describe('delete customerinfo', () => {
    it('it should set a customerinfo status=0 and return customerinfo', (done) => {
        let customer = {
            CustomerID:1
        };
        chai.request(server)
            .post('/api/v1/customers')
            .send(customer)
            .end((err, res) => {
                console.log(err);
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