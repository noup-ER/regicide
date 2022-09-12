<template>
	<page-meta :root-font-size="$rootFontSize"></page-meta>
	<view class="battlefield">
		<view class="wrapper" v-if="wrapper_show">
			<text>你已阵亡!</text>
			<button type="default" @click="page_reload()">重新开始</button>
		</view>
		<view class="throne">
			<image src="../../static/svg/crown.svg" v-show="king.immune" class="head_flag"></image>
			<image src="../../static/svg/no_immune.svg" v-show="!king.immune" class="head_flag"></image>
			<view class="king_seat">
				<image :src="`${url_prefix}/images/cards/${king.color}-${king.number}.png`" class="king_card"></image>
			</view>
			<view class="king_condition">
				<image src="../../static/svg/sword.svg" class="sword"></image>
				<text>{{king.attack}}</text>
				<image src="../../static/svg/heart.svg" class="heart"></image>
				<text>{{king.life}}</text>
			</view>
		</view>
		<view class="card_store">
			<view class="discard_pile">
				<view class="discard_title">弃牌堆</view>
				<view class="discard_an">
					<view class="an" :style="{'width':discard_width}">
						<image v-if="remove_cards.length === 0" src="${url_prefix}/cover.png" class="an_cover" mode=""></image>
						<image v-else :src="`${url_prefix}/cards/${remove_cards[0].color}-${remove_cards[0].number}.png`" class="an_cover" mode=""></image>
					</view>
				</view>
				<view class="discard_data">
					<progress class="prog" :percent="discard_percent" backgroundColor="orange" stroke-width="25rpx"/>
					<view class="residue">
						剩余{{remove_cards.length}}张
					</view>
				</view>
			</view>
			<view class="tavern">
				<view class="tavern_title">酒馆</view>
				<view class="tavern_an">
					<beer :percent="tovern_percent"></beer>
				</view>
				<view class="tavern_data">
					<progress class="prog" :percent="tovern_percent" backgroundColor="orange" stroke-width="25rpx"/>
					<view class="residue">
						剩余{{tovern_cards.length}}张
					</view>
				</view>
			</view>
		</view>
		<view class="function_area" @tap="click_btn($event)">
			<button v-if="stage !== 4" id="play_card_btn" 
			type="default" :disabled="play_card_btn_disabled">出牌</button>
			<button v-if="stage !== 4" id="joker_btn" :disabled="joker_number === 2" type="default">小丑牌({{joker_number}}/2)</button>
			<button v-if="stage === 4" id="discard_btn" type="warn">弃牌</button>
			<button type="default" id="restart_btn">重新开始</button>
		</view>
		<scroll-view scroll-x="true" class="hand_area" @click="chose_card($event)">
			<view class="card_body">
				<view class="card" v-for="(item,index) in hand_cards" :id="`card`+index" :key = "'card_' + index" :class="{'card_chosen':item.chosen,'card_given':item.given}">
					<image :id="`card`+index" :src="`${url_prefix}/images/cards/${item.color}-${item.number}.png`"></image>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import beer from "../../components/beer.vue";
	const {refrush_cards,init,check_the_drawing_cards,create_mass,card_number2number} = require("./utils/function_gather.js");
	const {url_prefix} = require("./utils/variate.js");
	
	export default{
		components:{
			beer
		},
		data(){
			return {
				stage:1, //表示游戏阶段
				all_cards_number:40, //表示玩家可以操控的牌量
				hand_cards:[], //手牌区
				king_cards:[], //boss区
				king:{ 			//当前boss
					color:"",	//花色
					number:"",	//点数
					attack:0,	//攻击
					life:0,		//生命
					immune:true	//是否免疫
				},
				remove_cards:[],	//弃牌区
				tovern_cards:[],	//酒馆区
				transit_cards:[],	//打出去的手牌中转区
				joker_number:0,		//小丑牌使用次数
				wrapper_show:false,  //控制遮罩层
				url_prefix
			}
		},
		created(){
			this.init();
		},
		computed:{
			//表示弃牌堆的长度
			discard_width(){
				return this.remove_cards.length * 6 + 114 + "rpx";
			},
			//弃牌堆进度条
			discard_percent(){
				return Math.floor(this.remove_cards.length / this.all_cards_number * 100);
			},
			//酒馆进度条
			tovern_percent(){
				return Math.floor(this.tovern_cards.length / this.all_cards_number * 100);
			},
			//被选中的卡牌
			drawing_cards(){
				return this.hand_cards.filter((val,index,arr)=>{
					return val.chosen;
				})
			},
			//控制出牌disabled
			play_card_btn_disabled(){
				return this.drawing_cards.length === 0;
			}
		},
		methods:{
			//初始化游戏
			init(){
				this.stage = 1;
				this.all_cards_number = 40;
				this.wrapper_show = false;
				let obj = init();
				this.hand_cards = obj.hand_cards;
				this.king_cards = obj.king_cards;
				this.king = this.king_cards.shift();
				this.remove_cards = obj.remove_cards;
				this.tovern_cards = obj.tovern_cards;
				this.joker_number = 0;
			},
			//将中转区的牌推入弃牌区;
			push_transit_to_discard(){
				this.remove_cards = this.remove_cards.concat(this.transit_cards);
				this.transit_cards = [];
			},
			//结束游戏
			end_game(){
				this.wrapper_show = true;
				wx.showToast({
				  title: '你已阵亡',
				  icon: 'error',
				  duration: 2000
				})
			},
			//选择牌
			chose_card(e){
				if(/card/.test(e.target.id)){
					//选择出牌
					if(this.stage !== 4){
						let index = Number(e.target.id.slice(4,)),temp = this.hand_cards[index];
						temp.chosen = !temp.chosen;
						this.hand_cards.splice(index,1,temp);
					}
					//选择弃牌
					else{
						let index = Number(e.target.id.slice(4,)),temp = this.hand_cards[index];
						temp.given = !temp.given;
						this.hand_cards.splice(index,1,temp);
					}	
				}
			},
			click_btn(e){
				let drawing_cards_transit,hand,points,this_ = this;//中转变量
				//事件委托
				switch(e.target.id){
					//出牌
					case "play_card_btn":
						//检查出牌是否符合规则
						let result = check_the_drawing_cards(this.drawing_cards);
						if(!result.flag){
							wx.showModal({
								content:result.message
							})
							return;
						}
						
						//查看草花是否生效
						let if_club = false;
						if(!this.king.immune || this.king.color !== "club"){
							if_club = true;
						}
						
						//记录卡牌效果
						let {attack_king,reduse_king_attack,
						tovern_cards2hand_cards,remove_cards2tovern_cards} = create_mass(this.drawing_cards,if_club);
						//将打出的牌放入中转区 并修改选择的状态
						drawing_cards_transit = JSON.parse(JSON.stringify(this.drawing_cards));
						drawing_cards_transit = drawing_cards_transit.map((val)=>{
							val.chosen = false;
							return val;
						})
						this.transit_cards = this.transit_cards.concat(drawing_cards_transit);
						
						
						//从手牌区移除打出的牌
						hand = 0;
						while(hand < this.hand_cards.length){
							if(this.hand_cards[hand].chosen){
								this.hand_cards.splice(hand,1);
							}else{
								hand += 1;
							}
						}
						this.stage = 2;
						
						//把弃牌堆中的牌补充到酒馆里
						if(!this.king.immune || this.king.color !== "heart"){
							//洗牌
							this.remove_cards = refrush_cards(this.remove_cards);
							let move_cards = this.remove_cards.splice(0,Number(remove_cards2tovern_cards))
							this.tovern_cards = this.tovern_cards.concat(move_cards);
						}
						
						//把酒馆中的牌补到手牌里
						if(!this.king.immune || this.king.color !== "dianmond"){
							let need_cards_number = Math.min(Number(tovern_cards2hand_cards),8 - this.hand_cards.length);
							let move_cards = this.tovern_cards.splice(0,need_cards_number);
							this.hand_cards = this.hand_cards.concat(move_cards);
						}
						this.stage = 3;
						
						//开始对boss进行结算;
						//首先降攻
						if(!this.king.immune || this.king.color !== "spade"){
							this.king.attack -= reduse_king_attack;
							this.king.attack = (this.king.attack < 0)?0:this.king.attack;
						}
						
						//进行进攻
						this.king.life -= attack_king;
						
						//开始判定
						//荣誉击杀boss 进入酒馆
						if(this.king.life <= 0){
							// 获得游戏胜利 
							if(this.king_cards.length === 0){
								wx.showModal({
									content:"您已刺杀玩所有君王，太厉害了",
									showCancel:false,
									confirmText:"重新开始",
									success:()=>{
										this_.init()
									}
								})
								return;
							}
							
							let new_card = {
								color:this.king.color,
								number:this.king.number,
								chosen:false
							}
							if(this.king.life === 0){
								this.tovern_cards.unshift(new_card);
							}
							this.all_cards_number += 1;
							this.remove_cards = this.remove_cards.concat(this.transit_cards);
							this.transit_cards = [];
							if(this.king.life < 0){
								this.remove_cards.unshift(new_card);
							}
							this.king = this.king_cards.shift();
						}
						//boss没有阵亡进入第四阶段
						else{
							if(this.king.attack === 0){
								this.stage = 1;
								this.push_transit_to_discard();
								return;
							}
							
							this.stage = 4;
							//首先判断玩家所有点数够不够boss攻击力;
							points = this.hand_cards.reduce((preval,card)=>{
								return preval + card_number2number(card.number);
							},0)
							if(this.king.attack >= points){
								let flag = false;
								while(this.joker_number < 2){
									wx.showToast({
										title:"已自动触发joker牌"
									})
									this.joker_number += 1;
									this.king.immune = false;
									this.hand_cards = this.hand_cards.map((val)=>{
										val.chosen = false;
										val.given = false;
										return val;
									})
									this.transit_cards = this.transit_cards.concat(this.hand_cards);
									this.hand_cards = this.tovern_cards.splice(0,8);
									this.push_transit_to_discard();
									points = this.hand_cards.reduce((preval,card)=>{
										return preval + card_number2number(card.number);
									},0);
									if(this.king.attack < points){
										flag = true;
										break;
									}
								}
								if(!flag){
									this.end_game();
								}
							}
						}
						break;
					//小丑牌
					//小丑牌
					case "joker_btn":
						this.joker_number += 1;
						this.king.immune = false;
						this.hand_cards = this.hand_cards.map((val)=>{
							val.chosen = false;
							val.given = false;
							return val;
						})
						this.transit_cards = this.transit_cards.concat(this.hand_cards);
						this.hand_cards = this.tovern_cards.splice(0,8);
						this.push_transit_to_discard();
						this.stage = 1;
						break;
					//弃牌
					case "discard_btn":
						//首先判断玩家弃牌的点数够不够boss攻击力
						points = this.hand_cards.reduce((preval,card)=>{
							if(card.given){
								return preval + card_number2number(card.number);
							}else{
								return preval;
							}
						},0);
						if(points < this.king.attack){
							wx.showModal({
								content:"弃牌点数不够"
							})
							return;
						}
						
						this.transit_cards = this.transit_cards.concat(this.drawing_cards);
						hand = 0;
						while(hand < this.hand_cards.length){
							if(this.hand_cards[hand].given){
								this.hand_cards[hand].given = false;
								this.transit_cards.push(this.hand_cards[hand]);
								this.hand_cards.splice(hand,1);
							}else{
								hand += 1;
							}
						}
						
						this.push_transit_to_discard();
						
						if(this.hand_cards.length === 0 ){
							this.end_game();
						}
						
						this.stage = 1;
						break;
					case  "restart_btn":
						wx.showModal({
							content:"你确定要重新开始吗?",
							success:(res)=>{
								if(res.confirm){
									this_.init();
								}else{return;}
							},
						})
						break;
					default:
						break;
				}
			},
			page_reload(){
				this.init();
			}
		}
	}
