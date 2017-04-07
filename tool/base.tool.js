var net=require('net');
var Tool={};
Tool.getCheckPortPromise=(port)=>{
    // 创建服务并监听该端口
    var server = net.createServer().listen(port)
    var checkPortPromise=new Promise((resolve, reject)=>{
        server.on('listening', function () { // 执行这块代码说明端口未被占用
            server.close() // 关闭服务
            resolve({
                code:1,
            });
        })
        server.on('error', function (err){
            if (err.code === 'EADDRINUSE'){ // 端口已经被使用
                reject({
                    code:-1,
                    msg: '端口被占用',
                });
            }
        })
    });
    return checkPortPromise;
}
/*
async function main(){
    var rst=await tool.isPortOccupied(7777);
    console.log(rst);
}
main();
*/

module.exports=Tool;


