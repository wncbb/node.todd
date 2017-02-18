var crypto=require('crypto');
var util=require('util');
class Session{
    constructor(ctx, {
            noAuthTtl  =1*24*60*60,
            authTtl    =100*24*60*60,
            userMaxAge =100*24*60*60,
            guestTtl   =1*24*60*60,
            guestMaxAge=1*24*60*60,
            httpOnly   =true,
            secure     =false,
            path       ='/',
            webKey     ='webS',
        }={}){
        this.ctx=ctx;
        this.config={};
        this.config.noAuthTtl  =noAuthTtl;
        this.config.authTtl    =authTtl;
        this.config.userMaxAge =userMaxAge;
        this.config.guestTtl   =guestTtl;
        this.config.guestMaxAge=guestMaxAge;
        this.config.httpOnly   =httpOnly;
        this.config.secure     =secure;
        this.config.path       =path;
        this.config.webKey     =webKey;

        this.webS='';
        this.webInfo={};
        this.webOp=[];
        
    }

    generate(raw){
        var hash=crypto.createHash('sha256');
        raw.push((new Date()).getTime().toString());
        for(let v of raw){
            hash.update(v.toString());
        }
        return hash.digest('hex');
    }

    async verify(){
        
        var ret={};
        ret.errCode=-1;
        var status='init';
        var reqS=this.ctx.cookies.get(this.config.webKey);
        if(!reqS){
            status='reqNoS';
        }

        var fastRst=await this.ctx.db.init({
            type0: 'fast',
            type1: 'read0',
        });
        if(fastRst.errCode<0){
            ret=fastRst;
            return ret;
        }

        //createTimestamp: seconds
        //updateTimestamp: seconds
        //type: guest|user
        //userId:
        var qryRst=await fastRst.con.hgetall(Session.fastKey.webS+reqS);
        var curTimestamp=(new Date()).getTime()/1000;
        //null
        if(!qryRst || !qryRst['createTimestamp']){
            status='srvNoS';
        }else{
            switch(qryRst['type']){
                case 'user':
                    let authDeadTimestamp=Number.parseFloat(qryRst['createTimestamp'])+this.config.authTtl;
                    if(authDeadTimestamp<curTimestamp){
                        //如果cookie的过期时间等于redis的过期时间，那么这部分代码应该没有机会执行
                        status='needAuthUpdate';
                    }else{
                        let noAuthDeadTimestamp=Number.parseFloat(qryRst['updateTimestamp'])+this.config.noAuthTtl;
                        if(noAuthDeadTimestamp<curTimestamp){
                            status='needNoAuthUpdate';
                        }else{
                            status='right';
                        }
                    }
                    break;
                case 'guest':
                    status='right';
                    break;
            }
        }

        switch(status){
            case 'reqNoS':
            case 'needAuthUpdate':
            case 'srvNoS':
                await this.createGuest();
                //await this.createUser({userId: '10'});
                break;
            case 'needNoAuthUpdate':
                await this.noAuthUpdate({s:reqS, info:qryRst});
                break;
            case 'right':
                this.webS=reqS;
                this.webInfo=qryRst;
                break;
            case 'init':
                await this.createGuest();
                break;
            default:
                await this.createGuest();
                break;
        }
        ret.errCode=1;
        return ret;
    }

    async noAuthUpdate({s, info}={}){
        var ret={};
        ret.errCode=-1;
        var fastRst=await this.ctx.db.init({
            type0: 'fast',
            type1: 'write0',
        });
        if(fastRst.errCode<0){
            ret=fastRst;
            return ret;
        }
        var newWebS=this.generate([this.ctx.request.ip]);
        await fastRst.con.rename(Session.fastKey.webS+s, Session.fastKey.webS+newWebS);
        var curTimestamp=(new Date()).getTime()/1000;
        await fastRst.con.hset(Session.fastKey.webS+newWebS, 'updateTimestamp', curTimestamp);

        info.updateTimestamp=curTimestamp;
        this.webS=newWebS;
        this.webInfo=info;

        //设置cookie
        this.ctx.cookies.set(this.config.webKey, this.webS, {
            httpOnly: this.config.httpOnly,
            secure: this.config.secure,
            maxAge: this.config.userMaxAge*1000,
            path: this.config.path,
        });

        ret.errCode=1;
        return ret;
    }

