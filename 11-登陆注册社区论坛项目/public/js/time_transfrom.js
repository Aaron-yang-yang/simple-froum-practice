function timeTransfrom(data) {
	if(Array.isArray(data)){
		data.reverse().forEach(function(item) {
			item.newTime = JSON.stringify(item.created_time).replace(/T/, '  ').substring(1, 21)
		})
	}else{
		data.newTime = JSON.stringify(data.created_time).replace(/T/, '  ').substring(1, 21)
	}
}

function birthdayTransfrom(data) {
	if(data.birthday){
		data.newBirthday = JSON.stringify(data.birthday).substring(1, 11)
	}
}

module.exports = {
	timeTransfrom: timeTransfrom,
	birthdayTransfrom: birthdayTransfrom
}
