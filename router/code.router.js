var Koa=require('koa');
var Router=require('koa-router');
var router=new Router();

router.get('/js', async(ctx, next)=>{
    await ctx.render('code/js', {
        title: 'code/js',
    });
});

var koa=new Koa();
koa.use(router.routes());

module.exports=koa;


