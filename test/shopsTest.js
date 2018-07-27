let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJTaG9wSUQiOjEyM30.7f9YHrKohwNUajhlGB1RPzGTjBt0eOcOA30KknLRugI';
const tokenAdmin = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJTaG9wSUQiOiIwMTIifQ.WjAXQ_WFM95fd2c5keiFZrduOWc1SOzc8q4Y-zjKUYo";
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

describe('Create shopInfo', () => {
    it('it should create a shopInfo and return info', (done) => {
        let data = {
            Name: "test分店",
            Address: "市中区",
            Status: 1,
            Phone: 143431,
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

describe('delete shopInfo', () => {
    it('it should set a shopInfo status=0 and return shopInfo', (done) => {
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

describe('delete shopInfo twice', () => {
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
                res.body.error.should.have.property('message');
                done();
            });
    });
});

describe('patch shopInfo fields', () => {
    it('it should return error', (done) => {
        let data = {
            ShopID:124,
            Name:"testNameChange"
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

//admin
describe('Get shopInfos',()=>{
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
                done(); 
            })
    })
});

describe('Create shopInfo', () => {
    it('it should create a shopInfo and return info', (done) => {
        let data = {
            Name: "test分店",
            Address: "市中区",
            Status: 1,
            Phone: 143431,
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
                done();
            });
    });
});

describe('delete shopInfo', () => {
    it('it should set a shopInfo status=0 and return shopInfo', (done) => {
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

describe('delete shopInfo twice', () => {
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

describe('patch shopInfo fields', () => {
    it('it should return info', (done) => {
        let data = {
            ShopID:124,
            Name:"testNameChange"
        };
        chai.request(server)
            .patch('/api/v1/shops')
            .set("TOKEN",tokenAdmin)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('data');
                res.body.data.should.have.property('Name');
                done();
            });
    });
});