var Koa=require('koa');
var Router=require('koa-router');
var app=new Koa();
var router=new Router();
router.get('/', async(ctx, next)=>{
    await ctx.render('editor/editor', {
        title: 'editor/editor',
    });
});

router.post('/save', async(ctx, next)=>{
    console.log(ctx.request.fields);
    ctx.body=ctx.request.fields;
});

app.use(router.routes());

module.exports=app;
