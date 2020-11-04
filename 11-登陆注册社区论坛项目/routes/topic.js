//用于页面跳转（新建话题、修改话题、删除话题等操作）的路由设计

const express = require('express')
//express自带路由功能
const router = express.Router()
//导入数据库模型——话题
const topic = require('../models/topics.js')
//导入数据库模型——评论
const comment = require('../models/comments.js')
//导入自己很封装的时间转换函数
const timeTransfrom = require('../public/js/time_transfrom.js')

/**
 * 	论坛首页
 */
router.get('/', function(request, response) {
	topic.find(function(err, data) {
		if(err){
			response.status(500).send('server error.')
		}else{

			//把数据中的时间对象格式化后添加为一个新属性newTime，并且将topic数组反转
			timeTransfrom.timeTransfrom(data)
			
			response.render('index.html', {
				user: request.session.user,
				topics: data
			})
		}
	})
})


/**
 *  个人主页
 */
router.get('/profile', function(request, response) {
	topic.find({email: request.session.user.email}, function(err, data) {
		if(err){
			response.status(500).send('server error.')
		}else{
			let topics = data
			
			//把数据中的时间对象格式化后添加为一个新属性newTime，并且将topic数组反转
			timeTransfrom.timeTransfrom(topics)
			
			//读取该用户发表的所有评论
			comment.find({email: request.session.user.email}, function(err, data) {
				if(err){
					response.status(500).send('server error.')
				}else{
					
					//把数据中的时间对象格式化后添加为一个新属性newTime，并且将topic数组反转
					timeTransfrom.timeTransfrom(data)
					
					response.render('profile.html', {
						user: request.session.user,
						topics: topics,
						comments: data
					})
				}
			})
		}
	})
})


/**
 *  发表话题
 */
router.get('/topics/new', function(request, response) {
	response.render('topic/new.html', {
		user: request.session.user
	})
})

router.post('/topic_new', function(request, response) {
	request.body.avatar_topic = request.body.avatar_topic.substring(3)
	new topic(request.body).save(function(err, data) {
		if(err){
			response.status(500).json({
				err_code: 500,
				message: 'Server error.'
			})
		}else{
			response.redirect('/')
		}
	})
})


/**
 *  进入话题
 */
// router.get('/topic/show', function(request, response) {
// 	topic.find({_id:request.query.id}, function(err, data) {
// 		if(err){
// 			response.status(500).send('server error.')
// 		}else{
// 			let topic = data[0]
// 			comment.find({topicId:request.query.id}, function(err, data) {
// 				if(err){
// 					response.status(500).send('server error.')
// 				}else{
// 					response.render('topic/show.html', {
// 						user: request.session.user,
// 						topic: topic,
// 						comments: data
// 					})
// 				}
// 			})
// 		}
// 	})
// })

//使用promise避免回调地狱
router.get('/topic/show', function(request, response) {
	if(!request.session.user){
		response.redirect('/register')
	}
	new Promise(function(resolve, reject) {
		topic.find({_id:request.query.id}, function(err, data) {
			if(err){
				reject(err)
			}else{
				resolve(data)
			}
		})
	}).then(function(data) {
		let topicInfo = data[0]
		new Promise(function(resolve, reject) {
			comment.find({topicId:request.query.id}, function(err, data) {
				if(err){
					reject(err)
				}else{
					resolve(data)
				}
			})
		}).then(function(data) {
			
			//把数据中的时间对象格式化后添加为一个新属性newTime，并且将topic数组反转
			timeTransfrom.timeTransfrom(data)
			
			response.render('topic/show.html', {
				user: request.session.user,
				topic: topicInfo,
				comments: data
			})
			
			//当请求完数据后，表示浏览量 +1 。将数据库中的 counter 对应的 +1.
			topicInfo.counter += 1
			topic.findOneAndUpdate({_id:request.query.id}, topicInfo, function(err, data) {
				if(err){
					response.status(500).send('server error.')
				}
			})
			
		}, function(err) {
			response.status(500).send('server error.')
		})
	}, function(err) {
		response.status(500).send('server error.')
	})
})


/**
 *  评论话题
 */
router.post('/topic_comment', function(request, response) {
	new comment(request.body).save(function(err, data) {
		if(err){
			response.status(500).send('server error.')
		}else{
			
			//储存好评论数据后，把该话题的commentCounter +1
			topic.find({_id: request.body.topicId}, function(err, data) {
				if(err){
					response.status(500).send('server error.')
				}else{
					data[0].commentsCounter += 1
					topic.findOneAndUpdate({_id: request.body.topicId}, data[0], {new: true}, function(err, data) {
						if(err){
							response.status(500).send('server error.')
						}else{
						  //评论计数成功加一
						}
					})
				}
			})
			
			//重新请求该话题本身数据和它的所有评论数据
			new Promise(function(resolve, reject) {
				topic.find({_id:request.body.topicId}, function(err, data) {
					if(err){
						reject(err)
					}else{
						resolve(data)
					}
				})
			}).then(function(data) {
				let topicInfo = data[0]
				new Promise(function(resolve, reject) {
					comment.find({topicId:request.body.topicId}, function(err, data) {
						if(err){
							reject(err)
						}else{
							resolve(data)
						}
					})
				}).then(function(data) {
					
					//把数据中的时间对象格式化后添加为一个新属性newTime，并且将topic数组反转
					timeTransfrom.timeTransfrom(data)
					
					response.render('topic/show.html', {
						user: request.session.user,
						topic: topicInfo,
						comments: data
					})
				})
			})
		}
	
	
	
	})
})



//最后导出设计好的路由供app。js使用
module.exports = router