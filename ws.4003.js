/*
 *这里用nginx做了反向代理，然后请求会按照固定hash分配到内部4001，4002端口上。
 *HTTPS协议因为没有认证证书，浏览器会认为是不安全连接，需要添加意外
 */

var Koa=require('koa');
var mount=require('koa-mount');
var render=require('koa-ejs');
var staticService=require('koa-static');
var util=require('util');
var http=require('http');
var io=require('socket.io');
var ioRedis=require('socket.io-redis');
var fs=require('fs');
var path=require('path');
var redis=require('redis').createClient;

var app=new Koa();
app.use(function*(next){
  console.log(this.request.url);
  this.status=404;
  this.body="todd's ws server";
  yield next;

});
/*
render(app, {
  root: path.join(__dirname, 'view');
  viewExt: 'ejs',
  cache: false,
  debug: true,
});

app.use(staticService(path.join(__dirname, 'staticFile')));
app.use(bodyParser());

var indexRouter=require('./conroller/indexRouter.js');
app.use(mount('/', indexRouter.routes()));
*/

var server=http.Server(app.callback());

var test1Ws=io(server, {
  path: '/alice',
  //origins: 'http://koa2:8888/',
  origins: function(inOrigin, fn){
    var allowOriginSet=new Set([
      'http://koa2:8888',
      'https://koa2:8888',
    ]);
    if(allowOriginSet.has(inOrigin)){
      return fn(null, true);
    }else{
      return fn(null, false);
    }
  },
  allowRequest: function(req, fn){
    var url=require('url');
    var qs=require('querystring');
    //console.log('LINE:57 '+req.url);
    var urlRst=url.parse(req.url);
    var qsRst=qs.parse(urlRst.query, '&', '='); 
    console.log(qsRst);
    if('todd'==qsRst.name){
      fn(403, true);
    }else{
      fn(403, false);
    }
  }
});
//test1Ws.path('/todd');
console.log('path: '+test1Ws.path());
/*
var test1Ws=io(server, {
  path: '/todd'
});
*/
//test1Ws.of('/todd');
//console.log(`test1Ws: ${util.inspect(test1Ws)}`);
var pub=redis({
  host: '127.0.0.1',
  port: 6379,
  password: '1234'
});
var sub=redis({
  host: '127.0.0.1',
  port: 6379,
  password: '1234',
  //这个参数必须带上，允许redis返回buffer类型，因为存的时候会做转码处理
  return_buffers: true,
});
test1Ws.adapter(ioRedis({
  pubClient: pub,
  subClient: sub
}));

test1Ws.use(function(socket, next){
  //console.log('middle ware: cookie:');
  //console.log('cookies: '+util.inspect(socket.handshake.headers.cookie));
  console.log('request.headers: '+util.inspect(socket.request.headers, true, 3, false));
  console.log('request.url: '+socket.request.url);
  //console.log('socket:1:  '+util.inspect(socket, true, 1, false));
  //console.log(util.inspect(socket, true, 10, true));

  next();
});

test1Ws.on('connection', function(socket){
  //console.log(util.inspect(socket), true, 10, true);
  console.log('you have one connection');

  socket.on('cTalk', function(data){
    console.log('cTalk:');
    console.log(socket.id);
    console.log(util.inspect(data, true, 10, true));
    if(data.roomId in socket.rooms){
      test1Ws.to(data.roomId).emit('sTalk', data);
    }else{
      data.msg='You are not in this room, please join this room first.';
      socket.emit('sTalk', data);
    }
    
  });

  socket.on('cLeaveRoom', function(data){
    console.log('cLeaveRoom:');
    console.log(util.inspect(data, true, 10, true));
    
    test1Ws.to(data.roomId).emit('sTalk', {
      name: data.name,
      msg: `leave the room(${data.roomId})`,
    });
    socket.leave(data.roomId);
  });

  socket.on('cMyRoomList', function(data){
    var rooms=socket.rooms;
    console.log(util.inspect(rooms, true, 10, true));
    socket.emit('sMyRoomList', {
      list: rooms,
    });
  });

  socket.on('cJoinRoom', function(data){
    socket.join(data.roomId);
    //console.log(util.inspect(socket));
    console.log('cJoinRoom:');
    console.log(util.inspect(data, true, 10, true));
    var msg=`joins the room(${data.roomId}) serverId:4003`;
    test1Ws.to(data.roomId).emit('sJoinRoom', {
      name: data.name,
      msg: msg 
    });
  });

  socket.on('disconnect', function(){
    console.log('[DISCONNECT]!!!');   
  });

});


server.listen(4003);

















