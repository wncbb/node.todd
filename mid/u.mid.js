var rndm=require('rndm');
var crypto=require('crypto');
var util=require('util');
var momentTz=require('moment-timezone');

/*
CREATE TABLE `user_core` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `account` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `secret` varchar(10) NOT NULL DEFAULT '000000',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=1 DEFAULT CHARSET=utf8
*/

class User{
    constructor(ctx, {
        userId=-1,
    }={}){
        this.ctx=ctx;
        this.userId=userId;
        this.userInfo={};
    }

    _encPassword({
        password='',
        secret='',
    }={}){
        var hash=crypto.createHash('sha256');
        hash.update(password);
        hash.update(secret);
        return hash.digest('hex');
    }

    async _saveUserCoreInfo2Core({
        account='',
        secret='', 
        password='',
    }={}){
        var ret={};
        ret.code=-1;
        var coreRst=await this.ctx.db.init({
            type0: 'core',
            type1: 'write0',
        });
        if(coreRst.code<0){
            ret=coreRst;
            return ret;
        }

        var qryStr=`insert into ${User.coreDb.userCore}(account, password, secret) values(?, ?, ?);`;
        var qryRst=await coreRst.con.query(qryStr, [
            account,
            password,
            secret,
        ]);
        ret.userId=qryRst[0].insertId;
        ret.code=1;
        return ret;
    }

    async logout(){
        //TODO logout blabla...
    }

