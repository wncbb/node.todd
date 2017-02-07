var Router=require('koa-router');
var router=new Router();
router.get('/bs/test/:id', async(ctx, next)=>{
    await ctx.render('bs/test', {
        title: 'bs/test',
        body: ctx.params.id||'no body',
    });
});
router.get('/bs/test', async(ctx, next)=>{
    await ctx.render('bs/test', {
        title: 'bs/test',
        body: 'bs/test',
    });
});
router.get('/bs/index', async(ctx, next)=>{
    await ctx.render('bs/index', {
        title: 'bs/index',
    });
});
router.get('/bs/carousel', async(ctx, next)=>{
    await ctx.render('bs/carousel', {
        title: 'bs/carousel',
    });
});

module.exports=router;
