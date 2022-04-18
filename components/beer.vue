<template>
	<view class="beer">
		<view class="bar_one"></view>
		<view class="handle" :class="{'handle_alive':handle_alive}"></view>
		<view class="pipe"></view>
		<view class="be">			
			<view class="wine_container">
				<view class="wine" :style="{'height':wine_height}">
					<view class="froth" :class="{'froth_alive':froth_alive}">
					</view>
				</view>
			</view>
		</view>
		<view class="down_wine_trace">
			<view class="down_wine" :class="{'down_wine_alive':handle_alive}">
			</view>
		</view>
	</view>
</template>

<script>
	export default{
		name:"beer",
		props:["percent"],
		data(){
			return{
				handle_alive:false,
				froth_alive:false,
				wineHeight:0
			}
		},
		computed:{
			wine_height(){
				let curHeight = this.percent*70/100;
				if(this.wineHeight < curHeight){
					this.handle_alive = true;
					this.froth_alive = true;
					setTimeout(()=>{
						this.handle_alive = false;
					},2000)
					setTimeout(()=>{
						this.froth_alive = false;
					},3000)
				}
				this.wineHeight = curHeight;
				return  this.percent*70/100 + "rpx";
			}
		}
	}
</script>

<style scoped lang="scss">
	.beer{
		@include size(180rpx,200rpx);
		position: relative;
		
		.bar_one{
			position: absolute;
			bottom: 0;
			@include size(100rpx,180rpx);
			background-color: rgb(119,119,119);
			left: 40rpx;
			z-index: 7;
		}
		.bar_one::before{
			content:"";
			position: absolute;
			@include size(20rpx,180rpx);
			background-color: rgb(85,85,85);
			right:-10rpx;
		}
	
		.pipe{
			@include size(50rpx,25rpx);
			position: absolute;
			border-radius: 10rpx;
			left: 50rpx;
			top: 50rpx;
			z-index: 9;
			
			background: 
				radial-gradient(
					circle at 12.5rpx 12.5rpx,
					#eee 8rpx,
					#ccc 8rpx, #ccc 12.5rpx,
					transparent 12.5rpx
				),
				linear-gradient(
					#ccc 50%,
					#999 50%
				);
		}
		
		.handle{
			position: absolute;
			width: 12rpx;
			height: 32rpx;
			background-color: #ccc;
			left: 56.5rpx;
			top: 30.5rpx;
			transition: all .3s linear;
			transform-origin: bottom;
			z-index: 9;
		}
		.handle::before{
			content: "";
			position: absolute;
			@include size(20rpx,20rpx);
			border-radius: 50%;
			background-color: #eee;
			top: -18rpx;
			left: -4rpx;
		}
		
		.handle_alive{
			animation: t2 .8s linear;
		}
		
		@keyframes t2{
			0%{
				transform: rotate(0deg);
			}
			50%{
				transform: rotate(-90deg);
			}
			100%{
				transform: rotate(0deg);
			}
		}
		
		
		.pipe:before{
			content:"";
			position: absolute;
			width: 15rpx;
			height: 30rpx;
			background-color: #ccc;
			top: 20rpx;
			left: 6rpx;
		}
		
		.be{
			position: absolute;
			@include size(70rpx,80rpx);
			background-color: rgba(255, 255, 255, 0.3);
			bottom:0;
			left: 30rpx;
			border-radius: 5rpx;
			z-index: 9;
			
			.wine_container{
				position: absolute;
				@include size(54rpx,80rpx);
				overflow: hidden;
				border-radius: 5rpx;
				left: 8rpx;
				bottom: 10rpx;
				z-index: 9;
				
				.wine{
					position: absolute;
					bottom: 0rpx;
					@include size(54rpx,0rpx);
					background-color: rgba(255, 206, 84, 1);
					transition: all 2s linear;
					
					.froth{
						content:"";
						position: absolute;
						@include size(54rpx,10rpx);
						background-color: white;
						border-radius: 5rpx;
						top:-8rpx;
						opacity: 0;
						transition: all .3s .7s linear;
						animation: a2 1s linear alternate infinite;
					}
					
					.froth_alive{
						opacity: 1;
					}
					
					@keyframes a2{
						from{
							transform: skewY(6deg);
						}
						to{
							transform: skewY(-6deg);
						}
					}
				}
				
			}
		}
		.be::before{
			content:"";
			position: absolute;
			@include size(40rpx,40rpx);
			border: 8rpx solid rgba(255, 255, 255, 0.3);
			border-radius: 0 40% 40% 0;
			top: 12rpx;
			right: -20rpx;
			clip-path: inset(0 0 0 36rpx);
		}
	
		.down_wine_trace{
			@include size(15rpx,100rpx);
			position: absolute;
			left:56rpx;
			bottom: 10rpx;
			z-index: 8;
			overflow: hidden;
			
			.down_wine{
				position: absolute;
				@include size(100%,100%);
				top:-100rpx;
				background-color: rgba(255, 206, 84, 0.8);
			}
			
			.down_wine_alive{
				position: absolute;
				animation: t1 2s linear;
			}
			
			@keyframes t1{
				from{
					top:-80rpx;
				}
				to{
					top:200rpx;
				}
			}
		}
	}
</style>
