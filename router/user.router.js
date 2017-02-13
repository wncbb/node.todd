var Koa=require('koa');
var Router=require('koa-router');
var router=new Router();
router.get('/register', async(ctx, next)=>{
    var registerRst=await ctx.u.register({
        account: ctx.query['account']||'',
        password: ctx.query['password']||'',
        username: ctx.query['username']||'',
    });
    if(registerRst.errCode<0){
        ctx.body=registerRst;
    }else{
        ctx.body={
            register: 'success',
            data: registerRst,
        };
    }


    
});

router.get('/login', async(ctx, next)=>{
    var loginRst=await ctx.u.login({
        account: ctx.query['account']||'',
        password: ctx.query['password']||'',
    });
    if(loginRst.errCode<0){
        ctx.body=loginRst;
    }
    await ctx.s.destroy();
    var sessionRst=await ctx.s.createUser({
        userId: loginRst.userId,
    });
    if(sessionRst.errCode<0){
        ctx.body=sessionRst;
    }else{
        ctx.body=sessionRst;
    }

});

router.get('/logout', async(ctx, next)=>{
    await ctx.s.destroy();
    await ctx.s.createGuest();
    ctx.body='logout';
});


var app=new Koa();
// app.use(async(ctx, next)=>{
//     console.log('This is bs');
//     await next();
// });
app.use(router.routes());

module.exports=app;
