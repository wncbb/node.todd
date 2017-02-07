var Router=require('koa-router');
var router=new Router();
router.get('/test', async(ctx, next)=>{
    ctx.body='this is mount/test';
});

module.exports=router;
