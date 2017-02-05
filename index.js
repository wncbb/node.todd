//"use strict";
var Koa=require('koa');
var process=require('process');
var util=require('util');

var path=require('path');

var co=require('co');
var render=require('koa-ejs');

var staticServe=require('koa-static');

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

var Router=require('koa-router');
var router=new Router();
router.get('/register', async(ctx, next)=>{
    if(!ctx.query.account || !ctx.query.username || !ctx.query.password){
        ctx.body='wrong';
        
    }else{
        var rst=await ctx.u.register({
            account: ctx.query.account,
            username: ctx.query.username,
            password: ctx.query.password,
        }); 
        ctx.body=util.inspect(ctx.query);
    }
});
router.get('/logout', async(ctx, next)=>{
    await ctx.u.logout();
    await ctx.s.destroy();
    await ctx.s.createGuest();
    ctx.body='logout';
});
router.get('/login', async(ctx, next)=>{
    if(!ctx.query.account || !ctx.query.password){
        ctx.body='login wrong';
    }else{
        var rst=await ctx.u.login({
            inAccount: ctx.query.account,
            inPassword: ctx.query.password,
        });
        if(1==rst.errCode){
            await ctx.s.destroy();
            await ctx.s.createUser({
                userId: rst.userId,
            });
        }
        ctx.body=rst;
    }
});
router.get('/ejs-test', async(ctx, next)=>{
    await ctx.render('test', {
        title: 'test',
    });
});

app.use(router.routes());

var wsRouter=require('./router/ws.router.js');
app.use(wsRouter.routes());

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
            ctx.body='default';
            break;
    }
})


const port=7777;
app.listen(port, ()=>{
    console.log(`Server is running on ${port}`);
});


