"use strict";
var Koa=require('koa');
var process=require('process');
var util=require('util');

var path=require('path');

var co=require('co');
var render=require('koa-ejs');

var staticServe=require('koa-static');
var mount=require('koa-mount');
//var mount=require('todd-mount');

/*
var init=()=>{
    global.wd=process.cwd();
};
init();
*/

var app=new Koa();

render(app, {
    root: path.join(__dirname, 'view'),
    layout: 'layout',
    viewExt: 'html',
    //cache: false,
    debug: true,
});
app.context.render=co.wrap(app.context.render);

app.use(staticServe(path.join(__dirname, 'staticFile')));
/*
var midTest1=async(ctx, next)=>{
    ctx.cookies.set('name', 'todd');
    await next();
}

var midTest2=(config)=>{
    return async(ctx, next)=>{
        ctx.res.setHeader('name', 'todd');
        await next();
        var fastRst=await ctx.db.init({type0:'fast', type1:'write0'});
        //var rst=await fastRst.con.hgetall('my:h');
        var multi=fastRst.con.multi();
        multi.hmget('my:h', ['name', 'age']);
        multi.get('name');
        var rst=await multi.exec();
        

    };
}
*/

//这里其实就是一个async函数变量，不要执行呦。如果为了传参数，可以执行个函数，这个函数返回一个async函数变量
//app.use(midTest1);
//app.use(midTest2({name:'todd', age:12}));

//获取web配置文件
var config=require('./config/web.json');
//db
var db=require('./mid/db.mid.js');
app.use(db(config.db));

//log
var log=require('./mid/log.mid.js');
app.use(log(config.log.log4js));

//session
var session=require('./mid/s.mid.js');
app.use(session({
//    noAuthTtl: 10,
}));

var user=require('./mid/u.mid.js');
app.use(user());

var testRouter=require('./router/test.router.js');
app.use(testRouter.routes());

/*
//不知道为啥下面两行会出错
var convert=require('koa-convert');
app.use(convert(mount('/mount', testRouter.routes())));
*/

/*
var test2Router=require('./router/test2.router.js');
app.use(mount('/test2', test2Router));
*/


var test3Router=require('./router/test3.router.js');
app.use(test3Router.routes());

app.use(async (ctx, next)=>{
    switch(ctx.request.url){
        case '/cnm':
            var coreRst=await ctx.db.init({type0:'core', type1:'write0'});
            var rst2=await coreRst.con.query("select * from user_core;");
            ctx.body='hello';
            break;
        case '/refer':
            ctx.body='<a href="http://127.0.0.1:7777/">clickMe</a>';
            break;
        case '/':
            //ctx.body="1234";
            ctx.body=ctx.pa+' '+util.inspect(ctx.s.get(['namea']));
            break;
        case '/info':
            ctx.body=JSON.stringify(ctx.s.webInfo);
            break;
        case '/secret':
            var Secret=require('./service/secret.srv.js');
            var secret=new Secret(ctx.db);
            var rst=await secret.create();
            ctx.body=JSON.stringify(rst);
            ctx.body=JSON.stringify(await secret.verify(rst.secret));
            break;
        default:
            ctx.body='The address you are looking for is missing...';
            break;
    }
})


const port=7777;
app.listen(port, ()=>{
    console.log(`Server is running on ${port}`);
});


