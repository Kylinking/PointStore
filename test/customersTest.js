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
                res.body.should.have.property('Data');
                res.body.Data.should.be.a('array');
                res.body.Data.should.have.length(3);
                done();
            });
    });
});

describe('别的总店取总店用户信息', () => {
    it('it should return error', (done) => {
        chai.request(server)
            .get('/api/v1/customers')
            .query({ShopId:12})
            .set("TOKEN",tokenOtherAdmin)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Error');
                res.body.Error.should.have.property('Message');
                done();
            });
    });
});

describe('别的总店取分店用户信息', () => {
    it('it should return error', (done) => {
        chai.request(server)
            .get('/api/v1/customers')
            .query({ShopId:123})
            .set("TOKEN",tokenOtherAdmin)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Error');
                res.body.Error.should.have.property('Message');
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
                res.body.should.have.property('Data');
                res.body.Data.should.be.a('array');
                res.body.Data.should.have.length(2);
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
                res.body.should.have.property('Data');
                res.body.Data.should.be.a('array');
                res.body.Data.should.have.length(4);
                done();
            });
    });
});

describe('Superman取总店用户信息', () => {
    it('it should return 3 user', (done) => {
        chai.request(server)
            .get('/api/v1/customers')
            .query({ShopId:12})
            .set("TOKEN",tokenSuperman)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Data');
                res.body.Data.should.be.a('array');
                res.body.Data.should.have.length(3);
                done();
            });
    });
});

describe('Superman取分店用户信息', () => {
    it('it should return 2 user', (done) => {
        chai.request(server)
            .get('/api/v1/customers')
            .query({ShopId:123})
            .set("TOKEN",tokenSuperman)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Data');
                res.body.Data.should.be.a('array');
                res.body.Data.should.have.length(2);
                done();
            });
    });
});

describe('分店建用户', () => {
    it('it should create a customerinfo and return info', (done) => {
        let customer = {
            Name: "分店建1号",
            Address: "市中区",
            Status: 1,
            Phone: 111222229,
            Sex: "男",
            Age: 11,
            RecommendCustomerId:2
        };
        chai.request(server)
            .post('/api/v1/customers')
            .set("TOKEN",token)
            .send(customer)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Data');
                res.body.Data.should.have.property('CustomerId');
                res.body.Data.should.have.property('Name');
                res.body.Data.should.have.property('Sex');
                res.body.Data.should.have.property('Age');
                res.body.Data.should.have.property('Address');
                res.body.Data.should.have.property('Status');
                res.body.Data.should.have.property('Phone');
                done();
            });
    });
});

describe('分店建用户手机重号', () => {
    it('it should return error', (done) => {
        let customer = {
            Name: "分店建2",
            Address: "市中区",
            Status: 1,
            Phone: 111222229,
            Sex: "男",
            Age: 11,
        };
        chai.request(server)
            .post('/api/v1/customers')
            .set("TOKEN",token)
            .send(customer)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Error');
                res.body.Error.should.have.property('Message');
                done();
            });
    });
});

describe('分店建用户传不同的ShopId', () => {
    it('it should return error', (done) => {
        let customer = {
            Name: "分店建3",
            Address: "市中区",
            Status: 1,
            Phone: 111333339,
            Sex: "男",
            Age: 11,
            ShopId:124
        };
        chai.request(server)
            .post('/api/v1/customers')
            .set("TOKEN",token)
            .send(customer)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Error');
                res.body.Error.should.have.property('Message');
                done();
            });
    });
});

describe('总店建用户', () => {
    it('it should return error', (done) => {
        let customer = {
            Name: "总店建1号",
            Address: "市中区",
            Status: 1,
            Phone: 111444449,
            Sex: "男",
            Age: 11,
            ShopId:123
        };
        chai.request(server)
            .post('/api/v1/customers')
            .set("TOKEN",tokenAdmin)
            .send(customer)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property('Error'); 
                done();
            });
    });
});

describe('Superman建用户无ShopId', () => {
    it('it should return error', (done) => {
        let customer = {
            Name: "Superman建1号",
            Address: "市中区",
            Status: 0,
            Phone: 111555559,
            Sex: "男",
            Age: 11,
        };
        chai.request(server)
            .post('/api/v1/customers')
            .set("TOKEN",tokenSuperman)
            .send(customer)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Error');
                done();
            });
    });
});

