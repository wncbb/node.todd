var Koa=require('koa');
var Router=require('koa-router');
var router=new Router();

router.get('/register', async(ctx, next)=>{
    await ctx.render('view/register', {
        title: 'view/register',
    });
});

router.get('/login', async(ctx, next)=>{
    await ctx.render('view/login', {
        title: 'view/login',
    });
});

router.get('/user', async(ctx, next)=>{
    var tmp=ctx.moment(ctx.s.webInfo.createTimestamp*1000).format();
    console.log(tmp);
    await ctx.render('view/user', {
        title: 'view/user',
        webS: ctx.s.webS,
        //webInfo: JSON.stringify(ctx.s.webInfo),
        webInfo: {
            createTimestamp: ctx.moment(ctx.s.webInfo.createTimestamp*1000).format(),
            updateTimestamp: ctx.moment(ctx.s.webInfo.updateTimestamp*1000).format(),
            type: ctx.s.webInfo.type,
            userId: ctx.s.webInfo.userId,
        },
        userInfo: {
            account: ctx.u.userInfo.account,
            secret: ctx.u.userInfo.secret,
        },
    });
});

var app=new Koa();
app.use(async(ctx, next)=>{
    console.log('This is bs');
    await next();
});
app.use(router.routes());

module.exports=app;
