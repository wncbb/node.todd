var Koa=require('koa');
var Router=require('koa-router');
var router=new Router();

router.get('/', async(ctx, next)=>{
    await ctx.render('codeMirror/index', {
        title: 'code/js',
        v: ctx.v,
        path: '',
    });
});

var koa=new Koa();
koa.use(router.routes());

module.exports=koa;




