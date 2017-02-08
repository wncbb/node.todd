var Koa=require('koa');
var Router=require('koa-router');
var router=new Router();
router.get('/test/:id', async(ctx, next)=>{
    await ctx.render('bs/test', {
        title: 'bs/test',
        body: ctx.params.id||'no body',
    });
});
router.get('/test', async(ctx, next)=>{
    await ctx.render('bs/test', {
        title: 'bs/test',
        body: 'bs/test',
    });
});
router.get('/index', async(ctx, next)=>{
    await ctx.render('bs/index', {
        title: 'bs/index',
    });
});
router.get('/carousel', async(ctx, next)=>{
    await ctx.render('bs/carousel', {
        title: 'bs/carousel',
    });
});
router.get('/dropdown', async(ctx, next)=>{
    await ctx.render('bs/dropdown', {
        title: 'dropdown',
    });
});
var app=new Koa();
app.use(async(ctx, next)=>{
    console.log('This is bs');
    await next();
});
app.use(router.routes());

module.exports=app;
