var Koa=require('koa');
var Router=require('koa-router');
var marked=require('marked');

var {mid, articleModel:article}=require('../mid/mongo.mid.js');
var app=new Koa();
var router=new Router();

app.use(mid());

router.get('/editor', async(ctx, next)=>{
    await ctx.render('editor/editor', {
        title: 'editor/editor',
    });
});

router.get('/show', async(ctx, next)=>{
    var qryRst=await article.find({_id: ctx.query.id}).exec();
    if(1==qryRst.length){
        await ctx.render('marked/way2', {
            showStr: marked(qryRst[0]['text']),
        });
    }else{
        await ctx.render('marked/way2', {
            showStr: '## NOT FOUND',
        });
    }
});

router.get('/find', async(ctx, next)=>{
  var qry={};
  if(ctx.query.id){
    qry._id=ctx.query.id;
  }
  ctx.body=await article.find(qry).exec();
    
})

router.post('/save', async(ctx, next)=>{
  var tmpArticle=new article({
    title: ctx.request.fields.title,
    text: ctx.request.fields.text,
  });
  var saveRst=await tmpArticle.save();
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
