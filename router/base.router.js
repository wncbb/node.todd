var Koa=require('koa');
var Router=require('koa-router');
var app=new Koa();
var router=new Router();
router.get('/get', async(ctx, next)=>{
    ctx.body=JSON.stringify(ctx.query);
});

app.use(router.routes());

module.exports=app;