</script>

<style scoped lang="scss">
	.battlefield{
		@include all_screen;
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		align-items: space-between;
		// background-color: rgb(161,187,236);	
		background-image: linear-gradient(180deg, rgb(118, 182, 254), rgb(119, 207, 249));
		
		.wrapper{
			@include all_screen;
			position: absolute;
			background-color: rgba(0,0,0,.5);
			z-index: 50;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			
			text{
				color: red;
				margin-bottom: 10rpx;
				font-size: 100rpx;
			}
			
			button{
				@include size(auto,80rpx);
				line-height: 80rpx;
			}
		}
		
		.throne{
			@include size(300rpx,600rpx);
			display: flex;
			flex-direction: column;
			background-color: rgb(239,139,200);
			
			.head_flag{
				@include size(100%,100rpx);
			}
			
			.king_seat{
				@include size(100%,400rpx);
				overflow: hidden;
				border: 1px solid black;
				position: relative;
				
				.king_card{
					width: 100%;
					height: 100%;
					position: absolute;
				}
			}
		
			.king_condition{
				@include size(100%,100rpx);
				display: flex;
				justify-content: space-around;
				align-items: center;
				
				.sword{
					@include size(50rpx,50rpx);
				}
				.heart{
					@include size(50rpx,50rpx);
				}
				
				text{
					font-family: 宋体;
					font-size: rpx;
				}
			}
		}
		
		.card_store{
			@include size(450rpx,600rpx);
			// border: 1rpx solid black;
			
			.discard_pile{
				@include size(100%,50%);
				// border: 1rpx solid black;
				display:  flex;
				flex-wrap: wrap;
				justify-content: center;
				background-color: rgb(92,201,212);
				
				.discard_title{
					@include size(100%,50rpx);
					display: flex;
					justify-content: center;
					align-items: center;
				}
				
				.discard_an{
					@include size(100%,200rpx);
					display: flex;
					justify-content: center;
					align-items: center;
					
					.an{
						@include size(240rpx,160rpx);
						border-radius: 10rpx;
						background-color: rgb(211,211,211);
						display: flex;
						justify-content: flex-end;
						
						.an_cover{
							@include size(114rpx,100%);
							border-radius: 10rpx;
							transition: all .3s linear;
						}
					}
				}
				
				.discard_data{
					@include size(100%,50rpx);
					display: flex;
					flex-direction: row;
					flex-wrap: nowrap;
					align-items: center;
					justify-content: space-around;
					
					.prog{
						@include size(260rpx,100%);
					}
					.residue{
						@include size(100rpx,100%);
						display: flex;
						justify-content: center;
						align-items: center;
						font-size: 24rpx;
						white-space: nowrap;
					}
				}
			}
		
			.tavern{
				@include size(100%,50%);
				display:  flex;
				flex-wrap: wrap;
				justify-content: center;
				background-color: rgb(255,250,232);
				
				.tavern_title{
					@include size(100%,50rpx);
					display: flex;
					justify-content: center;
					align-items: center;
				}
				
				.tavern_an{
					@include size(100%,200rpx);
					display: flex;
					justify-content: center;
					align-items: center;
					// border: 1rpx solid black;
					background-color: rgb(122,135,151);
					position: relative;
				}
				
				.tavern_data{
					@include size(100%,50rpx);
					display: flex;
					flex-direction: row;
					flex-wrap: nowrap;
					align-items: center;
					justify-content: space-around;
					
					.prog{
						@include size(260rpx,100%);
					}
					
					.residue{
						@include size(100rpx,100%);
						display: flex;
						justify-content: center;
						align-items: center;
						font-size: 24rpx;
						white-space: nowrap;
					}
				}
			}
		}
		
		.function_area{
			@include size(100%,100rpx);
			display: flex;
			justify-content: space-around;
			align-items: center;
			
			#play_card_btn{
				@include size(auto,80rpx);
				font-size: 30rpx;
				// background-color: rgb(193,167,102);
			}
			
			#joker_btn{
				@include size(auto,80rpx);
				font-size: 30rpx;
			}
			
			#discard_btn{
				@include size(auto,80rpx);
				font-size: 30rpx;
			}
			
			#restart_btn{
				@include size(auto,80rpx);
				font-size: 30rpx;
			}
		}
		
		.hand_area{
			@include size(100%,440rpx);
			white-space: nowrap;
			
			.card_body{
				@include size(750rpx,440rpx);
				display: flex;
				justify-content: flex-start;
				flex-direction: row;
				flex-wrap: wrap;
				
				.card{
					// display: inline-block;
					@include size(25%,220rpx);
					// border: 1px solid black;
					position: relative;
					border:5rpx solid transparent;
					
					
					image{
						@include size(86%,86%);
						top:7%;
						left: 7%;
						border: 2px solid rgba(0,0,0,.3);
						position: absolute;
						box-shadow: 2rpx 2rpx 10rpx #333333;
					}
				}
				
				.card_chosen{
					image{
						border-color: yellow;
						box-shadow: 2rpx 2rpx 10rpx yellow;
					}
				}
				
				.card_given{
					image{
						border-color: red;
						box-shadow: 2rpx 2rpx 10rpx red;
					}
				}
			}
		}
	}
</style>
