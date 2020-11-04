span_first = function(span) {
	span.style.backgroundColor = '#008000'
	let span_another = document.getElementById('span2')
	span_another.style.backgroundColor = '#828284'
	
	let content1 = document.getElementById('content1')
	let content2 = document.getElementById('content2')
	content1.style.display = 'block'
	content2.style.display = 'none'
}
span_second = function(span) {
	span.style.backgroundColor = '#008000'
	let span_another = document.getElementById('span1')
	span_another.style.backgroundColor = '#828284'
	
	let content1 = document.getElementById('content1')
	let content2 = document.getElementById('content2')
	content2.style.display = 'block'
	content1.style.display = 'none'
}
