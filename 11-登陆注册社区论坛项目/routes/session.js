//用于登陆、注册、注销等和服务器对话相关目录的路由设计

const express = require('express')
//express自带路由功能
const router = express.Router()
//导入node自带路径模块
const path = require('path')
//导入自己很封装的时间转换函数
const timeTransfrom = require('../public/js/time_transfrom.js')
//导入数据库模型
const user = require('../models/users.js')
//导入加密包，用于加密用户的密码
//npm install blueimp-md5
const md5 = require('blueimp-md5')
//导入图片上传插件
//npm install --save multer
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })

/**
 * 登陆
 */
router.get('/login', function(request, response) {
	response.render('login.html')
})

router.post('/login_post', function(request, response) {
	//1.获取表单请求数据
	//2.去数据库查询用户密码是否正确
	//3.发送响应数据
	
	let body = request.body
	
	user.findOne({
		email: body.email,
		password: md5(md5(body.password))
	}, function(err, user) {
		
		//查询出错
		if(err){
			return response.status(500).json({
				err_code: 500,
				message: err.message  //返回系统错误的提示信息
			})
		}
		
		//用户不存在或者密码错误
		if(!user){
			return response.status(200).json({
				err_code: 1,
				message: 'Email or password is invalid.'
			})
		}
		//用户存在，登陆成功，通过 Session 记录登陆状态
		request.session.user = user
		response.status(200).json({
			err_code: 0,
			message: '登陆成功！'
		})
	})
})



/**
 * 注册
 */
router.get('/register', function(request, response) {
	response.render('register.html')
})

router.post('/register_post', function(request, response) {
	//1.获取表单post提交的数据
	//2.操作数据库
			// 判断该用户是否已经注册？
	//3.做出响应
	let body = request.body
	user.findOne({
		//或查找，符合其中一个条件就查找出来
		$or: [
			{email: body.email},{nickname: body.nickname}
		]
	}, function(err, data) {
		if(err){
			//response.json为expres自带的方法，可以将返回的数据自动转换成字符串格式，满足ajax
			response.status(500).json({
				success: false,
				message: 'Server error'
			})
		}
		else if(data){
			//查询到数据，表明邮箱或者用户名已经存在
			//再判断是邮箱存在还是用户名
			user.findOne({email: body.email}, function(err, data) {
				if(err){
					//response.json为expres自带的方法，可以将返回的数据自动转换成字符串格式，满足ajax
					response.status(500).json({
						success: false,
						message: 'Server error'
					})
				}
				if(data){
					response.status(200).json({
						err_code: 1,
						message: 'Email already exists.'
					})
				}
			})
			user.findOne({nickname: body.nickname}, function(err, data) {
				if(err){
					//response.json为expres自带的方法，可以将返回的数据自动转换成字符串格式，满足ajax
					response.status(500).json({
						success: false,
						message: 'Server error'
					})
				}
				if(data){
					response.status(200).json({
						err_code: 2,
						message: 'Nickname already exists.'
					})
				}
			})
		}else{
			//看面条件都没满足，则保存新用户信息，注册成功
			//用md5加密密码两次、
			body.password = md5(md5(body.password))
			
			new user(body).save(function(err, user) {
				if(err){
					response.status(500).json({
						err_code: 500,
						message: 'Server error.'
					})
				}else{
					
					//注册成功后，用 Session 记录用户的登陆状态
					//在这里一旦注册成功就默认登陆，无需再次跳转登陆
					request.session.user = user
					
					response.status(200).json({
						err_code: 0,
						message: 'OK'
					})
				}
			})
		}
	})
})


/**
 * 退出
 */
router.get('/logout', function(request, response) {
	
	//清除登陆状态
	request.session.user = null
	
	//重新定向到登陆页，因为是a标签请求，同步请求，所以可以直接在服务器重定向
	response.redirect('/login')
	
})


/**
 *  设置个人信息
 */
router.get('/settings/profile', function(request, response) {
	timeTransfrom.birthdayTransfrom(request.session.user)
	response.render('settings/profile.html', {
		user: request.session.user
	})
})

//修改个人信息
router.post('/profile_post', function(request, response) {
	user.findOneAndUpdate({email:request.session.user.email}, request.body, {new: true}, function(err, data) {
		if(err){
			response.status(500).json({
				err_code: 500
			})
		}else{
			request.session.user = data
			response.status(200).json({
				err_code: 0
			})
		}
	})
})

//修改头像
router.post('/profile_avatar_form', upload.single('avatar'), function(request, response) {
	console.log(request.file)
	let newBody = {}
	newBody.avatar = '../../' + request.file.path
	user.findOneAndUpdate({email:request.session.user.email}, newBody, {new: true}, function(err, data) {
		if(err){
			response.status(500).json({
				err_code: 500,
			})
		}else{
			console.log(data)
			request.session.user = data
			response.status(200).json({
				err_code: 0
			})
		}
	})
})



/**
 *  修改账户密码
 */
router.get('/settings/admin', function(request, response) {
	response.render('settings/admin.html', {
		user: request.session.user
	})
})

router.post('/admin_post', function(request, response) {
	let body = request.body
	//判断输入的密码是否正确
	if(md5(md5(body.prePassword))!==request.session.user.password){
		response.status(200).json({
			err_code: 1
		})
	}
	//判断两次密码是否一致
	else if(body.newPassword1!==body.newPassword2){
		response.status(200).json({
			err_code: 2
		})
	}
	//把新密码更新到数据库
	else{
		let newPassword = {}
		newPassword.password = md5(md5(body.newPassword1))
		user.findOneAndUpdate({password: request.session.user.password}, newPassword, {new: true}, function(err, data) {
			if(err){
				response.status(500).json({
					err_code: 500
				})
			}else{
				request.session.user = null
				response.status(200).json({
					err_code: 0
				})
			}
		})
	}
})


/**
 *  注销账户
 */
router.get('/unsubscribe', function(request, response) {
	user.deleteOne({_id:request.query.id}, function(err, data) {
		if(err){
			response.status(500).send('server error.')
		}else{
			request.session.user = null
			response.redirect('/register')
		}
	})
})


//最后导出设计好的路由供app。js使用
module.exports = router