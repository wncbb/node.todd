var Koa=require('koa');
var Router=require('koa-router');
var {mid, articleModel:article}=require('../mid/mongo.mid.js');
var marked=require('marked');

var app=new Koa();
var router=new Router();

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

router.get('/get', async(ctx, next)=>{
    ctx.body=JSON.stringify(ctx.query);
});

router.get('/find', async(ctx, next)=>{
  ctx.body=await article.find().exec();
    
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
    };
  }else{
    ctx.body={
      code: -1,
    };
  }
  
});


app.use(mid());
app.use(router.routes());

module.exports=app;
