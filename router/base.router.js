var Koa=require('koa');
var Router=require('koa-router');
var app=new Koa();
var router=new Router();
router.get('/get', async(ctx, next)=>{
    ctx.body=JSON.stringify(ctx.query);
});
router.post('/post', async(ctx, next)=>{
    ctx.body=JSON.stringify(ctx.request.fields);
});

app.use(router.routes());

module.exports=app;
