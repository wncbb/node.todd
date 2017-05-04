var redis=require('redis');
var client=redis.createClient({
  host: '127.0.0.1',
  port: 6379,
  password: '1234',
  //for old version
  auth_pass: '1234',
});

var io = require('socket.io-emitter')(client, {path: '/todd'});
setInterval(function(){
  console.log('one time');
  //io.emit('time', new Date);
  //io.to('socket.io#/#yplzrrBjM1pAxYx3AAAB').emit('time', new Date);
  io.to('123').emit('sTalk', {name: 'System', msg: (new Date())});

}, 1000);



