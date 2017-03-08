var Koa=require('koa');
var Router=require('koa-router');
var marked=require('marked');
var app=new Koa();
var router=new Router();
router.get('/', async(ctx, next)=>{
    //ctx.body=marked('#hello **world** ```hello```');
    await ctx.render('marked/index', {
    });
});
router.get('/way2', async(ctx, next)=>{
    //ctx.body=marked('#hello **world** ```hello```');
    var fs=require('fs');
    
    await ctx.render('marked/way2', {
        showStr: marked(fs.readFileSync('md/docker.md','utf-8')),
    });
});


app.use(router.routes());

module.exports=app;
