var crypto=require('crypto');
var util=require('util');
class Session{
    constructor(ctx, {
            //session在noAuthTtl之后自动更新，但不需要登录验证
            noAuthTtl  =1*24*60*60,
            //session在authTtl之后过期作废，需要重新登录(服务器这边判断)
            authTtl    =100*24*60*60,
            //在cookie中设置的cookie过期时间
            userMaxAge =100*24*60*60,
            //如果未登录用户，session服务器这边guestTtl之后过期
            guestTtl   =1*24*60*60,
            //如果未登录用户，cookie的过期时间
            guestMaxAge=1*24*60*60,
            //该属性使得js代码无法读取cookie
            httpOnly   =true,
            //只能在HTTPS连接中被浏览器传递到服务器端进行会话验证(HTTP协议不会传递该参数)
            secure     =false,
            path       ='/',
            sCookieName ='wncbb_ms',
            signatureKey='signatureKey',
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
        this.config.sCookieName     =sCookieName;
        this.config.signatureKey=signatureKey;

        this.s='';
        this.sInfo={};
        this.sOp=[];

        
    }


    createSignature({
        rawData='',
        key=this.config.signatureKey,
        algo='sha256',
    }={}){
        switch(algo){
            case 'sha256':
                break;
            case 'md5':
                break;
            default:
                algo='sha256';
                break;
        }
        var hash=crypto.createHash(algo);
        hash.update(rawData+key);
        var ret=hash.digest('hex');
        return ret;
    }
    verifySignature({
        rawData='',
        inSignature='',
        key=this.config.signatureKey,
        algo='sha256',
    }={}){
        switch(algo){
            case 'sha256':
                break;
            case 'md5':
                break;
            default:
                algo='sha256';
                break;
      }
      var hash=crypto.createHash(algo);
      hash.update(rawData+key);
      var rightSignature=hash.digest('hex');
      var ret=false;
      if(inSignature==rightSignature){
        ret=true;
      }
      return ret;
    }

    generateS({
        rawData=[],
        algo='sha256',
    }={}){
        var hash=crypto.createHash(algo);
        rawData.push((new Date()).getTime().toString());
        for(let v of rawData){
            hash.update(v.toString());
        }
        return hash.digest('hex');
    }
//531570f9ef90d8d9088dd5592c86312246c8cd949aea328917989cf9120551f6
    getRequestS(){
        var ret='';
        var requestSCookie=this.ctx.cookies.get(this.config.sCookieName);
        if(!requestSCookie){
            ret='';
            return ret;
        }
        var requestSCookieInfo=requestSCookie.split('-');
        if(requestSCookieInfo.length!=2){
            ret='';
            return ret;
        }
        var verifySignatureRst=this.verifySignature({
            rawData: requestSCookieInfo[0],
            inSignature: requestSCookieInfo[1],
        });
        if(!verifySignatureRst){
            //TODO: 这种可能是有人估计攻击
            ret='';
            return ret;
        }
        ret=requestSCookieInfo[0];
        return ret;
    }
    setResponseSCookie({
        rawData='',
        cookieConfig={},
    }={}){
        var sSignature=this.createSignature({
            rawData: this.s,
        });
        this.ctx.cookies.set(this.config.sCookieName, this.s+'-'+sSignature, cookieConfig);
    }

    async getRequestSStatus(){
        var ret={};
        ret.errCode=1;
        var requestS=this.getRequestS();
        if(!requestS){
            ret.errCode=1;
            ret.status='requestNoS';
            return ret;
        }
        var fastRst=await this.ctx.db.init({
            type0: 'fast',
            type1: 'read0',
        });
        if(fastRst.code<0){
            ret=fastRst;
            return ret;
        }

        //createTimestamp: seconds
        //updateTimestamp: seconds
        //type: guest|user
        //userId:
        var qryRst=await fastRst.con.hgetall(Session.fastKey.s+requestS);
        var curTimestamp=(new Date()).getTime()/1000;
        //null
        ret.qryRst=qryRst;
        ret.s=requestS;

        if(!qryRst || !qryRst['createTimestamp']){
            ret.errCode=1;
            ret.status='serverNoS';
            return ret;
        }else{
            switch(qryRst['type']){
                case 'user':
                    let authDeadTimestamp=Number.parseFloat(qryRst['createTimestamp'])+this.config.authTtl;
                    if(authDeadTimestamp<curTimestamp){
                        //如果cookie的过期时间等于redis的过期时间，那么这部分代码应该没有机会执行
                        ret.status='needAuthUpdate';
                    }else{
                        let noAuthDeadTimestamp=Number.parseFloat(qryRst['updateTimestamp'])+this.config.noAuthTtl;
                        if(noAuthDeadTimestamp<curTimestamp){
                            ret.status='needNoAuthUpdate';
                        }else{
                            ret.status='right';
                        }
                    }
                    break;
                case 'guest':
                    ret.status='right';
                    break;
            }
        }
        //console.log('s.mid.js:187 '+JSON.stringify(ret));
        return ret;
    }

    async verify(){
        
        var ret={};
        ret.code=-1;
        var statusRst=await this.getRequestSStatus();
        if(statusRst.errCode<0){
            ret=statusRst;
            return ret;
        }
        switch(statusRst.status){
            case 'requestNoS':
            case 'needAuthUpdate':
            case 'serverNoS':
                await this.createGuest();
                break;
            case 'needNoAuthUpdate':
                await this.noAuthUpdate({s:statusRst.s, info:statusRst.qryRst});
                break;
            case 'right':
                this.s=statusRst.s;
                this.sInfo=statusRst.qryRst;
                break;
            case 'init':
                await this.createGuest();
                break;
            default:
                await this.createGuest();
                break;
        }
        ret.code=1;
        return ret;
    }

    async noAuthUpdate({s, info}={}){
        var ret={};
        ret.code=-1;
        var fastRst=await this.ctx.db.init({
            type0: 'fast',
            type1: 'write0',
        });
        if(fastRst.code<0){
            ret=fastRst;
            return ret;
        }
        var newS=this.generateS([this.ctx.request.ip]);
        await fastRst.con.rename(Session.fastKey.s+s, Session.fastKey.s+newS);
        var curTimestamp=(new Date()).getTime()/1000;
        await fastRst.con.hset(Session.fastKey.s+newS, 'updateTimestamp', curTimestamp);

        info.updateTimestamp=curTimestamp;
        this.s=newS;
        this.sInfo=info;

        //设置cookie
        // this.ctx.cookies.set(this.config.webKey, this.webS, {
        //     httpOnly: this.config.httpOnly,
        //     secure: this.config.secure,
        //     maxAge: this.config.userMaxAge*1000,
        //     path: this.config.path,
        // });
        this.setResponseSCookie({
            cookieConfig: {
                httpOnly: this.config.httpOnly,
                secure: this.config.secure,
                maxAge: this.config.userMaxAge*1000,
                path: this.config.path,
            }  
        });

        ret.code=1;
        return ret;
    }

    async createGuest(){
        var ret={};
        ret.code=-1;
        var s=this.generateS([
            this.ctx.request.ip,
        ]);

        var sInfo={};
        var curTimestamp=(new Date()).getTime()/1000;
        sInfo.createTimestamp=curTimestamp;
        sInfo.type='guest';
        var fastKeyTtl=this.config.guestTtl;

        //设置内存
        this.s=s;
        this.sInfo=sInfo;

        //设置redis
        var setFastRst=await this.setFast(sInfo, {ttl: fastKeyTtl});
        if(setFastRst.code<0){
            ret=setFastRst;
            return ret;
        }

        //设置cookie
        // this.ctx.cookies.set(this.config.webKey, this.webS, {
        //     httpOnly: this.config.httpOnly,
        //     secure: this.config.secure,
        //     maxAge: this.config.guestMaxAge*1000,
        //     path: this.config.path,
        // });
        this.setResponseSCookie({
            cookieConfig: {
                httpOnly: this.config.httpOnly,
                secure: this.config.secure,
                maxAge: this.config.guestMaxAge*1000,
                path: this.config.path,
            },
        });
        ret.code=1;
        ret.s=s;
        ret.sInfo=sInfo;
        return ret;
    }
    async createUser({
        userId=0,
    }={}){
        var ret={};
        ret.code=-1;

        if(0==userId){
            ret=await this.createGuest();
            return ret;
        }

        var s=this.generateS([
            this.ctx.request.ip,
        ]);

        var sInfo={};
        var curTimestamp=(new Date()).getTime()/1000;
        sInfo.createTimestamp=curTimestamp;
        sInfo.updateTimestamp=curTimestamp;
        sInfo.type='user';
        sInfo.userId=userId;
        var fastKeyTtl=this.config.authTtl;

        //设置内存
        this.s=s;
        this.sInfo=sInfo;

        //设置redis
        var setFastRst=await this.setFast(sInfo, {ttl: fastKeyTtl});
        if(setFastRst.code<0){
            ret=setFastRst;
            return ret;
        }

        //设置cookie
        // this.ctx.cookies.set(this.config.webKey, this.webS, {
        //     httpOnly: this.config.httpOnly,
        //     secure: this.config.secure,
        //     maxAge: this.config.userMaxAge*1000,
        //     path: this.config.path,
        // });
        this.setResponseSCookie({
            cookieConfig: {
                httpOnly: this.config.httpOnly,
                secure: this.config.secure,
                maxAge: this.config.userMaxAge*1000,
                path: this.config.path,
            },
        });
        ret.code=1;
        ret.s=s;
        ret.sInfo=sInfo;
        return ret;
    }

    async destroy(){
        var ret={};
        ret.code=-1;
        var fastRst=await this.ctx.db.init({
            type0: 'fast',
            type1: 'write0',
        });
        if(fastRst.code<0){
            ret=fastRst;
            return ret;
        }
        console.log('del:'+Session.fastKey.s+this.s);
        await fastRst.con.del(Session.fastKey.s+this.s);
        ret.code=1;
        return ret;
    }

    async login({
        userId=0
    }={}){
        console.log('login: '+userId);
        var ret={};
        ret.code=-1;
        if(0==userId){
            return ret;
        }
        var curTimestamp=(new Date()).getTime()/1000;
        var sInfo={
            userId: userId,
            type: 'user',
            createTimestamp: curTimestamp,
            updateTimestamp: curTimestamp,
        };
        var delRst=await this.destroy();
        if(delRst.code<0){
            ret=delRst
            return ret;
        }
        var createRst=await this.createUser({
            userId: userId,
        });
        if(createRst.code<0){
            ret=createRst;
            return ret;
        }
        ret.errrCode=1;
        return ret;
    }

    async logout(){
        var ret={};
        ret.code=-1;
        var delRst=await this.destroy();
        if(delRst.code<0){
            ret=delRst;
            return ret;
        }
        ret.code=1;
        return ret;
    }


    async delFast(data){
        var ret={};
        ret.code=-1;
        var fastRst=await this.ctx.db.init({
            type0: 'fast',
            type1: 'write0',
        });
        if(fastRst.code<0){
            ret=fastRst;
            return ret;
        }
        var multi=fastRst.con.multi();
        for(let val of data){
            multi.hdel(Session.fastKey.s+this.s, val);
            delete(this.sInfo[val]);
        }
        await multi.exec();
        ret.code=1;
        return ret;
    }

    async getFast(){
    }
    
    async setFast(data, {
        ttl=undefined
    }={}){
        var ret={};
        ret.code=-1;
        var fastRst=await this.ctx.db.init({
            type0: 'fast',
            type1: 'write0',
        });
        if(fastRst.code<0){
            ret=fastRst;
            return ret;
        }

        if(undefined==ttl){
            await fastRst.con.hmset(Session.fastKey.s+this.s, data);
        }else{
            await fastRst.con.multi()
                .hmset(Session.fastKey.s+this.s, data)
                .expire(Session.fastKey.s+this.s, ttl)
                .exec();
        }
        Object.assign(this.sInfo, data);
        ret.code=1;
        return ret;
    }


    del(data){
        var ret={};
        ret.code=-1;
        for(let val of data){
            delete(this.sInfo[val]);
        }
        this.sOp.push({type:'del', data:data});
        ret.code=1;
        return ret;
    }

    set(data){
        var ret={};
        ret.code=-1;
        Object.assign(this.sInfo, data);
        this.sOp.push({type:'set', data:data});
        ret.code=1;
        return ret;
    }

    get(data){
        var ret={};
        ret.code=-1;
        ret.pl={};
        for(let val of data){
            ret.pl[val]=this.sInfo[val];
        }
        ret.code=1;
        return ret;
    }

    async updateFast(){
        var ret={};
        ret.code=-1;
        
        var fastRst=await this.ctx.db.init({
            type0: 'fast',
            type1: 'write0',
        });
        if(fastRst.code<0){
            ret=fastRst;
            return ret;
        }

        var multi=fastRst.con.multi();
        for(let op of this.sOp){
            switch(op.type){
                case 'set':
                    multi.hmset(Session.fastKey.s+this.s, op.data);
                    break;
                case 'del':
                    for(let delKey of op.data){
                        multi.hdel(Session.fastKey.s+this.s, delKey);
                    }
                    break;
                default:
                    break;
            }
        }
        var tmp=await multi.exec();
        this.sOp=[];
        ret.code=1;
        return ret;
    } 

}

Session.fastKey={
    's':'s:',
};

module.exports=(inArg)=>{
    return async(ctx, next)=>{
        ctx.s=new Session(ctx, inArg);
        var verifyRst=await ctx.s.verify();
        await next();
        await ctx.s.updateFast();
        
    };
}