    async login({
        account: inAccount='',
        password: inPassword='',
        ip='',
    }={}){
        var ret={};
        ret.code=-1;

        if(''==ip){
            ret.code=-1;
            ret.msg='ipError.mid.u.77';
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
        var ipNumStrictKey='ip:login:'+momentTz().format('YYYY-MM-DDTHH')+':z';
        console.log('ipNumStrictKey: '+ipNumStrictKey);

        var curIpNum=await fastRst.con.zscore(ipNumStrictKey, ip);
        console.log('ip:'+ip+' '+curIpNum);
        if(curIpNum>3){
            ret.code=-1;
            ret.msg='ip登录次数过多.mid.u.94';
            return ret;
        }
        await fastRst.con.zincrby(ipNumStrictKey, 1, ip);

        var accountRst=await this._checkAccount({
            account: inAccount,
            type: 'login',
        });
        if(accountRst.code<0){
            ret=accountRst;
            return ret;
        }

        var coreRst=await this.ctx.db.init({
            type0: 'core',
            type1: 'read0',
        });
        if(coreRst.code<0){
            ret=coreRst;
            return ret;
        }

        var qryStr=`select id, secret, password from ${User.coreDb.userCore} where account=? limit 1;`;
        var qryRst=await coreRst.con.query(qryStr, [inAccount]);
        
        if(1!=qryRst[0].length){
            ret.code=-1;
            ret.msg='账号或密码错误.mid.u.97';
            return ret;
        }
        var userCoreInfo=qryRst[0][0];
        var encPassword=this._encPassword({
            password: inPassword,
            secret: userCoreInfo.secret,
        });
        if(encPassword!=userCoreInfo.password){
            ret.code=-1;
            ret.msg='账号或密码错误.mid.u.107';
            return ret;
        }
        ret.code=1;
        ret.userId=userCoreInfo.id;
        //like load
        this.userId=ret.userId;
        this.userInfo={
            password: inPassword,
            secret: userCoreInfo.secret,
        };
        

        return ret;
    }

    async _checkPassword({
        password='',
    }={}){
        var ret={};
        ret.code=-1;
        if(!/[0-9a-zA-Z]+/.test(password)){
            ret.code=-1;
            ret.msg='密码格式错误.mid.u.129';
            return ret;
        }
        ret.code=1;
        return ret;
    }

    async _checkAccount({
        account='',
        type='register',
    }={}){
        var ret={};
        ret.code=-1;
        console.log('account:'+account);
        if(!/[0-9a-zA-Z\.\@\_\-]+/.test(account)){
            ret.code=-1;
            ret.msg='账号格式错误.mid.u.145';
            return ret;
        }
        switch(type){
            case 'register':
                var coreRst=await this.ctx.db.init({
                    type0: 'core',
                    type1: 'read0',
                });
                if(coreRst.code<0){
                    ret=coreRst;
                    return ret;
                }

                var qryStr=`select count(1) as num from ${User.coreDb.userCore} where account=? limit 1;`;
                var qryRst=await coreRst.con.query(qryStr, [account]);
                if(qryRst[0][0]['num']>0){
                    ret.code=-1;
                    ret.msg='已经存在该账号.mid.u.163';
                }else{
                    ret.code=1;
                }
                break;
            case 'login':
                ret.code=1;
                break;
            default: 
                ret.code=-1;
                ret.msg='账号类型错误.mid.u.173';
                break;
        }

        return ret;
    }

    async register({
        account='',
        password='',
        ip='',
    }={}){
        var ret={};
        ret.code=-1;

        if(''==ip){
            ret.code=-1;
            ret.msg='ipError.mid.u.191';
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

        var ipNumStrictKey='ip:register:'+momentTz().format('YYYY-MM-DDTHH')+':z';
        var curIpNum=await fastRst.con.zscore(ipNumStrictKey, ip);
        if(curIpNum>3){
            ret.code=-1;
            ret.msg='ip注册次数过多.mid.u.209';
            return ret;
        }

        await fastRst.con.zincrby(ipNumStrictKey, 1, ip);

        var checkAccount=await this._checkAccount({
            account: account,
            type: 'register',
        });
        if(checkAccount.code<0){
            ret=checkAccount;
            return ret;
        }
        var checkPassword=this._checkPassword({
            password: password,
        });
        if(checkPassword.code<0){
            ret=checkPassword;
            return ret;
        }



        var uInfo={};
        uInfo.account=account;
        uInfo.secret=rndm(User.secretLength);         
        uInfo.password=this._encPassword({
            password: password,
            secret: uInfo.secret,
        });

        var saveCoreRst=await this._saveUserCoreInfo2Core({
            account: uInfo.account,
            secret: uInfo.secret,
            password: uInfo.password,
        });
        if(saveCoreRst.code<0){
            ret=saveCoreRst;
            return ret;
        }

        uInfo.userId=saveCoreRst.userId;
        var saveFastRst=await this._saveUserInfo2Fast({
            account: uInfo.account,
            secret: uInfo.secret,
            password: uInfo.password,
            userId: uInfo.userId,
        });  
        if(saveFastRst.code<0){
            ret=saveFastRst;
            return ret;
        }

        ret.code=1;
        ret.userId=uInfo.userId;
        return ret;
    }

    async _saveUserInfo2Fast({
        account='',
        secret='',
        userId=-1,
    }={}){
        var ret={};
        ret.code=-1;

        if(-1==userId){
            ret.code=-1;
            ret.msg='用户id错误.mid.u.249';
            return ret;
        }

        var fastRst=await this.ctx.db.init({
            type0: 'fast',
            type1: 'write0',
        });
        if(fastRst.code<0){
            ret=fastRst;
            return ret;
        }
        await fastRst.con.hmset(User.fastDb.userInfo+userId, {
            account: account,
            secret: secret,
        });
        ret.code=1;
        return ret;
    }

    async load({
        userId=-1,
    }={}){
        var ret={};
        ret.code=-1;
        if(-1==userId){
            ret.code=-1;
            ret.msg='load user info error because the userId is -1.mid.u.276';
            return ret;
        }
        var fastRst=await this.ctx.db.init({
            type0: 'fast',
            type1: 'write0',
        });
        if(fastRst.code<0){
            ret=fastRst;
            return ret;
        }
        this.userInfo=await fastRst.con.hgetall(User.fastDb.userInfo+userId);
        if(this.userInfo){
            this.userId=userId;
        }
        ret.code=1;
        return ret;
    }

    echoMe(){
        console.log('This is u.mid.js');
    }

    isLogin(){
        var ret=false;
        if(this.userId>0){
            ret=true;
        }else{
            ret=false;
        }
        return ret;
    }

}

User.coreDb={
    userCore: 'user_core',
};

User.fastDb={
    userInfo: 'u:info:', 
};

User.config={
    secretLength: 8,
};

module.exports=(inArg)=>{
    return async(ctx, next)=>{
        ctx.u=new User(ctx, inArg);
        console.log('u.mid.js:325 '+JSON.stringify(ctx.s.sInfo));
        await ctx.u.load({
            userId: ctx.s.sInfo.userId||-1,
        });
        ctx.v.userId=ctx.u.userId;
        console.log(ctx.u.userInfo);
        await next();
    }
}


