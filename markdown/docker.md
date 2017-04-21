# docker

## -3 memcacheq
docker run -d -p 22201:22201 --name memcacheq -v `pwd`/data:/home/mcq-data wupeng/memcacheq:latest



## -2 启动已经停止的容器

> `docker start <container>`

> 查看数据库 存储位置:<br>
> <pre>mysql> show variables like 'datadir%';
+---------------+------------------------+
| Variable_name | Value                  |
+---------------+------------------------+
| datadir       | /usr/local/mysql/data/ |
+---------------+------------------------+
1 row in set (0.01 sec)<pre>





## -1 直播间本地模拟环境

> mlgb的mysql 5.5 跟5.7 的主从设置不太一样！！！！！！！！

### 1 把线上数据库全放到一个容器里了，没有主从

* 目录: /Users/todd/docker.project/mysql/mysql5.5

* container名字: cblive_local

* 



```bash
cd /Users/todd/docker.project/mysql/mysql5.5

docker run --name cblive_local -p 3307:3306 -v `pwd`/data:/usr/local/mysql/data -v `pwd`/mysql:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=1234 -d mysql:5.5

```

### 2 主从

```bash
docker run --name cblive_write -p 10001:3306 -v `pwd`/data:/usr/local/mysql/data -v `pwd`/cnf/write.cnf:/etc/mysql/my.cnf -v `pwd`/write_db:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=1234 -d mysql:5.5

docker run --name cblive_read -p 10002:3306  -v `pwd`/data:/usr/local/mysql/data -v `pwd`/cnf/read.cnf:/etc/mysql/my.cnf -v `pwd`/read_db:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=4321 -d mysql:5.5

```

```bash
master:
insert into mysql.user(Host,User,Password) values('192.168.%.%','slave0',password('slave123')); 
insert into mysql.user(Host,User,Password) values('%','slave0',password('slave123')); 
GRANT REPLICATION SLAVE,FILE ON *.* TO 'slave0'@'%' IDENTIFIED BY 'slave123';
flush privileges;
flush logs;
show master status;

slave:
stop slave;
change master to master_host='192.168.12.119', master_port=10001, master_user='slave0', master_password='slave123', master_log_file='mysql-bin.000005', master_log_pos=107;
start slave;
show slave status\G;

```

### 3

> cd /Users/todd/docker.project/redis/cblive/main.redis/

```baseh
cd /Users/todd/docker.project/redis/cblive/main.redis
docker run --name cblive_redis -p 6380:6379 -v `pwd`/data:/data -v `pwd`/redis.conf:/home/redis.conf -d redis:latest redis-server /home/redis.conf

```



## 0

 docker login daocloud.io
 wncbbnk
 daocloud6232072
 
 

```bash
#container 相关操作
docker ps #列出所有运行中的container
docker ps -a #列出所有container
docker stop <container name>  #停止某一个运行中的container
docker start <container name>  #启动某一个container
docker rm <container name>  #删除某个container

#images 相关操作
docker images  #列出所有images

#Dockerfile相关操作
mkdir project-xxx
cd project-xxx
touch Dockerfile
cat Dockerfile
#This is a comment 注释用#
#编写完Dockerfile后可以使用docker build来创建image
#比如说: sudo docker build -t="ouruser/sinatra:v2" .
# . 是Dockerfile所在路径
# -t 用来添加tag
# ADD 命令复制本地文件到镜像 ADD ./ /home 之类的
# EXPOSE 命令向外部开放端口
# CMD 描述容器启动后运行的程序
FROM ubuntu:14.04 #使用哪个镜像作为基础
MAINTAINER Docker Newbee <user@xxx.com> 
RUN apt-get -qq update #执行命令
RUN apt-get -qqy install ruby ruby-dev
RUN gem install sinatra




```

## 1 本地

```bash
cd /Users/todd/docker.project/nginx
docker run -v `pwd`/conf/:/etc/nginx/ -v `pwd`/logs/:/var/log/nginx/ -it -p 5000:8080 ngi
nx:1.11.4

```


## 2

dorcker run -it debian /bin/bash

apt-get update
apt-get install vim ...

exit

docker ps  #查看运行着的container

docker ps -a  #查看所有的container

docker rm  #删除container

docker rmi  #删除image

docker rm `docker ps -a -q`  #删除所有容器

