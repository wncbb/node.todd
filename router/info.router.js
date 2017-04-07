var Koa=require('koa');
var Router=require('koa-router');
var app=new Koa();
var router=new Router();
router.get('/', async(ctx, next)=>{
    ctx.body={
        u: ctx.u,
        s: ctx.s,
    };
});

app.use(router.routes());

module.exports=app;
