let util= require('./utility')
let token = util.EncodeToken({});
let obj = util.DecodeToken(token);
setInterval(()=>{
    console.log(util.DecodeToken(token));
},2000);
setInterval(()=>{
    token = util.RefreshToken(token);
},1000);
