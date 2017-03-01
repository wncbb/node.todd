var Koa=require('koa');
var Router=require('koa-router');
var router=new Router();

router.get('/room', async(ctx, next)=>{
/*
    var loginRst=await ctx.u.login({
        account: ctx.request.fields.account,
        password: ctx.request.fields.password,
    });
*/
    await ctx.render('ws/room', {
        title: 'ws/room',
        port: 5000,
        ws: true,
    });
});

router.get('/sroom', async(ctx, next)=>{
    await ctx.render('ws/sroom', {
        title: 'ws/sroom',
        port: 5000,
        ws: true,
    });
});

router.get('/user', async(ctx, next)=>{
    await ctx.render('view/user', {
        webS: ctx.s.webS,
    });
});

var app=new Koa();
// app.use(async(ctx, next)=>{
//     console.log('This is bs');
//     await next();
// });
app.use(router.routes());

module.exports=app;
