
```
npm install
```
## 运行
```
npm run serve
```

## 打包
```
npm run build
```

## 部署
把build的dist文件命名为fBlog(自取)上传到服务器

### nginx配置
```
location /fBlog/ {
	root /usr/local/nginx/;#fBlog所在的更目录
	try_files $uri $uri/ /fBlog/;
}
```

## 演示
```
域名:4567/fBlog/
```