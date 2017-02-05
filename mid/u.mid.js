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

    async _saveUserCore2Core({
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
        console.log('qryStr: '+qryStr);
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
        inAccount='',
        inPassword='',
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

        var qryStr=`select id, secret, password from ${User.coreDb.userCore} where account=? limit 1;`;
        var qryRst=await coreRst.con.query(qryStr, [inAccount]);
        console.log('USER.LOGIN: ');
        console.log(util.inspect(qryRst, true, 10, true));
        
        var userCoreInfo=qryRst[0][0];
        var encPassword=this._encPassword({
            password: inPassword,
            secret: userCoreInfo.secret,
        });
        console.log('encPassword: '+encPassword);
        console.log('okkPassword: '+userCoreInfo.password);
        if(encPassword==userCoreInfo.password){
            ret.errCode=1;
            ret.userId=userCoreInfo.id;
            return ret;
        }else{
            ret.errCode=-1;
            ret.errMsg='用户名或密码错误';
            return ret;
        }

    }

    async register({
        account='',
        password='',
        username='',
    }={}){
        //TODO check args       
        var ret={};
        ret.errCode=-1;
 
        var uInfo={};
        uInfo.account=account;
        uInfo.secret=rndm(8);         
        uInfo.password=this._encPassword({
            password: password,
            secret: uInfo.secret,
        });

        var saveCoreRst=await this._saveUserCore2Core(uInfo);
        if(saveCoreRst.errCode<0){
            ret=saveCoreRst;
            return ret;
        }

        uInfo.userId=saveCoreRst.userId;
        var saveFastRst=await this._saveUserInfo2Fast(uInfo);  
        if(saveFastRst.errCode<0){
            ret=saveFastRst;
            return ret;
        }

        ret.errCode=1;
        return ret;
    }

    async _saveUserInfo2Fast(uInfo){
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
        await fastRst.con.hmset(User.fastDb.userInfo+uInfo.userId, uInfo);
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


module.exports=(inArg)=>{
    return async(ctx, next)=>{
        ctx.u=new User(ctx, inArg);
        await next();
    }
}


