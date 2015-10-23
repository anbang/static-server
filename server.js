var http = require('http');//导入http模块
var fs = require('fs');//读写文件模块
var path = require('path');//导入文件路径路径模块
var url = require('url');//处理URL，http://localhost:8080/a/b
var mime = require('mime');   //文件的类型
var server = http.createServer(function (req, res) {

    //忽略ico文件
    if (req.url == '/favicon.ico') {
        res.end('404');
        return;
    }
    //请求地址标准化，过滤掉..之类的路径
    var reqPath = path.normalize(req.url);//请求路径
    var cachePath = reqPath;//缓存请求路径，拼接超链接字符串用到
    //获取当前文件所在的绝对路径
    var filepath = path.join(__dirname, reqPath);
    //判断文件是否存在
    fs.exists(filepath, function (exists) {
        //文件存在
        if (exists) {
            //判断是否是目录
            if (fs.statSync(filepath).isDirectory()) {
                /*statSync是同步版的 stat()；方法返回一个stat数组对象;接收参数：path 文件路径;isDirectory是判断是否是目录*/

                //下面是拼一个html页面出来
                var addStr = '<link rel="stylesheet" href="public/css/index.css"/>';
                addStr += '<h1>静态资源服务器</h1>';
                addStr += '<ul>';

                //遍历读文件
                fs.readdir(filepath, function (err, files) {
                    res.writeHead(200, {"Content-Type": "text/html;charset=UTF-8"});
                    if (err) {
                        console.log(err);
                    } else {
                        files.forEach(function (file) {//开始循环父目录下所有文件；
                            var filepath = path.join(cachePath, file) + '"style="">' + file + '</a></li>';
                            if (path.extname(file)) {//有后缀是文件
                                addStr += '<li class="gray"><a href="' + filepath;
                            } else {//没有文件后缀是目录
                                addStr += '<li><a href="' + filepath;
                            }
                        })
                    }
                    res.end(addStr + "</ul><p>提示：以上目录列表，蓝色是文件夹，可点击继续进入文件夹</p>");
                });
            } else if (fs.statSync(filepath).isFile()) {
                //当访问的是文件时，判断文件类型，并读文件
                res.writeHead(200, {"Content-Type": mime.lookup(path.basename(filepath)) + ";charset=UTF-8"});
                fs.readFile(filepath, {flag: "r"}, function (err, data) {
                    if (err) {
                        res.end(err);
                    } else {
                        res.end(data)
                    }
                })
            }
        } else {
            res.writeHead(404, {"Content-Type": "text/html"});
            res.write('<span style="color:red">"' + filepath + '"</span> was not found on this server.');
            res.end();
        }
    })
});
server.listen(8081);