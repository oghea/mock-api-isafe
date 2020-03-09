'use strict';
const {
  DateTime
} = require(`luxon`);

exports.getApiInfo = async (ctx) => {
  const time = DateTime
    .local()
    .toJSDate()
  ctx.body = {
    status: 'up',
    started: time,
    data: 'Mock API Server iSafe'
  }
};

exports.SignIn = async (ctx) => {
  const { email, password } = ctx.request.body;

  if(email == 'a.pprayoga18@gmail.com' && password == 'isafe') {
    ctx.body = {
      isChangePassword: false,
      status: 'Success'
    }
  } else {
    ctx.throw(401, 'Wrong email and password')
  }

  
};