docker commit 23daf new-name  #保存某个container为image

##debian
/etc/apt/sources.list

##koa

```bash
cd /Users/todd/docker.project/nodejs/koa1
docker run -it -p 5000:3000 -v `pwd`/:/home/ 972 node /home/index.js
```

```bash
cd /Users/todd/docker.project/nodejs/koa1
cat Dockerfile
  1                                                                                                                            
  2 
  3 FROM tagplus5/nodejs
  4 WORKDIR /home
  5 ADD ./index.js /home/
  6 ADD ./package.json /home/
  7 RUN cd /home/
  8 RUN npm install
  9 CMD ["node", "/home/index.js"]
  
cat Dockerfile
  1                                                                                                                            
  2 
  3 FROM tagplus5/nodejs
  4 WORKDIR /home
  5 ADD . /home/
  6 CMD ["node", "/home/index.js"]


  
docker build -t="todd/nodejs6:test" .
docker images
docker run -it -p 5000:3000 todd/nodejs6:test

```


## 容器转出到镜像
```bash
docker export 99e2a > tmp.tar
docker import tmp.tar todd/delete:v1
docker images
```

## mysql

```bash
docker run --name mysql2 -e MYSQL_ROOT_PASSWORD= -d -it -p 4306:3306 daocloud.io/library/m
ysql

```

```bash
docker run -p 3306:3306  -e MYSQL_ROOT_PASSWORD=my-secret-pw -d mysql:latest
mysql -u root -p -h 127.0.0.1 -P3306 
my-secret-pw
```

麻蛋的my.cnf注释是#########！！！！！！！！

### 主从





## web and mysql

```javascript
cd /Users/todd/docker.project/nodejs/koa1

# --name 设置名字，在web container中可以从env中根据这个名字获取db container的ip与端口。
# -p 端口映射，将宿主机所有ip的tcp的5000端口与db container的3306端口做映射，如果不需要从宿主机登录db container的mysql服务，可以不设置此项
# -v 目录映射，将宿主机的/Users/todd/docker.project/mysql/mysql_data目录映射到db container的/var/lib/mysql上，是数据库的存储目录
# -e MYSQL_ROOT_PASSWORD=1234 设置db container的root用户密码为1234
# -d 以daemon运行
docker run --name mysql1 -p 3306:3306 -v /Users/todd/docker.project/mysql/mysql_data:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=1234 -d mysql:latest

# -p 端口映射，把宿主机所有ip的tcp的5000端口映射到web container的3000端口，  比如 127.0.0.1:5000:3000/tcp
# -v volums映射，把宿主机的`pwd`当前目录映射到web container的/home/目录
# --link name:alias 把name是mysql1的container与web container做连接，使得web container可以通过env获取db container的ip:port，不必暴露给宿主机
# 972e 装有nodejs v6的image
# node /home/index.js 启动容器后执行的命令
docker run -it -p 5000:3000 -v `pwd`/:/home/ --link mysql1:mysql1 972fe node /home/index.js
Runing at port:3000
```


## ip查看
docker inspect --format '{{.NetworkSettings.IPAddress}}'    &lt;container name&gt;

## redis 普通设置

