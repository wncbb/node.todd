
module.exports=(inArg)=>{
    return async(ctx, next)=>{
        ctx.v={};
        await next();
    };
};
