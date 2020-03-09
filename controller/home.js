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
  const { username, password } = ctx.request.body;
  console.log(ctx.request.body)

  if(username == 'isafeuser' && password == 'isafe') {
    ctx.body = {
      isChangePassword: false,
      status: 'Success',
      token: 'abc123'
    }
  } else {
    ctx.throw(401, 'Wrong username and password')
  }

};