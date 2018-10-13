require('./loginTest');
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
const token = require('../config/test.json').token;
const tokenAdmin = require('../config/test.json').tokenAdmin;
const tokenSuperman = require('../config/test.json').tokenSuperman;
const tokenOtherAdmin = require('../config/test.json').tokenOtherAdmin;
chai.use(chaiHttp);

describe('Get shopInfos',()=>{
    it('it should return object', done=>{
        chai.request(server)
            .get('/api/v1/shops')
            .set("TOKEN",token)
            .end((err,res)=>{
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Object');
                res.body.Object.should.be.a('Object');
                done(); 
            })
    })
});

describe('总店取分店信息',()=>{
    it('it should return array', done=>{
        chai.request(server)
            .get('/api/v1/shops')
            .set("TOKEN",tokenAdmin)
            .end((err,res)=>{
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Array');
                res.body.Array.should.be.a('array');
                res.body.Meta.should.have.property('TotalPages');
                res.body.Meta.should.have.property('CurrentPage');
                res.body.Meta.should.have.property('TotalRows');
                res.body.Meta.should.have.property('CurrentRows');
                res.body.Meta.CurrentPage.should.be.gt(0);
                res.body.Array.should.have.length(2);
                done(); 
            })
    })
});

describe('Super Get shopInfos',()=>{
    it('it should return array', done=>{
        chai.request(server)
            .get('/api/v1/shops')
            .query({Type:1})
            .set("TOKEN",tokenSuperman)
            .end((err,res)=>{
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Array');
                res.body.Array.should.be.a('array');
                res.body.Meta.should.have.property('TotalPages');
                res.body.Meta.should.have.property('CurrentPage');
                res.body.Meta.should.have.property('TotalRows');
                res.body.Meta.should.have.property('CurrentRows');
                res.body.Meta.TotalPages.should.be.gt(0);
                res.body.Meta.TotalPages.should.be.gt(0);
                res.body.Array.should.have.length(2);
                done(); 
            })
    })
});

describe('Super Get some shopInfos',()=>{
    it('it should return array', done=>{
        chai.request(server)
            .get('/api/v1/shops')
            .query({Type:1,ShopId:12})
            .set("TOKEN",tokenSuperman)
            .end((err,res)=>{
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Array');
                res.body.Array.should.be.a('array');
                res.body.Meta.should.have.property('TotalPages');
                res.body.Meta.should.have.property('CurrentPage');
                res.body.Meta.should.have.property('TotalRows');
                res.body.Meta.should.have.property('CurrentRows');
                res.body.Meta.TotalPages.should.be.gt(0);
                res.body.Meta.CurrentRows.should.be.gt(0);
                res.body.Array.should.have.length(2);
                done(); 
            })
    })
});

describe('分店建分店', () => {
    it('it should return error', (done) => {
        let data = {
            Name: "test分店",
            Address: "市中区",
            Status: 1,
            Phone: 143431
        };
        chai.request(server)
            .post('/api/v1/shops')
            .set("TOKEN",token)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Error');
                done();
            });
    });
});

describe('总店建分店', () => {
    it('it should create a shopInfo and return info', (done) => {
        let data = {
            Name: "分店1",
            Address: "市中区",
            Status: 1,
            Phone: '12345678902'
        };
        chai.request(server)
            .post('/api/v1/shops')
            .set("TOKEN",tokenAdmin)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Object');
                res.body.Object.should.have.property('ShopId');
                res.body.Object.should.have.property('Name');
                res.body.Object.should.have.property('Address');
                res.body.Object.should.have.property('Status');
                res.body.Object.should.have.property('Phone');
                res.body.Object.should.have.property('ParentShopId');
                done();
            });
    });
});

describe('Superman建总店', () => {
    it('it should create a shopInfo and return info', (done) => {
        let data = {
            Name: "总店1",
            Address: "市中区",
            Status: 1,
            Phone: '12345678901',
        };
        chai.request(server)
            .post('/api/v1/shops')
            .set("TOKEN",tokenSuperman)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Object');
                res.body.Object.should.have.property('ShopId');
                res.body.Object.should.have.property('Name');
                res.body.Object.should.have.property('Address');
                res.body.Object.should.have.property('Status');
                res.body.Object.should.have.property('Phone');
                res.body.Object.should.have.property('ParentShopId');
                done();
            });
    });
});

