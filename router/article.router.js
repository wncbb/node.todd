var Koa=require('koa');
var Router=require('koa-router');
var marked=require('marked');

var {mid, articleModel:article}=require('../mid/mongo.mid.js');
var app=new Koa();
var router=new Router();

app.use(mid());
app.use(async(ctx, next)=>{
    if(false && !ctx.u.userInfo.account){
        ctx.body='you must login';
        return;
    }
    await next();
});

router.get('/editor', async(ctx, next)=>{
    await ctx.render('editor/editor', {
        title: 'editor/editor',
        v: ctx.v,
        path: '',
    });
});

router.get('/show', async(ctx, next)=>{
    var qryRst=await ctx.model.article.find({_id: ctx.query.id}).exec();
    if(1==qryRst.length){
        await ctx.render('marked/way2', {
            v: ctx.v,
            path: '',
            showStr: marked(qryRst[0]['text']),
        });
    }else{
        await ctx.render('marked/way2', {
            v: ctx.v,
            path: '',
            showStr: '## NOT FOUND',
        });
    }
});

router.get('/find', async(ctx, next)=>{
    var Article=require('../service/article.srv.js');  
    var article=new Article(ctx.model.article);
    if(ctx.query.id && ctx.query.id.match(/[0-9a-z]{24}/)){
        var qry={};
        qry._id=ctx.query.id;
        ctx.body=await article.find(qry);
    }else{
        ctx.body=[];
    }
    
});

router.get('/all', async(ctx, next)=>{
    var Article=require('../service/article.srv.js');  
    var article=new Article(ctx.model.article);
    //ctx.set('Access-Control-Allow-Origin', '');
    ctx.body=await article.all();
    
});

router.get('/list', async(ctx, next)=>{
    var Article=require('../service/article.srv.js');
    var article=new Article(ctx.model.article);
    await ctx.render('article/list', {
        path: 'article/list',
        v: ctx.v,
        list: await article.all(),

    });
});

router.post('/save', async(ctx, next)=>{
    var Article=require('../service/article.srv.js');  
    var article=new Article(ctx.model.article);
    console.log(ctx.request.fields);
    var saveRst=await article.save({
        title: ctx.request.fields.title,
        text: ctx.request.fields.text,
        createTime: new Date(),
    });
    console.log('article.router.js:84 '+saveRst);
    if(saveRst){
        ctx.body={
            code: 1,
            data: saveRst._id,
        };
    }else{
        ctx.body={
            code: -1,
        };
    }
  
});

app.use(router.routes());

module.exports=app;
