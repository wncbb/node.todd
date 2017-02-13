var rndm=require('rndm');
var crypto=require('crypto');
var util=require('util');

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
        userId=0,
    }={}){
        this.ctx=ctx;
        this.u=userId;
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
        ret.errCode=-1;
        var coreRst=await this.ctx.db.init({
            type0: 'core',
            type1: 'write0',
        });
        if(coreRst.errCode<0){
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
        ret.errCode=1;
        return ret;
    }

    async logout(){
        //TODO logout blabla...
    }

    async login({
        account: inAccount='',
        password: inPassword='',
    }={}){
        var ret={};
        ret.errCode=-1;

        var accountRst=await this._checkAccount({
            account: inAccount,
            type: 'login',
        });
        if(accountRst.errCode<0){
            ret=accountRst;
            return ret;
        }

        var coreRst=await this.ctx.db.init({
            type0: 'core',
            type1: 'read0',
        });
        if(coreRst.errCode<0){
            ret=coreRst;
            return ret;
        }

        var qryStr=`select id, secret, password from ${User.coreDb.userCore} where account=? limit 1;`;
        var qryRst=await coreRst.con.query(qryStr, [inAccount]);
        
        if(1!=qryRst[0].length){
            ret.errCode=-1;
            ret.errMsg='账号或密码错误1';
            return ret;
        }
        var userCoreInfo=qryRst[0][0];
        var encPassword=this._encPassword({
            password: inPassword,
            secret: userCoreInfo.secret,
        });
        if(encPassword==userCoreInfo.password){
            ret.errCode=1;
            ret.userId=userCoreInfo.id;
        }else{
            ret.errCode=-1;
            ret.errMsg='账号或密码错误2';
        }
        return ret;
    }

    async _checkPassword({
        password='',
    }={}){
        var ret={};
        ret.errCode=-1;
        if(!/[0-9a-zA-Z]+/.test(password)){
            ret.errCode=-1;
            ret.errMsg='密码格式错误';
            return ret;
        }
        ret.errCode=1;
        return ret;
    }

    async _checkAccount({
        account='',
        type='register',
    }={}){
        var ret={};
        ret.errCode=-1;
        if(!/[0-9a-zA-Z\.\@\_\-]+/.test(account)){
            ret.errCode=-1;
            ret.errMsg='账号格式错误';
            return ret;
        }
        switch(type){
            case 'register':
                var coreRst=await this.ctx.db.init({
                    type0: 'core',
                    type1: 'read0',
                });
                if(coreRst.errCode<0){
                    ret=coreRst;
                    return ret;
                }

                var qryStr=`select count(1) as num from ${User.coreDb.userCore} where account=? limit 1;`;
                var qryRst=await coreRst.con.query(qryStr, [account]);
                if(qryRst[0][0]['num']>0){
                    ret.errCode=-1;
                    ret.errMsg='已经存在该账号';
                }else{
                    ret.errCode=1;
                }
                break;
            case 'login':
                ret.errCode=1;
                break;
            default: 
                ret.errCode=-1;
                ret.errMsg='账号类型错误';
                break;
        }

        return ret;
    }

    async register({
        account='',
        password='',
        username='',
    }={}){
        var ret={};
        ret.errCode=-1;

        var checkAccount=await this._checkAccount({
            account: account,
            type: 'register',
        });
        if(checkAccount.errCode<0){
            ret=checkAccount;
            return ret;
        }
        var checkPassword=this._checkPassword({
            password: password,
        });
        if(checkPassword.errCode<0){
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
        if(saveCoreRst.errCode<0){
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
        if(saveFastRst.errCode<0){
            ret=saveFastRst;
            return ret;
        }

        ret.errCode=1;
        return ret;
    }

    async _saveUserInfo2Fast({
        account='',
        secret='',
        userId=-1,
    }={}){
        var ret={};
        ret.errCode=-1;

        if(-1==userId){
            ret.errCode=-1;
            ret.errMsg='用户id错误';
            return ret;
        }

        var fastRst=await this.ctx.db.init({
            type0: 'fast',
            type1: 'write0',
        });
        if(fastRst.errCode<0){
            ret=fastRst;
            return ret;
        }
        await fastRst.con.hmset(User.fastDb.userInfo+userId, {
            account: account,
            secret: secret,
        });
        ret.errCode=1;
        return ret;
    }

    echoMe(){
        console.log('This is u.mid.js');
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
        await next();
    }
}


