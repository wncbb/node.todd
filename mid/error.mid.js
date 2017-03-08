module.exports=function(inArg){
    return async(ctx, next)=>{
      try{
        await next();
      }catch(err){
        ctx.body='ERROR';
        console.log(err);
      }
      
    };
};