教程: [http://www.cnblogs.com/siqi/p/4245821.html](http://www.cnblogs.com/siqi/p/4245821.html)

```bash
cd /Users/todd/docker.project/redis/redis1
```

```bash
cat redis.conf
requirepass 1234  
```

```bash
cat Dockerfile
FROM redis:latest
ADD ./redis.conf /home/redis.conf
CMD [ "redis-server", "/home/redis.conf" ]
```

```bash
docker run -d -p 8000:6379 todd/redis:v4
```

```bash
redis-cli -p 8000 #p端口，mysql用P表示端口，因为p被用来表示password
```

在docker中，redis.conf不能加daemonize yes !!!!!!!!!!!!!，用docker的-d选项就可以了

### 默认rdb模式

默认二进制数据写在dump.rdb中。

redis-cli登录后，调用sava或者bgsave，把内存数据更新到硬盘

#### 部分参数意义

```bash
save 900 1    # after 900sec(15min) if at least one key changed
save 300 10   # after 300sec( 5min) if at least 10 keys changed
save 60 10000 # after  60sec( 1min) if at least 10000 keys changed

dir ./ #the dir data will be saved in
```





#### 工作原理

Redis forks.
子进程开始将数据写到临时RDB文件中。
当子进程完成写RDB文件，用新文件替换老文件。
这种方式可以使Redis使用copy-on-write技术。

### aof模式开启 APPEND ONLY MODE（AOF）

在redis.conf中添加一下:

```
appendonly yes
appendfilename "aof.aof"
```

| 选项 | 值 | 意义 |
|:---:|:----:|:----:|
|appendfsync| no | 当设置appendfsync为no的时候，Redis不会主动调用fsync去将AOF日志内容同步到磁盘，所以这一切就完全依赖于操作系统的调试了。对大多数Linux操作系统，是每30秒进行一次fsync，将缓冲区中的数据写到磁盘上。|
|appendfsync| everysec | 当设置appendfsync为everysec的时候，Redis会默认每隔一秒进行一次fsync调用，将缓冲区中的数据写到磁盘。但是当这一 次的fsync调用时长超过1秒时。Redis会采取延迟fsync的策略，再等一秒钟。也就是在两秒后再进行fsync，这一次的fsync就不管会执行多长时间都会进行。这时候由于在fsync时文件描述符会被阻塞，所以当前的写操作就会阻塞。所以，结论就是：在绝大多数情况下，Redis会每隔一秒进行一次fsync。在最坏的情况下，两秒钟会进行一次fsync操作。这一操作在大多数数据库系统中被称为group commit，就是组合多次写操作的数据，一次性将日志写到磁盘。 |
|appendfsync| always | 当设置appendfsync为always时，每一次写操作都会调用一次fsync，这时数据是最安全的，当然，由于每次都会执行fsync，所以其性能也会受到影响.建议采用 appendfsync everysec（缺省方式）快照模式可以和AOF模式同时开启，互补影响 |

aof日志重写BGREWRITEAOF

### 数据恢复

如果只配置AOF,重启时加载AOF文件恢复数据；

如果同时 配置了RBD和AOF,启动是只加载AOF文件恢复数据;

如果只配置RBD,启动是讲加载dump文件恢复数据。

### 写数据流程

* 客户端向服务端发送写操作（数据在客户端的内存中）。

* 数据库服务端接收到写请求的数据（数据在服务端的内存中）。

* 服务端调用write这个系统调用，将数据往磁盘上写（数据在系统内存的缓冲区中）。

* 操作系统将缓冲区中的数据转移到磁盘控制器上（数据在磁盘缓存中）。

* 磁盘控制器将数据写到磁盘的物理介质中（数据真正落到磁盘上）。







## mysql docker 主从设置
```bash
cd /Users/todd/docker.project/mysql
```

### 注意

!!!!!my.cnf等配置文件的注释是#######

### 主库my.cnf

从https://my.oschina.net/u/730579/blog/632790看到加一下三行：

```
server-id=1
#log-bin=master-bin #可有可无，有的话下面需要修改相应的参数
log-bin-index=master-bin.index 
```

然后如果加log-bin=master-bin，就是给二进制日志加了个名字，默认是mysql-bin，那么从库在change master命令中，需要相应地修改master_log_file。

```bash
cat write0.cnf
!includedir /etc/mysql/conf.d/
!includedir /etc/mysql/mysql.conf.d/
[mysqld]
log-bin=mysql-bin   #[必须]启用二进制日志
server-id=1001     #[必须]服务器唯一ID，默认是1，一般取IP最后一段
```

### 从库 my.cnf

```php
cat read0.cnf
!includedir /etc/mysql/conf.d/
!includedir /etc/mysql/mysql.conf.d/
[mysqld]
log-bin=mysql-bin   #[必须]启用二进制日志
server-id=2001     #[必须]服务器唯一ID，默认是1，一般取IP最后一段
```

### 启动docker主从mysql

```bash
docker run --name core_write0 -p 10001:3306 -v `pwd`/write0.cnf:/etc/mysql/my.cnf -v `pwd`/write0_data:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=1234 -d mysql:latest

docker run --name core_read0  -p 10002:3306 -v `pwd`/read0.cnf:/etc/mysql/my.cnf -v  `pwd`/read0_data:/var/lib/mysql  -e MYSQL_ROOT_PASSWORD=1234 -d mysql:latest
```

### 执行mysql命令

#### on master:

```sql
GRANT REPLICATION SLAVE,FILE ON *.* TO 'slave'@'172.17.%.%' IDENTIFIED BY '123456';
show master status
+------------------+----------+--------------+------------------+-------------------+
| File             | Position | Binlog_Do_DB | Binlog_Ignore_DB | Executed_Gtid_Set |
+------------------+----------+--------------+------------------+-------------------+
| mysql-bin.000003 |      446 |              |                  |                   |
+------------------+----------+--------------+------------------+-------------------+
1 row in set (0.00 sec)
```

这个地方grant实践证明得写docker容器自己的ip, 而不是宿主机的ip, 当然可以把这两个网段都允许。

#### on slave

要注意，这里的master\_log\_file与master\_log\_pos的值，要根据在master上的show master status信息填写。

如果出现错误

```sql
change master to master_host='192.168.14.97', master_port=10001, master_user='slave', master_password='123456', master_log_file='mysql-bin.000003', master_log_pos=446; 

start slave; #开启slave

show slave status\G; #查看slave状态
#这俩必须都是yes
#Slave_IO_Running: Yes
#Slave_SQL_Running: Yes
#如果有一个不是，说明有错误，看
#Last_IO_Errno: 0
#Last_IO_Error: 
#Last_SQL_Errno: 0
#Last_SQL_Error: 


stop slave; #停止slave复制操作

reset slave; #重置slave参数

change master to master_host='192.168.14.97', master_port=10001, master_user='slave', master_password='123456', master_log_file='mysql-bin.000005', master_log_pos=154; 

start slave; #再开启slave


```

如果出现错误，通常先slave stop, 然后登陆master, flush logs, show master status, 查看File跟Position, 在重新设置slave参数。

 
## mysql docker 集群设置
 
## redis docker 主从设置
 
```bash
cd /Users/todd/docker.project/redis/master

cat redis.conf
requirepass 1234

docker run -d -p 7001:6379 -v `pwd`/redis.conf:/home/redis.conf redis:latest redis-server /home/redis.conf

cd /Users/todd/docker.project/redis/slave

cat redis.conf
slaveof 192.168.14.97 7001
masterauth 1234
requirepass 12345

docker run -d -p 7002:6379 -v `pwd`/redis.conf:/home/redis.conf redis:latest redis-server /home/redis.conf



```


 
 
## redis docker 集群设置

网址: [http://www.dasblinkenlichten.com/docker-networking-101-host-mode/](http://www.dasblinkenlichten.com/docker-networking-101-host-mode/)
[http://shift-alt-ctrl.iteye.com/blog/2284890](http://shift-alt-ctrl.iteye.com/blog/2284890)
[http://www.linuxidc.com/Linux/2015-02/112995p2.htm](http://www.linuxidc.com/Linux/2015-02/112995p2.htm)

docker run --net=host -v `pwd`/redis.conf:/home/redis.conf -d redis:latest redis-server /home/redis.conf

docker run --net=host -v `pwd`/redis.conf:/home/redis.conf -d redis:latest redis-server /home/redis.conf

docker run --net=host -v `pwd`/redis.conf:/home/redis.conf -d redis:latest redis-server /home/redis.conf



##docker 网络设置

add virtual net bridge
apt-get install bridge-utils
sudo ifconfig docker0 192.168.100.1 netmask 255.255.255.0

change docker bridge
brctl addbr br0
ifconfig br0 192.168.100.1 netmask 255.255.255.0
cat /etc/default/docker add 
DCOKER_OPS=" b=br0 " 
\#-b=br0
ps -ef | grep docker

--icc true \#允许通宿主机容器互联

--icc=false --iptables=true 在docker配置文件中
--link

iptables -L -n
iptables -F #清空

docker配置选项 --ip-forward=true

sysctl net.ipv4.conf.all.forwarding

iptables -I DOCKER -s 10.211.55.3 -d 172.17.0.7 -p TCP --dport 80 -j DROP

## solr

> url: [https://dashboard.daocloud.io/packages/bb1f8d6e-2108-43be-924a-f86537c3a13f](https://dashboard.daocloud.io/packages/bb1f8d6e-2108-43be-924a-f86537c3a13f)

```
docker run --name my_solr -d -p 8983:8983 -t solr
http://localhost:8983/
docker run --name solr_demo -d -p 8983:8983 -P solr solr-demo

```






