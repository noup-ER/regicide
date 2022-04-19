//洗牌
function refrush_cards(arr) {
	let ans = [],ls = JSON.parse(JSON.stringify(arr));
	while(ls.length){
		let index = Math.floor(Math.random()*ls.length);
		ans.push(ls[index]);
		ls.splice(index,1);
	}
	return ans;
}

//将卡牌的点数转成数字
function card_number2number(cardNumber){
	switch(cardNumber){
		case "A":
			return 1;
		case "J":
			return 10;
		case "Q":
			return 15;
		case "K":
			return 20;
		default:
			return Number(cardNumber);
	}
}


//初始化游戏
function init(){
	let king_cards = [],
		remove_cards = [],
		tovern_cards = [],
		hand_cards = [],
		colors = ["club","heart","dianmond","spade"];
	
	//add J
	for(let i of refrush_cards(colors)){
		king_cards.push({
			color:i,
			number:"J",
			attack:10,
			life:20,
			immune:true
		})
	}
	//add Q
	for(let i of refrush_cards(colors)){
		king_cards.push({
			color:i,
			number:"Q",
			attack:15,
			life:30,
			immune:true
		})
	}
	//add K
	for(let i of refrush_cards(colors)){
		king_cards.push({
			color:i,
			number:"K",
			attack:20,
			life:40,
			immune:true
		})
	}
	
	
	let all_cards = [];
	for(let j of colors){
		for(let i of ["A","2","3","4","5","6","7","8","9","10"]){
			all_cards.push({
				color:j,
				number:i,
				chosen:false, //是否被选中出牌
				given:false	  //是否被选中丢弃
			})
		}	
	}
	all_cards = refrush_cards(all_cards);
	hand_cards = all_cards.splice(0,8);
	tovern_cards = all_cards;
	return {king_cards,remove_cards,tovern_cards,hand_cards}
}

//检查打出的牌是否符合规则
function check_the_drawing_cards(arr){
	//只有一张牌就通过
	if(arr.length === 1){
		return {
			flag:true
		}
	}
	
	// 把点数先提出来
	let num_list = [];
	for(let card of arr){
		num_list.push(card_number2number(card.number))
	}
	
	let temp_set = new Set(num_list);
	if(temp_set.size === 1){
		let total = num_list.reduce((preval,curval)=>{
			return preval + curval;
		},0);
		if(total > 10){
			return {
				flag:false,
				message:"出牌点数应不超过10"
			}
		}
	}else if(temp_set.size === 2){
		if(!num_list.includes(1)){
			return {
				flag:false,
				message:"出牌不符合规则"
			}
		}else{
			if(num_list.length > 2){
				return {
					flag:false,
					message:"出牌不符合规则"
				}
			}
		}
	}else if(temp_set.size >= 3){
		return {
			flag:false,
			message:"出牌不符合规则"
		}
	}
	
	return {
		flag:true
	}
}

//将牌的效果集中到对象中
function create_mass(arr,if_club){
	let obj = {
		attack_king:0,
		reduse_king_attack:0,
		tovern_cards2hand_cards:0,
		remove_cards2tovern_cards:0
	}
	//计算总点数
	let points = arr.reduce((preval,card)=>{
		switch(card.number){
			case "A":
				return preval + 1;
			case "J":
				return preval + 10;
			case "Q":
				return preval + 15;
			case "K":
				return preval + 20;
			default:
				return preval + Number(card.number);
		}
	},0)
	obj.attack_king = points * (((arr.some((card)=>{
		return card.color === "club";
	}))&&if_club)?2:1);
	obj.reduse_king_attack = points * ((arr.some((card)=>{
		return card.color === "spade";
	}))?1:0);
	obj.tovern_cards2hand_cards =  points * ((arr.some((card)=>{
		return card.color === "dianmond";
	}))?1:0);
	obj.remove_cards2tovern_cards = points * ((arr.some((card)=>{
		return card.color === "heart";
	}))?1:0);
	return obj;
}



module.exports = {
	refrush_cards,
	init,
	check_the_drawing_cards,
	create_mass,
	card_number2number
}