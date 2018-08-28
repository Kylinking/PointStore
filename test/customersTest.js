require('./loginTest');
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
const token = require('../config/test.json').token;
const tokenAdmin = require('../config/test.json').tokenAdmin;
const tokenSuperman = require('../config/test.json').tokenSuperman;
const tokenOtherAdmin = require('../config/test.json').tokenOtherAdmin;
chai.use(chaiHttp);


describe('总店取所有用户信息', () => {
    it('it should return 3 users', (done) => {
        chai.request(server)
            .get('/api/v1/customers')
            .set("TOKEN",tokenAdmin)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('data');
                res.body.data.should.be.a('array');
                res.body.data.should.have.length(3);
                done();
            });
    });
});

describe('别的总店取总店用户信息', () => {
    it('it should return error', (done) => {
        chai.request(server)
            .get('/api/v1/customers')
            .query({shopid:12})
            .set("TOKEN",tokenOtherAdmin)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('error');
                res.body.error.should.have.property('message');
                done();
            });
    });
});

describe('别的总店取分店用户信息', () => {
    it('it should return error', (done) => {
        chai.request(server)
            .get('/api/v1/customers')
            .query({shopid:123})
            .set("TOKEN",tokenOtherAdmin)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('error');
                res.body.error.should.have.property('message');
                done();
            });
    });
});

describe('分店取所有用户信息', () => {
    it('it should return 2 user', (done) => {
        chai.request(server)
            .get('/api/v1/customers')
            .set("TOKEN",token)
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

describe('Superman取所有用户信息', () => {
    it('it should return 4 user', (done) => {
        chai.request(server)
            .get('/api/v1/customers')
            .set("TOKEN",tokenSuperman)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('data');
                res.body.data.should.be.a('array');
                res.body.data.should.have.length(4);
                done();
            });
    });
});

describe('Superman取总店用户信息', () => {
    it('it should return 3 user', (done) => {
        chai.request(server)
            .get('/api/v1/customers')
            .query({shopid:12})
            .set("TOKEN",tokenSuperman)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('data');
                res.body.data.should.be.a('array');
                res.body.data.should.have.length(3);
                done();
            });
    });
});

describe('Superman取分店用户信息', () => {
    it('it should return 2 user', (done) => {
        chai.request(server)
            .get('/api/v1/customers')
            .query({shopid:123})
            .set("TOKEN",tokenSuperman)
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

describe('分店建用户', () => {
    it('it should create a customerinfo and return info', (done) => {
        let customer = {
            name: "分店建1号",
            address: "市中区",
            status: 1,
            phone: 111222229,
            sex: "男",
            age: 11,
            RecommendCustomerID:2
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

describe('分店建用户手机重号', () => {
    it('it should return error', (done) => {
        let customer = {
            name: "分店建2",
            address: "市中区",
            status: 1,
            phone: 111222229,
            sex: "男",
            age: 11,
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

describe('分店建用户传不同的ShopID', () => {
    it('it should return error', (done) => {
        let customer = {
            name: "分店建3",
            address: "市中区",
            status: 1,
            phone: 111333339,
            sex: "男",
            age: 11,
            shopid:124
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

describe('总店建用户', () => {
    it('it should return error', (done) => {
        let customer = {
            name: "总店建1号",
            address: "市中区",
            status: 1,
            phone: 111444449,
            sex: "男",
            age: 11,
            shopid:123
        };
        chai.request(server)
            .post('/api/v1/customers')
            .set("TOKEN",tokenAdmin)
            .send(customer)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property('error'); 
                done();
            });
    });
});

describe('Superman建用户无ShopID', () => {
    it('it should return error', (done) => {
        let customer = {
            name: "Superman建1号",
            address: "市中区",
            status: 0,
            phone: 111555559,
            sex: "男",
            age: 11,
        };
        chai.request(server)
            .post('/api/v1/customers')
            .set("TOKEN",tokenSuperman)
            .send(customer)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('error');
                done();
            });
    });
});

describe('Superman建用户带总店ShopID', () => {
    it('it should return error', (done) => {
        let customer = {
            name: "Superman建2号",
            address: "市中区",
            status: 0,
            phone: 111666669,
            sex: "男",
            age: 11,
            shopid:11
        };
        chai.request(server)
            .post('/api/v1/customers')
            .set("TOKEN",tokenSuperman)
            .send(customer)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('error');
                done();
            });
    });
});

describe('Superman建用户带分店ShopID Status 0', () => {
    it('it should create a customerinfo and return info', (done) => {
        let customer = {
            name: "Superman建3号",
            address: "市中区",
            status: 0,
            phone: 111777779,
            sex: "男",
            age: 11,
            shopid:112
        };
        chai.request(server)
            .post('/api/v1/customers')
            .set("TOKEN",tokenSuperman)
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
                res.body.data.Status.should.eq(0);
                done();
            });
    });
});

describe('Superman建用户带分店ShopID Status 1', () => {
    it('it should create a customerinfo and return info', (done) => {
        let customer = {
            name: "Superman建4号",
            address: "市中区",
            status: 1,
            phone: 111777780,
            sex: "男",
            age: 11,
            shopid:'112'
        };
        chai.request(server)
            .post('/api/v1/customers')
            .set("TOKEN",tokenSuperman)
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
                res.body.data.Status.should.eq(1);
                done();
            });
    });
});

describe('分店删用户', () => {
    it('it should set a customerinfo status=0 and return customerinfo', (done) => {
        let customer = {
            phone:111111
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

describe('分店重复删用户', () => {
    it('it should return error', (done) => {
        let customer = {
            phone:111111
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

describe('分店删别家分店用户', () => {
    it('it should return error', (done) => {
        let customer = {
            phone:111777779
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

describe('总店删用户', () => {
    it('it should return error', (done) => {
        let customer = {
            phone:144444
        };
        chai.request(server)
            .delete('/api/v1/customers')
            .set("TOKEN",tokenAdmin)
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

describe('Superman删用户', () => {
    it('it should return error', (done) => {
        let customer = {
            phone:144444
        };
        chai.request(server)
            .delete('/api/v1/customers')
            .set("TOKEN",tokenSuperman)
            .send(customer)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('data');
                res.body.data.should.have.property('Name');
                done();
            });
    });
});

describe('Superman重复删用户', () => {
    it('it should return error', (done) => {
        let customer = {
            phone:144444
        };
        chai.request(server)
            .delete('/api/v1/customers')
            .set("TOKEN",tokenSuperman)
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