    async createGuest(){
        var ret={};
        ret.errCode=-1;
        var webS=this.generate([
            this.ctx.request.ip,
        ]);

        var webInfo={};
        var curTimestamp=(new Date()).getTime()/1000;
        webInfo.createTimestamp=curTimestamp;
        webInfo.type='guest';
        var fastKeyTtl=this.config.guestTtl;

        //设置内存
        this.webS=webS;
        this.webInfo=webInfo;

        //设置redis
        var setFastRst=await this.setFast(webInfo, {ttl: fastKeyTtl});
        if(setFastRst.errCode<0){
            ret=setFastRst;
            return ret;
        }

        //设置cookie
        this.ctx.cookies.set(this.config.webKey, this.webS, {
            httpOnly: this.config.httpOnly,
            secure: this.config.secure,
            maxAge: this.config.guestMaxAge*1000,
            path: this.config.path,
        });
        ret.errCode=1;
        ret.webS;
        ret.webInfo;
        return ret;
    }
    async createUser({
        userId=0,
    }={}){
        var ret={};
        ret.errCode=-1;

        if(0==userId){
            ret=await this.createGuest();
            return ret;
        }

        var webS=this.generate([
            this.ctx.request.ip,
        ]);

        var webInfo={};
        var curTimestamp=(new Date()).getTime()/1000;
        webInfo.createTimestamp=curTimestamp;
        webInfo.updateTimestamp=curTimestamp;
        webInfo.type='user';
        webInfo.userId=userId;
        var fastKeyTtl=this.config.authTtl;

        //设置内存
        this.webS=webS;
        this.webInfo=webInfo;

        //设置redis
        var setFastRst=await this.setFast(webInfo, {ttl: fastKeyTtl});
        if(setFastRst.errCode<0){
            ret=setFastRst;
            return ret;
        }

        //设置cookie
        this.ctx.cookies.set(this.config.webKey, this.webS, {
            httpOnly: this.config.httpOnly,
            secure: this.config.secure,
            maxAge: this.config.userMaxAge*1000,
            path: this.config.path,
        });
        ret.errCode=1;
        ret.webS;
        ret.webInfo;
        return ret;
    }

    async destroy(){
        var ret={};
        ret.errCode=-1;
        var fastRst=await this.ctx.db.init({
            type0: 'fast',
            type1: 'write0',
        });
        if(fastRst.errCode<0){
            ret=fastRst;
            return ret;
        }
        console.log('del:'+Session.fastKey['webS']+this.webS);
        await fastRst.con.del(Session.fastKey['webS']+this.webS);
        ret.errCode=1;
        return ret;
    }

    async login({
        userId=0
    }={}){
        var ret={};
        ret.errCode=-1;
        if(0==userId){
            return ret;
        }
        var curTimestamp=(new Date()).getTime()/1000;
        var webInfo={
            userId: userId,
            type: 'user',
            createTimestamp: curTimestamp,
            updateTimestamp: curTimestamp,
        };
        var delRst=await this.destroy();
        if(delRst.errCode<0){
            ret=delRst
            return ret;
        }
        var createRst=await create({
            userId: userId,
        });
        if(createRst.errCode<0){
            ret=createRst;
            return ret;
        }
        ret.errrCode=1;
        return ret;
    }

    async logout(){
        var ret={};
        ret.errCode=-1;
        var delRst=await this.destroy();
        if(delRst.errCode<0){
            ret=delRst;
            return ret;
        }
        ret.errCode=1;
        return ret;
    }


    async delFast(data){
        var ret={};
        ret.errCode=-1;
        var fastRst=await this.ctx.db.init({
            type0: 'fast',
            type1: 'write0',
        });
        if(fastRst.errCode<0){
            ret=fastRst;
            return ret;
        }
        var multi=fastRst.con.multi();
        for(let val of data){
            multi.hdel(Session.fastKey.webS+this.webS, val);
            delete(this.webInfo[val]);
        }
        await multi.exec();
        ret.errCode=1;
        return ret;
    }

    async getFast(){
    }
    
    async setFast(data, {
        ttl=undefined
    }={}){
        var ret={};
        ret.errCode=-1;
        var fastRst=await this.ctx.db.init({
            type0: 'fast',
            type1: 'write0',
        });
        if(fastRst.errCode<0){
            ret=fastRst;
            return ret;
        }

        if(undefined==ttl){
            await fastRst.con.hmset(Session.fastKey.webS+this.webS, data);
        }else{
            await fastRst.con.multi()
                .hmset(Session.fastKey.webS+this.webS, data)
                .expire(Session.fastKey.webS+this.webS, ttl)
                .exec();
        }
        Object.assign(this.webInfo, data);
        ret.errCode=1;
        return ret;
    }


    del(data){
        var ret={};
        ret.errCode=-1;
        for(let val of data){
            delete(this.webInfo[val]);
        }
        this.webOp.push({type:'del', data:data});
        ret.errCode=1;
        return ret;
    }

    set(data){
        var ret={};
        ret.errCode=-1;
        Object.assign(this.webInfo, data);
        this.webOp.push({type:'set', data:data});
        ret.errCode=1;
        return ret;
    }

    get(data){
        var ret={};
        ret.errCode=-1;
        ret.pl={};
        for(let val of data){
            ret.pl[val]=this.webInfo[val];
        }
        ret.errCode=1;
        return ret;
    }

    async updateFast(){
        var ret={};
        ret.errCode=-1;
        
        var fastRst=await this.ctx.db.init({
            type0: 'fast',
            type1: 'write0',
        });
        if(fastRst.errCode<0){
            ret=fastRst;
            return ret;
        }

        var multi=fastRst.con.multi();
        for(let op of this.webOp){
            switch(op.type){
                case 'set':
                    multi.hmset(Session.fastKey.webS+this.webS, op.data);
                    break;
                case 'del':
                    for(let delKey of op.data){
                        multi.hdel(Session.fastKey.webS+this.webS, delKey);
                    }
                    break;
                default:
                    break;
            }
        }
        var tmp=await multi.exec();
        this.webOp=[];
        ret.errCode=1;
        return ret;
    } 

}

Session.fastKey={
    'webS':'s:web:',
};

module.exports=(inArg)=>{
    return async(ctx, next)=>{
        ctx.s=new Session(ctx, inArg);
        var verifyRst=await ctx.s.verify();
        await next();
        await ctx.s.updateFast();
        
    };
}




