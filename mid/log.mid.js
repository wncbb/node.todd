var log4js=require('log4js');

module.exports=function(inArg){
    return async(ctx, next)=>{
        log4js.configure(inArg);
        ctx.log=log4js;
        await next();
        var testLogger=ctx.log.getLogger('test');
        testLogger.info('this is a test hah ');
    }
}


