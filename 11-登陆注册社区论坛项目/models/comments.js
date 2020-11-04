const mongoose = require('mongoose')

const Schema = mongoose.Schema

const usersSchema = new Schema({
	//发表评论者的邮箱
	email: {
		type: String,
		required: true
	},
	//发表评论者
	nickname: {
		type: String,
		required: true
	},
	//被评论的文章的id
	topicId: {
		type: String,
		required: true
	},
	//评论的内容
	commentContent: {
		type: String,
		required: true
	},
	//发表评论的时间
	created_time: {
		type: Date,
		//注意这里不要写Date.now() ,因为会立即调用
		//这里给一个方法：Date.now
		//当你去new Model 的时候，如果你没有传 create_time ,则mongoose就会调用Date.now方法得到当前的最新时间
		default: Date.now
	}
})

//导出模型
module.exports = mongoose.model('Comment', usersSchema)