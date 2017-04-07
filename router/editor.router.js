var Koa=require('koa');
var Router=require('koa-router');
var app=new Koa();
var router=new Router();

//https://github.com/koajs/sendfile
//koa-sendfile
router.get('/download', async(ctx, next)=>{
    var fs=require('fs');
    var stream=fs.createReadStream('./todd.txt');
    ctx.response.attachment('todd.txt'); 
    //stream.pipe(ctx.response);
    ctx.body=stream;
});

//koa-multer
router.get('/upload', async(ctx, next)=>{
    ctx.body='upload'; 
});



router.get('/file', async(ctx, next)=>{
    ctx.response.attachment('a.txt');
    //attachment之后修改response header头是有效的,如果ctx.status=404则下载文件显然失败
    //ctx.response.set('Content-Disposition', 'attachment;filename=FileName.txt');
    //ctx.response.set('Content-Type', 'text/txt; charset=utf-8');
    ctx.body='NOT FOUND ON THIS SERVER';

});

router.get('/', async(ctx, next)=>{
    if(ctx.u.isLogin()){
        await ctx.render('editor/editor', {
            title: 'editor/editor',
        });
    }else{
        //status对应状态码，message对应状态信息
        ctx.status=404;
        ctx.message='ABCD';
        
        ctx.body='NOT FOUND ON THIS SERVER';

        //console.log(ctx.header);
        //ctx.redirect('/info');
    }
});

router.post('/save', async(ctx, next)=>{
    if(ctx.u.isLogin()){
        console.log(ctx.request.fields);
        ctx.body=ctx.request.fields;
    }
});

app.use(router.routes());

module.exports=app;