describe('Superman建分店', () => {
    it('it should create a shopInfo and return info', (done) => {
        let data = {
            Name: "Superman建分店",
            Address: "市中区",
            Status: 1,
            Phone: '113113113',
            ParentShopId:11,
        };
        chai.request(server)
            .post('/api/v1/shops')
            .set("TOKEN",tokenSuperman)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Object');
                res.body.Object.should.have.property('ShopId');
                res.body.Object.should.have.property('Name');
                res.body.Object.should.have.property('Address');
                res.body.Object.should.have.property('Status');
                res.body.Object.should.have.property('Phone');
                res.body.Object.should.have.property('ParentShopId');
                done();
            });
    });
});

describe('分店关分店', () => {
    it('it should return error', (done) => {
        let data = {
            ShopId:124
        };
        chai.request(server)
            .delete('/api/v1/shops')
            .set("TOKEN",token)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Error');
                done();
            });
    });
});

describe('别的总店关分店', () => {
    it('it should return error', (done) => {
        let data = {
            ShopId:124
        };
        chai.request(server)
            .delete('/api/v1/shops')
            .set("TOKEN",tokenOtherAdmin)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Error');
                done();
            });
    });
});
describe('总店关分店', () => {
    it('it should return error', (done) => {
        let data = {
            ShopId:124
        };
        chai.request(server)
            .delete('/api/v1/shops')
            .set("TOKEN",tokenAdmin)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Object');
                res.body.Object.should.have.property('ShopId');
                res.body.Object.should.have.property('Name');
                res.body.Object.should.have.property('Address');
                res.body.Object.should.have.property('Status');
                res.body.Object.should.have.property('Phone');
                done();
            });
    });
});

describe('总店重复关分店', () => {
    it('it should return error', (done) => {
        let data = {
            ShopId:124
        };
        chai.request(server)
            .delete('/api/v1/shops')
            .set("TOKEN",tokenAdmin)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Error');
                res.body.Error.should.have.property('Message');
                done();
            });
    });
});

describe('Superman关分店', () => {
    it('it should return info', (done) => {
        let data = {
            ShopId:123
        };
        chai.request(server)
            .delete('/api/v1/shops')
            .set("TOKEN",tokenSuperman)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Object');
                res.body.Object.should.have.property('ShopId');
                res.body.Object.should.have.property('Name');
                res.body.Object.should.have.property('Address');
                res.body.Object.should.have.property('Status');
                res.body.Object.should.have.property('Phone');
                done();
            });
    });
});

describe('Superman重复关分店', () => {
    it('it should return error', (done) => {
        let data = {
            ShopId:'123'
        };
        chai.request(server)
            .delete('/api/v1/shops')
            .set("TOKEN",tokenSuperman)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Error');
                res.body.Error.should.have.property('Message');
                done();
            });
    });
});

describe('分店改分店', () => {
    it('it should return error', (done) => {
        let data = {
            ShopId:124,
            Name:"改名"
        };
        chai.request(server)
            .patch('/api/v1/shops')
            .set("TOKEN",token)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Error');
                done();
            });
    });
});

describe('总店改分店', () => {
    it('it should return info', (done) => {
        let data = {
            ShopId:124,
            Name:"总店改名",
            Status:1
        };
        chai.request(server)
            .patch('/api/v1/shops')
            .set("TOKEN",tokenAdmin)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Object');
                res.body.Object.should.have.property('ShopId');
                res.body.Object.should.have.property('Name');
                res.body.Object.should.have.property('Address');
                res.body.Object.should.have.property('Status');
                res.body.Object.should.have.property('Phone');
                done();
            });
    });
});

describe('别的总店改分店', () => {
    it('it should return info', (done) => {
        let data = {
            ShopId:124,
            Name:"改名"
        };
        chai.request(server)
            .patch('/api/v1/shops')
            .set("TOKEN",tokenOtherAdmin)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Error');
                done();
            });
    });
});

describe('Superman改分店', () => {
    it('it should return info', (done) => {
        let data = {
            ShopId:123,
            Name:"Superman改名",
            Status:1
        };
        chai.request(server)
            .patch('/api/v1/shops')
            .set("TOKEN",tokenSuperman)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Object');
                res.body.Object.should.have.property('ShopId');
                res.body.Object.should.have.property('Name');
                res.body.Object.should.have.property('Address');
                res.body.Object.should.have.property('Status');
                res.body.Object.should.have.property('Phone');
                done();
            });
    });
});


