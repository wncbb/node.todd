var Koa=require('koa');
var Router=require('koa-router');
var router=new Router();

router.get('/register', async(ctx, next)=>{
    if(ctx.u.userId>0){
        ctx.redirect('/view/user');
        return;
    }
    await ctx.render('view/register', {
        path: 'view/register',
        title: 'view/register',
        userId: ctx.u.userId,
        v: ctx.v,
    });
});

router.get('/login', async(ctx, next)=>{
    if(ctx.u.userId>0){
        ctx.redirect('/user');
        return;
    }
    await ctx.render('view/login', {
        id: '/login',
        path: 'view/login',
        title: 'view/login',
        userId: ctx.u.userId,
        v: ctx.v,
    });
});

router.get('/user', async(ctx, next)=>{
    var tmp=ctx.moment(ctx.s.sInfo.createTimestamp*1000).format();
    console.log(tmp);
    await ctx.render('view/user', {
        id: '/user.me',
        path: 'view/user',
        title: 'view/user',
        s: ctx.s.s,
        //webInfo: JSON.stringify(ctx.s.webInfo),
        sInfo: {
            createTimestamp: ctx.moment(ctx.s.sInfo.createTimestamp*1000).format(),
            updateTimestamp: ctx.moment(ctx.s.sInfo.updateTimestamp*1000).format(),
            type: ctx.s.sInfo.type,
            userId: ctx.s.sInfo.userId,
        },
        uInfo: {
            account: ctx.u.userInfo.account,
            secret: ctx.u.userInfo.secret,
        },
        userId: ctx.u.userId,
        v: ctx.v,

    });
});

router.get('/', async(ctx, next)=>{
    var Article=require('../service/article.srv.js');  
    console.log('view.router.js:59');
    console.log(ctx.model);
    var articleSrv=new Article({
        db: ctx.db,
    });
    console.log('ip: '+ctx.request.ip);
    var articleList=await articleSrv.all();
    await ctx.render('view/index', {
        id: '/index',
        path: 'view/index',
        title: 'view/index',
        userId: ctx.u.userId,
        v: ctx.v,
        articleList: articleList.data,
    });
});

router.get('/editor', async(ctx, next)=>{
    if(ctx.u.userId && Number.parseInt(ctx.u.userId)<=0){
        console.log(ctx.request.url);
        ctx.body='you must login';
        return;
    }

    var articleInfo={
        id: '',
        title: '',
        text: '',
        category: 'default',

    };
    if(ctx.query.articleId){
        var qryRst=await ctx.model.article.find({_id: ctx.query.articleId}).exec();
        if(1==qryRst.length){
            articleInfo.id=qryRst[0]._id;
            articleInfo.title=qryRst[0].title;
            articleInfo.text=qryRst[0].text;
            articleInfo.category=qryRst[0].category;
        }
    }

    await ctx.render('editor/editor', {
        title: 'editor',
        v: ctx.v,
        path: '',
        articleInfo: articleInfo,
    });
});

router.get('/index', async(ctx, next)=>{
    var Article=require('../service/article.srv.js');  
    var articleSrv=new Article({
        db: ctx.db,
    });
    var articleList=await articleSrv.all();
    await ctx.render('view/index', {
        id: '/index',
        path: 'view/index',
        title: 'view/index',
        userId: ctx.u.userId,
        v: ctx.v,
        articleList: articleList.data,
    });
});

router.get('/404', async(ctx, next)=>{
    ctx.status=404;
    ctx.body='This is 404 page';
});

var app=new Koa();
app.use(async(ctx, next)=>{
    console.log('This is bs');
    await next();
});
app.use(router.routes());

module.exports=app;
