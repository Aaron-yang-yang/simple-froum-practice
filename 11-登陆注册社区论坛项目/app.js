//导入第三方模块express
const express = require('express')
//导入node自带模块path
const path = require('path')
//导入session
const session = require('express-session')
//导入路由
const routerTopic = require('./routes/topic.js')
const routerSession = require('./routes/session.js')

const app = express()

//安装art-template后无需加载，因为安装的express-art-template依赖了它
app.engine('html', require('express-art-template'))

//将资源暴露出来
app.use('/public/', express.static(path.join(__dirname, './public/')))
//用户头像图片
app.use('/uploads/', express.static(path.join(__dirname, './uploads/')))
app.use('/node_modules/', express.static(path.join(__dirname, './node_modules/')))

//引入第三方包解析post请求
let bodyParser = require('body-parser')
//配置 body-parser (注意：一定要在路由挂载之前)
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

//在 Express 这个框架中，默认是不支持 Cookie 和 Session 
//需要引入第三方中间件：express-session 来解决
// 1.npm install express-session
// 2.配置 (一定要在挂载路由之前)
// 3.使用
//      通过 request.session 来访问和设置 Session 成员
//      添加 Session 数据：	request.session.foo = 'bar'
//      访问 Session 数据：	request.session.foo
app.use(session({
	secret: 'keyboard cat',  //配置加密字符串，它会在原有加密基础上和这个字符串拼起来加密，更安全！
	resave: false,
	saveUninitialized: true //无论你是否使用了Session，都默认给你分配一把钥匙
}))


//把路由挂载到app上
app.use(routerTopic)
app.use(routerSession)


app.listen(3000, function() {
	console.log('app is running!')
})