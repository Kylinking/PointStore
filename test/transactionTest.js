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
                res.body.data.RemainPoints.should.be.eq(100);
                done();
            });
    });
});

describe('客户充值', () => {
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
                done();
            });
    });
});