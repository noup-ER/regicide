<template>
	<view class="home">
		<image src="http://www.userect.top/sword.jpeg" class="cover"></image>
		<navigator url="../solitary-play/index">
			<button class="logo_btn" type="default">单人游戏</button>
		</navigator>
		<navigator url="../rule/index">
			<button class="rule_btn" type="default">规则</button>
		</navigator>
	</view>
</template>

<script>
	export default{

	}
</script>

<style scoped lang="scss">
	.home{
		@include all_screen;
		display: flex;
		flex-direction: column;
		justify-content: center;
		
		.cover{
			position: absolute;
			@include size(100%,100%);
		}
		
		.logo_btn{
			width: 8rem;
			height: 3rem;
			border-radius: 5px;
			margin-bottom: 60rpx;
		}
		
		.rule_btn{
			margin-top: 60rpx;
			width: 8rem;
			height: 3rem;
			border-radius: 5px;
		}
	}
	
</style>
