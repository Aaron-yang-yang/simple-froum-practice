const mongoose = require('mongoose')
mongoose.set('useFindAndModify', false)
//连接数据库,并指定新的数据库的名字叫practice-project/users
mongoose.connect('mongodb://localhost/users', {useNewUrlParser: true, useUnifiedTopology: true}, {user: 'userAdmin', pass: '123'})

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
	password: {
		type: String,
		required: true
	},
	//创建账户的时间
	created_time: {
		type: Date,
		//注意这里不要写Date.now() ,因为会立即调用
		//这里给一个方法：Date.now
		//当你去new Model 的时候，如果你没有传 create_time ,则mongoose就会调用Date.now方法得到当前的最新时间
		default: Date.now
	},
	//最近一次修改用户信息的时间
	last_modified_time: {
		type: Date,
		default: Date.now
	},
	//用户头像
	avatar: {
		type: String,
		default: '/public/img/avatar-default.png'
	},
	//介绍
	bio: {
		type: String,
		default: ''
	},
	gender: {
		type: Number,
		enum: [-1, 0, 1],
		default: -1
	},
	birthday: {
		type: Date
	},
	status: {
		type: Number,
		//0无限制
		//1不可以评论
		//2不可以登陆使用
		enum:[0, 1, 2],
		default: 0
	}
})

//导出模型
module.exports = mongoose.model('User', usersSchema)