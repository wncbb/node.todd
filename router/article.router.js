var Koa=require('koa');
var Router=require('koa-router');
var marked=require('marked');
var Article=require('../service/article.srv.js');

//var {mid}=require('../mid/mongo.mid.js');
var app=new Koa();
var router=new Router();
var ArticleCtr=require('../controller/article/article.ctr.js');

//对于未登录用户，以及登录用户但是想要编辑的不是自己的文章，需要做过滤

router.get('/:articleId', async(ctx, next)=>{
  if(undefined==ctx.request.query.ac){
    ctx.request.query.ac='show';
  } 
  switch(ctx.request.query.ac){
    case 'edit':
      break;
    case 'show':
      break;
    default:
      ctx.status=404;
      //ctx.body='NOT FOUND 516';
      ctx.redirect('/404');
      return;
      break;
  }
  var ctrArg={
    userId: ctx.u.userId,
    articleId: ctx.params.articleId,
    acInfo: ctx.request.query,
  };

  var articleCtr=new ArticleCtr({
    srv: new Article({db: ctx.db}),
  });
  var ctrRst=await articleCtr.control(ctrArg);
  if(ctrRst.code<0){
    ctx.body=ctrRst;
    return;
  }
  switch(ctrArg.acInfo.ac){
    case 'edit':
      await ctx.render('editor/editor', {
        title: 'editor',
        v: ctx.v,
        path: '',
        articleInfo: ctrRst.data.articleInfo,
      });
      return;
      break;
    case 'show':
      var canEdit=false;
      if(ctx.u.userId==ctrRst.data.articleInfo.userId){
        canEdit=true;
      }
      await ctx.render('marked/way2', {
        v: ctx.v,
        path: '',
        articleInfo: {
          text: marked(ctrRst.data.articleInfo.text, {
            sanitize: true,
            smartLists: true,
          }),
          title: ctrRst.data.articleInfo.title,
          category: ctrRst.data.articleInfo.category,
        },
        //showStr: marked(htmlSpecialChars(qryRst[0]['text'])),
        canEdit: canEdit,
        articleId: ctrRst.data.articleInfo._id,
      });
      break;
    default:
      ctx.body={
        code: -1,
        msg: 'unknown ac.router.article.46',
      };
      return;
      break;
  }
});

router.post('/:articleId', async(ctx, next)=>{
  if(undefined==ctx.request.query.ac){
    ctx.request.query.ac='show';
  }
  var showAc='findById';
  switch(ctx.request.query.ac){
    case 'findById':
      break;
    case 'edit':
      break;
    case 'show':
      break;
    case 'update':
      break;
    case 'delete':
      break;
    default:
      ctx.status=404;
      //ctx.body='NOT FOUND 516';
      ctx.redirect('/404');
      return;
      break;
  }
  var ctrArg={
    userId: ctx.u.userId,
    articleId: ctx.params.articleId,
    acInfo: ctx.request.fields,
  };

  var articleCtr=new ArticleCtr({
    srv: new Article({db: ctx.db}),
  });
  var ctrRst=await articleCtr.control(ctrArg);
  if(ctrRst.code<0){
    ctx.body=ctrRst;
    return;
  }
  switch(ctrArg.acInfo.ac){
    case 'update':
      ctx.body=ctrRst;
      return;
      break;
    case 'findById':
      ctx.body=ctrRst;
      return;
      break;
    case 'edit':
      await ctx.render('editor/editor', {
        title: 'editor',
        v: ctx.v,
        path: '',
        articleInfo: ctrRst.data.articleInfo,
      });
      return;
      break;
    case 'show':
      await ctx.render('marked/way2', {
        v: ctx.v,
        path: '',
        articleInfo: {
          text: marked(ctrRst.data.articleInfo.text, {
            sanitize: true,
            smartLists: true,
          }),
          title: ctrRst.data.articleInfo.title,
          category: ctrRst.data.articleInfo.category,
        },
        //showStr: marked(htmlSpecialChars(qryRst[0]['text'])),
        canEdit: true,
        articleId: ctrRst.data.articleInfo._id,
      });
      return;
      break;
    case 'delete':
      ctx.body=ctrRst;
      return;
      break;
    default:
      ctx.body={
        code: -1,
        msg: 'unknown ac.router.article.156',
      };
      return;
      break;
  }
});

router.get('/', async(ctx, next)=>{
  var ctrArg={
    userId: ctx.u.userId,
    acInfo: ctx.request.query,
  };

  var articleCtr=new ArticleCtr({
    srv: new Article({db: ctx.db}),
  });
  ctx.body=await articleCtr.control(ctrArg);

});

router.post('/', async(ctx, next)=>{
  var ctrArg={
    userId: ctx.u.userId,
    acInfo: ctx.request.fields,
  };

  var articleCtr=new ArticleCtr({
    srv: new Article({db: ctx.db}),
  });
  ctx.body=await articleCtr.control(ctrArg);

});






app.use(router.routes());

module.exports=app;
