function setFontSize(Vue) {
	let fontSize = '100px';
	const res = uni.getSystemInfoSync();
	if(res.screenWidth < 750){//根据屏幕宽度进行适配
	      fontSize = 100 * (res.screenWidth / 750) + 'px';
	}
	Vue.prototype.$footFontSize = fontSize;
}

module.exports = {
	setFontSize
}