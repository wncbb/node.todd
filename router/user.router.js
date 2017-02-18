var Koa=require('koa');
var Router=require('koa-router');
var router=new Router();
router.post('/register', async(ctx, next)=>{
    console.log(`ctx.request.body ${ctx.request.body}`);
    //ctx.body=ctx.request.fields;    
    var registerRst=await ctx.u.register({
        account: ctx.request.fields.account,
        password: ctx.request.fields.password,
    });
    if(registerRst.errCode<0){
        ctx.body=registerRst;
        return;
    }
    await ctx.s.destroy();
    var sessionRst=await ctx.s.createUser({
        userId: registerRst.userId,
    });
    if(sessionRst.errCode<0){
        ctx.body=sessionRst;
    }else{
        ctx.body=sessionRst;
        //ctx.response.redirect('/info');
    }
    
});

router.post('/login', async(ctx, next)=>{
    var loginRst=await ctx.u.login({
        account: ctx.request.fields.account,
        password: ctx.request.fields.password,
    });
    console.log(loginRst);
    if(loginRst.errCode<0){
        ctx.body=loginRst;
        return;
    }
    await ctx.s.destroy();
    var sessionRst=await ctx.s.createUser({
        userId: loginRst.userId,
    });
    if(sessionRst.errCode<0){
        ctx.body=sessionRst;
    }else{
        ctx.body=sessionRst;
        //ctx.response.redirect('/info');
    }

});

router.get('/logout', async(ctx, next)=>{
    await ctx.s.destroy();
    await ctx.s.createGuest();
    ctx.body='logout';
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