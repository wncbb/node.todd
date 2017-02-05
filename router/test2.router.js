var Koa=require('koa');
var Router=require('koa-router');
var app=new Koa();
var router=new Router();
router.get('/test', async(ctx, next)=>{
    ctx.body='this is little koa test'
});

app.use(router.routes());

module.exports=app;
