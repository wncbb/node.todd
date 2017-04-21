var Koa=require('koa');
var Router=require('koa-router');
var router=new Router();

router.get('/register', async(ctx, next)=>{
    if(ctx.u.userId>0){
        ctx.redirect('/view/user');
        return;
    }
    await ctx.render('view/register', {
        path: 'view/register',
        title: 'view/register',
        userId: ctx.u.userId,
        v: ctx.v,
    });
});

router.get('/login', async(ctx, next)=>{
    if(ctx.u.userId>0){
        ctx.redirect('/view/user');
        return;
    }
    await ctx.render('view/login', {
        path: 'view/login',
        title: 'view/login',
        userId: ctx.u.userId,
        v: ctx.v,
    });
});

router.get('/user', async(ctx, next)=>{
    var tmp=ctx.moment(ctx.s.sInfo.createTimestamp*1000).format();
    console.log(tmp);
    await ctx.render('view/user', {
        path: 'view/user',
        title: 'view/user',
        s: ctx.s.s,
        //webInfo: JSON.stringify(ctx.s.webInfo),
        sInfo: {
            createTimestamp: ctx.moment(ctx.s.sInfo.createTimestamp*1000).format(),
            updateTimestamp: ctx.moment(ctx.s.sInfo.updateTimestamp*1000).format(),
            type: ctx.s.sInfo.type,
            userId: ctx.s.sInfo.userId,
        },
        uInfo: {
            account: ctx.u.userInfo.account,
            secret: ctx.u.userInfo.secret,
        },
        userId: ctx.u.userId,
        v: ctx.v,

    });
});

router.get('/index', async(ctx, next)=>{
    await ctx.render('view/index', {
        path: 'view/index',
        title: 'view/index',
        userId: ctx.u.userId,
        v: ctx.v,
    });
});

var app=new Koa();
app.use(async(ctx, next)=>{
    console.log('This is bs');
    await next();
});
app.use(router.routes());

module.exports=app;
