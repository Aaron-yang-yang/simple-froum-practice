const mongoose = require('mongoose')

const Schema = mongoose.Schema

const usersSchema = new Schema({
	email: {
		type: String,
		required: true
	},
	nickname: {
		type: String,
		required: true
	},
	//发表该话题的作者的头像
	avatar_topic:{
		type: String,
		default: '/public/img/avatar-default.png'
	},
	classify: {
		type: String,
		// 话题分类:1—分享;2—问答;3-招聘;4-客户端测试
		enum: [1, 2, 3, 4],
		required: true
	},
	title: {
		type: String,
		required: true
	},
	content: {
		type: String,
		required: true
	},
	//发表话题的时间
	created_time: {
		type: Date,
		//注意这里不要写Date.now() ,因为会立即调用
		//这里给一个方法：Date.now
		//当你去new Model 的时候，如果你没有传 create_time ,则mongoose就会调用Date.now方法得到当前的最新时间
		default: Date.now
	},
	//记录话题被访问的次数
	counter: {
		type: Number,
		default: 0
	},
	//记录被评论的次数
	commentsCounter: {
		type: Number,
		default: 0
	},
	status: {
		type: Number,
		//0允许他人评论
		//1不可以评论
		//2仅本人可见
		enum:[0, 1, 2],
		default: 0
	}
})

//导出模型
module.exports = mongoose.model('Topic', usersSchema)