describe('Superman建分店', () => {
    it('it should create a shopInfo and return info', (done) => {
        let data = {
            Name: "分店2",
            Address: "市中区",
            Status: 1,
            Phone: '12345678911',
            ParentShopId:11,
        };
        chai.request(server)
            .post('/api/v1/shops')
            .set("TOKEN",tokenSuperman)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Object');
                res.body.Object.should.have.property('ShopId');
                res.body.Object.should.have.property('Name');
                res.body.Object.should.have.property('Address');
                res.body.Object.should.have.property('Status');
                res.body.Object.should.have.property('Phone');
                res.body.Object.should.have.property('ParentShopId');
                done();
            });
    });
});
describe('Superman建分店', () => {
    it('it should create a shopInfo and return info', (done) => {
        let data = {
            Name: "分店3",
            Address: "市中区",
            Status: 1,
            Phone: '12345678913',
            ParentShopId:11,
        };
        chai.request(server)
            .post('/api/v1/shops')
            .set("TOKEN",tokenSuperman)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Object');
                res.body.Object.should.have.property('ShopId');
                res.body.Object.should.have.property('Name');
                res.body.Object.should.have.property('Address');
                res.body.Object.should.have.property('Status');
                res.body.Object.should.have.property('Phone');
                res.body.Object.should.have.property('ParentShopId');
                done();
            });
    });
});
describe('Superman建分店', () => {
    it('it should create a shopInfo and return info', (done) => {
        let data = {
            Name: "分店4",
            Address: "市中区",
            Status: 1,
            Phone: '12345678914',
            ParentShopId:11,
        };
        chai.request(server)
            .post('/api/v1/shops')
            .set("TOKEN",tokenSuperman)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Object');
                res.body.Object.should.have.property('ShopId');
                res.body.Object.should.have.property('Name');
                res.body.Object.should.have.property('Address');
                res.body.Object.should.have.property('Status');
                res.body.Object.should.have.property('Phone');
                res.body.Object.should.have.property('ParentShopId');
                done();
            });
    });
});
describe('Superman建分店', () => {
    it('it should create a shopInfo and return info', (done) => {
        let data = {
            Name: "分店5",
            Address: "市中区",
            Status: 1,
            Phone: '12345678915',
            ParentShopId:11,
        };
        chai.request(server)
            .post('/api/v1/shops')
            .set("TOKEN",tokenSuperman)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Object');
                res.body.Object.should.have.property('ShopId');
                res.body.Object.should.have.property('Name');
                res.body.Object.should.have.property('Address');
                res.body.Object.should.have.property('Status');
                res.body.Object.should.have.property('Phone');
                res.body.Object.should.have.property('ParentShopId');
                done();
            });
    });
});
describe('Superman建分店', () => {
    it('it should create a shopInfo and return info', (done) => {
        let data = {
            Name: "分店6",
            Address: "市中区",
            Status: 1,
            Phone: '12345678916',
            ParentShopId:11,
        };
        chai.request(server)
            .post('/api/v1/shops')
            .set("TOKEN",tokenSuperman)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Object');
                res.body.Object.should.have.property('ShopId');
                res.body.Object.should.have.property('Name');
                res.body.Object.should.have.property('Address');
                res.body.Object.should.have.property('Status');
                res.body.Object.should.have.property('Phone');
                res.body.Object.should.have.property('ParentShopId');
                done();
            });
    });
});
describe('Superman建分店', () => {
    it('it should create a shopInfo and return info', (done) => {
        let data = {
            Name: "分店7",
            Address: "市中区",
            Status: 1,
            Phone: '12345678917',
            ParentShopId:11,
        };
        chai.request(server)
            .post('/api/v1/shops')
            .set("TOKEN",tokenSuperman)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Object');
                res.body.Object.should.have.property('ShopId');
                res.body.Object.should.have.property('Name');
                res.body.Object.should.have.property('Address');
                res.body.Object.should.have.property('Status');
                res.body.Object.should.have.property('Phone');
                res.body.Object.should.have.property('ParentShopId');
                done();
            });
    });
});
describe('Superman建分店', () => {
    it('it should create a shopInfo and return info', (done) => {
        let data = {
            Name: "分店8",
            Address: "市中区",
            Status: 1,
            Phone: '12345678918',
            ParentShopId:11,
        };
        chai.request(server)
            .post('/api/v1/shops')
            .set("TOKEN",tokenSuperman)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Object');
                res.body.Object.should.have.property('ShopId');
                res.body.Object.should.have.property('Name');
                res.body.Object.should.have.property('Address');
                res.body.Object.should.have.property('Status');
                res.body.Object.should.have.property('Phone');
                res.body.Object.should.have.property('ParentShopId');
                done();
            });
    });
});
describe('Superman建分店', () => {
    it('it should create a shopInfo and return info', (done) => {
        let data = {
            Name: "分店9",
            Address: "市中区",
            Status: 1,
            Phone: '12345678919',
            ParentShopId:11,
        };
        chai.request(server)
            .post('/api/v1/shops')
            .set("TOKEN",tokenSuperman)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Object');
                res.body.Object.should.have.property('ShopId');
                res.body.Object.should.have.property('Name');
                res.body.Object.should.have.property('Address');
                res.body.Object.should.have.property('Status');
                res.body.Object.should.have.property('Phone');
                res.body.Object.should.have.property('ParentShopId');
                done();
            });
    });
});
describe('Superman建分店', () => {
    it('it should create a shopInfo and return info', (done) => {
        let data = {
            Name: "分店10",
            Address: "市中区",
            Status: 1,
            Phone: '12345678920',
            ParentShopId:11,
        };
        chai.request(server)
            .post('/api/v1/shops')
            .set("TOKEN",tokenSuperman)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Object');
                res.body.Object.should.have.property('ShopId');
                res.body.Object.should.have.property('Name');
                res.body.Object.should.have.property('Address');
                res.body.Object.should.have.property('Status');
                res.body.Object.should.have.property('Phone');
                res.body.Object.should.have.property('ParentShopId');
                done();
            });
    });
});
describe('Superman建分店', () => {
    it('it should create a shopInfo and return info', (done) => {
        let data = {
            Name: "分店11",
            Address: "市中区",
            Status: 1,
            Phone: '12345678921',
            ParentShopId:11,
        };
        chai.request(server)
            .post('/api/v1/shops')
            .set("TOKEN",tokenSuperman)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Object');
                res.body.Object.should.have.property('ShopId');
                res.body.Object.should.have.property('Name');
                res.body.Object.should.have.property('Address');
                res.body.Object.should.have.property('Status');
                res.body.Object.should.have.property('Phone');
                res.body.Object.should.have.property('ParentShopId');
                done();
            });
    });
});
describe('Superman建分店', () => {
    it('it should create a shopInfo and return info', (done) => {
        let data = {
            Name: "分店12",
            Address: "市中区",
            Status: 1,
            Phone: '12345678922',
            ParentShopId:11,
        };
        chai.request(server)
            .post('/api/v1/shops')
            .set("TOKEN",tokenSuperman)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Object');
                res.body.Object.should.have.property('ShopId');
                res.body.Object.should.have.property('Name');
                res.body.Object.should.have.property('Address');
                res.body.Object.should.have.property('Status');
                res.body.Object.should.have.property('Phone');
                res.body.Object.should.have.property('ParentShopId');
                done();
            });
    });
});
describe('Superman建分店', () => {
    it('it should create a shopInfo and return info', (done) => {
        let data = {
            Name: "分店13",
            Address: "市中区",
            Status: 1,
            Phone: '12345678923',
            ParentShopId:11,
        };
        chai.request(server)
            .post('/api/v1/shops')
            .set("TOKEN",tokenSuperman)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Object');
                res.body.Object.should.have.property('ShopId');
                res.body.Object.should.have.property('Name');
                res.body.Object.should.have.property('Address');
                res.body.Object.should.have.property('Status');
                res.body.Object.should.have.property('Phone');
                res.body.Object.should.have.property('ParentShopId');
                done();
            });
    });
});
describe('Superman建分店', () => {
    it('it should create a shopInfo and return info', (done) => {
        let data = {
            Name: "分店14",
            Address: "市中区",
            Status: 1,
            Phone: '12345678924',
            ParentShopId:11,
        };
        chai.request(server)
            .post('/api/v1/shops')
            .set("TOKEN",tokenSuperman)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Object');
                res.body.Object.should.have.property('ShopId');
                res.body.Object.should.have.property('Name');
                res.body.Object.should.have.property('Address');
                res.body.Object.should.have.property('Status');
                res.body.Object.should.have.property('Phone');
                res.body.Object.should.have.property('ParentShopId');
                done();
            });
    });
});
describe('Superman建分店', () => {
    it('it should create a shopInfo and return info', (done) => {
        let data = {
            Name: "分店15",
            Address: "市中区",
            Status: 1,
            Phone: '12345678925',
            ParentShopId:11,
        };
        chai.request(server)
            .post('/api/v1/shops')
            .set("TOKEN",tokenSuperman)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Object');
                res.body.Object.should.have.property('ShopId');
                res.body.Object.should.have.property('Name');
                res.body.Object.should.have.property('Address');
                res.body.Object.should.have.property('Status');
                res.body.Object.should.have.property('Phone');
                res.body.Object.should.have.property('ParentShopId');
                done();
            });
    });
});
describe('Superman建分店', () => {
    it('it should create a shopInfo and return info', (done) => {
        let data = {
            Name: "分店16",
            Address: "市中区",
            Status: 1,
            Phone: '12345678926',
            ParentShopId:11,
        };
        chai.request(server)
            .post('/api/v1/shops')
            .set("TOKEN",tokenSuperman)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Object');
                res.body.Object.should.have.property('ShopId');
                res.body.Object.should.have.property('Name');
                res.body.Object.should.have.property('Address');
                res.body.Object.should.have.property('Status');
                res.body.Object.should.have.property('Phone');
                res.body.Object.should.have.property('ParentShopId');
                done();
            });
    });
});
describe('Superman建分店', () => {
    it('it should create a shopInfo and return info', (done) => {
        let data = {
            Name: "分店17",
            Address: "市中区",
            Status: 1,
            Phone: '12345678927',
            ParentShopId:11,
        };
        chai.request(server)
            .post('/api/v1/shops')
            .set("TOKEN",tokenSuperman)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Object');
                res.body.Object.should.have.property('ShopId');
                res.body.Object.should.have.property('Name');
                res.body.Object.should.have.property('Address');
                res.body.Object.should.have.property('Status');
                res.body.Object.should.have.property('Phone');
                res.body.Object.should.have.property('ParentShopId');
                done();
            });
    });
});
describe('Superman建分店', () => {
    it('it should create a shopInfo and return info', (done) => {
        let data = {
            Name: "分店18",
            Address: "市中区",
            Status: 1,
            Phone: '12345678928',
            ParentShopId:11,
        };
        chai.request(server)
            .post('/api/v1/shops')
            .set("TOKEN",tokenSuperman)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Object');
                res.body.Object.should.have.property('ShopId');
                res.body.Object.should.have.property('Name');
                res.body.Object.should.have.property('Address');
                res.body.Object.should.have.property('Status');
                res.body.Object.should.have.property('Phone');
                res.body.Object.should.have.property('ParentShopId');
                done();
            });
    });
});
describe('Superman建分店', () => {
    it('it should create a shopInfo and return info', (done) => {
        let data = {
            Name: "分店19",
            Address: "市中区",
            Status: 1,
            Phone: '12345678929',
            ParentShopId:11,
        };
        chai.request(server)
            .post('/api/v1/shops')
            .set("TOKEN",tokenSuperman)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Object');
                res.body.Object.should.have.property('ShopId');
                res.body.Object.should.have.property('Name');
                res.body.Object.should.have.property('Address');
                res.body.Object.should.have.property('Status');
                res.body.Object.should.have.property('Phone');
                res.body.Object.should.have.property('ParentShopId');
                done();
            });
    });
});
describe('Superman建分店', () => {
    it('it should create a shopInfo and return info', (done) => {
        let data = {
            Name: "分店20",
            Address: "市中区",
            Status: 1,
            Phone: '12345678930',
            ParentShopId:11,
        };
        chai.request(server)
            .post('/api/v1/shops')
            .set("TOKEN",tokenSuperman)
            .send(data)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object'); 
                res.body.should.have.property('Object');
                res.body.Object.should.have.property('ShopId');
                res.body.Object.should.have.property('Name');
                res.body.Object.should.have.property('Address');
                res.body.Object.should.have.property('Status');
                res.body.Object.should.have.property('Phone');
                res.body.Object.should.have.property('ParentShopId');
                done();
            });
    });
});