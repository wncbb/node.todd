var Koa=require('koa');
var Router=require('koa-router');
var router=new Router();
router.post('/register', async(ctx, next)=>{
    if(ctx.u.isLogin()){
        ctx.body={
            errCode: -1,
            errMsg: '未登录状态才可以注册',
        };
        return;
    }
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
    if(ctx.u.isLogin()){
        ctx.body={
            errCode: -1,
            errMsg: '未登录状态才可以登录',
        };
        return;
    }
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
    if(!ctx.u.isLogin()){
        this.body={
            errCode: -1,
            errMsg: '登录之后才可以退出登录',
        };
        return;
    }
    await ctx.s.destroy();
    await ctx.s.createGuest();
    ctx.response.redirect('/view/index');
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
