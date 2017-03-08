"use strict";
var Koa=require('koa');
var process=require('process');
var util=require('util');

var path=require('path');

var co=require('co');
var render=require('koa-ejs');
//这里用的是koa-better-body来解析POST请求数据,ctx.request.field是post数据
var body=require('koa-better-body');

var staticServe=require('koa-static');
//实验了许多mount中间件，但是只有koa-mounting可以完美兼容koa2
var mount=require('koa-mounting');
var moment=require('moment-timezone');

var convert=require('koa-convert');

/*
var init=()=>{
    global.wd=process.cwd();
};
init();
*/

//获取web配置文件
var config=require('./config/web.json');

var app=new Koa();

render(app, {
    root: path.join(__dirname, 'view'),
    layout: 'layout',
    /*
     *不要layout时需要如下设置
     *layout: '',
     */
    viewExt: 'html',
    //cache: false,
    debug: true,
});
app.context.render=co.wrap(app.context.render);
/*
 *这个是对静态文件直接在这个中间件返回
 *实际中应该用nginx直接返回静态文件
 */
//这个地方不用convert转成es6有报警
app.use(convert(staticServe(path.join(__dirname, 'staticFile'))));

var midTest1=async(ctx, next)=>{
    ctx.moment=moment.tz.setDefault(config.time.zone);
    await next();
}

var errorMid=require('./mid/error.mid.js');
app.use(errorMid());

app.use(midTest1);
/*
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
//这个地方不用convert转成es6有报警
app.use(convert(body()));
//app.use(body());

//db
/*
 *这个是数据库，目前支持redis,mysql
 */
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


/*
var testRouter=require('./router/test.router.js');
app.use(testRouter.routes());
*/



var testRouter=require('./router/test.router.js');
app.use(mount('/mount', testRouter.routes()));

var koaRouter=require('./router/koa.router.js');
app.use(mount('/koa', koaRouter));

var baseRouter=require('./router/base.router.js');
app.use(mount('/base', baseRouter));

var test3Router=require('./router/test3.router.js');
app.use(test3Router.routes());

var bsRouter=require('./router/bs.router.js');
app.use(mount('/bs', bsRouter));

var codeRouter=require('./router/code.router.js');
app.use(mount('/code', codeRouter));

var userRouter=require('./router/user.router.js');
app.use(mount('/user', userRouter));

var viewRouter=require('./router/view.router.js');
app.use(mount('/view', viewRouter));

//这个地方直接挂koa2应用
var wsRouter=require('./router/ws.router.js');
app.use(mount('/ws', wsRouter));

//这里有js注入风险
var markedRouter=require('./router/marked.router.js');
app.use(mount('/marked', markedRouter));


var codeMirrorRouter=require('./router/codeMirror.router.js');
app.use(mount('/code-mirror', codeMirrorRouter));

var editorRouter=require('./router/editor.router.js');
app.use(mount('/editor', editorRouter));

var mongoRouter=require('./router/mongo.router.js');
app.use(mount('/mongo', mongoRouter));

var articleRouter=require('./router/article.router.js');
app.use(mount('/article', articleRouter));

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
            ctx.body={
                webS: ctx.s.webS, 
                webInfo: ctx.s.webInfo,
                //date: moment.tz(ctx.s.webInfo.createTimestamp, 'Asia/Shanghai').format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
                date: moment.tz(1000*ctx.s.webInfo.createTimestamp, config.time.zone).format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
            };
            break;
        case '/secret':
            var Secret=require('./service/secret.srv.js');
            var secret=new Secret(ctx.db);
            var rst=await secret.create();
            ctx.body=JSON.stringify(rst);
            //ctx.body=JSON.stringify(await secret.verify(rst.secret));
            break;
/*
        default:
            //ctx.body='The address you are looking for is missing...';
            ctx.response.redirect('/view/index');
            break;
*/

    }
})

var baseTool=require('./tool/base.tool.js');

var start=(config)=>{
    let checkPortPromise=baseTool.getCheckPortPromise(config.net.port);    
    checkPortPromise.then((success)=>{
        app.listen(config.net.port, ()=>{
            console.log(`Server is running on ${config.net.port}`);
        });
    }).catch(()=>{
        console.log(`[ERROR] Port ${config.net.port} is occupied, please change another port or close the process using this port.`); 
    });
    
}

start(config);


