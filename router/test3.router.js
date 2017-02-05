var Router=require('koa-router');
var router=new Router();
router.get('/test3/test/test', async(ctx, next)=>{
    ctx.body='this is /test3/test/test';
});

module.exports=router;