describe('Superman建用户带总店ShopId', () => {
    it('it should return error', (done) => {
        let customer = {
            Name: "Superman建2号",
            Address: "市中区",
            Status: 0,
            Phone: 111666669,
            Sex: "男",
            Age: 11,
            ShopId:11
        };
        chai.request(server)
            .post('/api/v1/customers')
            .set("TOKEN",tokenSuperman)
            .send(customer)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Error');
                done();
            });
    });
});

describe('Superman建用户带分店ShopId Status 0', () => {
    it('it should create a customerinfo and return info', (done) => {
        let customer = {
            Name: "Superman建3号",
            Address: "市中区",
            Status: 0,
            Phone: 111777779,
            Sex: "男",
            Age: 11,
            ShopId:112
        };
        chai.request(server)
            .post('/api/v1/customers')
            .set("TOKEN",tokenSuperman)
            .send(customer)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Data');
                res.body.Data.should.have.property('CustomerId');
                res.body.Data.should.have.property('Name');
                res.body.Data.should.have.property('Sex');
                res.body.Data.should.have.property('Age');
                res.body.Data.should.have.property('Address');
                res.body.Data.should.have.property('Status');
                res.body.Data.should.have.property('Phone');
                res.body.Data.Status.should.eq(0);
                done();
            });
    });
});

describe('Superman建用户带分店ShopId Status 1', () => {
    it('it should create a customerinfo and return info', (done) => {
        let customer = {
            Name: "Superman建4号",
            Address: "市中区",
            Status: 1,
            Phone: 111777780,
            Sex: "男",
            Age: 11,
            ShopId:'112'
        };
        chai.request(server)
            .post('/api/v1/customers')
            .set("TOKEN",tokenSuperman)
            .send(customer)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Data');
                res.body.Data.should.have.property('CustomerId');
                res.body.Data.should.have.property('Name');
                res.body.Data.should.have.property('Sex');
                res.body.Data.should.have.property('Age');
                res.body.Data.should.have.property('Address');
                res.body.Data.should.have.property('Status');
                res.body.Data.should.have.property('Phone');
                res.body.Data.Status.should.eq(1);
                done();
            });
    });
});

describe('分店删用户', () => {
    it('it should set a customerinfo status=0 and return customerinfo', (done) => {
        let customer = {
            Phone:111111
        };
        chai.request(server)
            .delete('/api/v1/customers')
            .set("TOKEN",token)
            .send(customer)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Data');
                res.body.Data.should.have.property('CustomerId');
                res.body.Data.should.have.property('Name');
                res.body.Data.should.have.property('Sex');
                res.body.Data.should.have.property('Age');
                res.body.Data.should.have.property('Address');
                res.body.Data.should.have.property('Status');
                res.body.Data.should.have.property('Phone');
                done();
            });
    });
});

describe('分店重复删用户', () => {
    it('it should return error', (done) => {
        let customer = {
            Phone:111111
        };
        chai.request(server)
            .delete('/api/v1/customers')
            .set("TOKEN",token)
            .send(customer)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Error');
                res.body.Error.should.have.property('Message');
                done();
            });
    });
});

describe('分店删别家分店用户', () => {
    it('it should return error', (done) => {
        let customer = {
            Phone:111777779
        };
        chai.request(server)
            .delete('/api/v1/customers')
            .set("TOKEN",token)
            .send(customer)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Error');
                res.body.Error.should.have.property('Message');
                done();
            });
    });
});

describe('总店删用户', () => {
    it('it should return error', (done) => {
        let customer = {
            Phone:144444
        };
        chai.request(server)
            .delete('/api/v1/customers')
            .set("TOKEN",tokenAdmin)
            .send(customer)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Error');
                res.body.Error.should.have.property('Message');
                done();
            });
    });
});

describe('Superman删用户', () => {
    it('it should return error', (done) => {
        let customer = {
            Phone:144444
        };
        chai.request(server)
            .delete('/api/v1/customers')
            .set("TOKEN",tokenSuperman)
            .send(customer)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Data');
                res.body.Data.should.have.property('Name');
                done();
            });
    });
});

describe('Superman重复删用户', () => {
    it('it should return error', (done) => {
        let customer = {
            Phone:144444
        };
        chai.request(server)
            .delete('/api/v1/customers')
            .set("TOKEN",tokenSuperman)
            .send(customer)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Error');
                res.body.Error.should.have.property('Message');
                done();
            });
    });
});
