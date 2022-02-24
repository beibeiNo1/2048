var game={
	data:null,
	RN:4,
	CN:4,
	score:0,//保存游戏分数
	top1:0, //保存游戏历史最高分
	state:1, //保存游戏当前状态
	RUNNING:1,  //游戏运行
	GAMEOVER:0,  //游戏结束
	MARGIN:16,
	CSIZE:100,
	//获得cookie的最高分
	getTop:function(){
		var cookies=document.cookie.split(";");
		for(var i=0;i<cookies.length;i++){
			var kv=cookies[i].split("=");
			cookies[kv[0]]=kv[1];
		}
		return cookies["top1"]||0;
	},
	//将当前分数保存到cookie
	setTop:function(){
		var now=new Date();
		now.setFullYear(now.getFullYear()+10);
		document.cookie="top1="+this.score+";expires"+now.toGMTString();
	},
	
	getInnerHTML:function(){
		for(var r=0,arr=[];r<this.RN;r++){
			for(var c=0;c<this.CN;c++){
				arr.push(""+r+c);
			}
		}
		var html='<div id="g'+arr.join('" class="grid"></div><div id="g')+'" class="grid"></div>';
		html+='<div id="c'+arr.join('" class="grid"></div><div id="c')+'" class="grid"></div>';
		return html;
	},
	//游戏启动方法
	start:function(){ 
		var div=document.getElementById("gridPanel");
		div.innerHTML=this.getInnerHTML();
		div.style.width=this.CN*this.CSIZE+this.MARGIN*(this.CN+1)+"px";
		div.style.height=this.RN*this.CSIZE+this.MARGIN*(this.RN+1)+"px";
		
		this.state=this.RUNNING;
		this.data=[];
		//根据行列初始化data
		for(var r=0;r<this.RN;r++){
			this.data.push([]);
			for(var c=0;c<this.CN;c++){
				this.data[r][c]=0;
			}
		}
		this.score=0;  //重置分数
		this.top1=this.getTop(); //从cookie读取最高分  
		this.randomNum();  //生成2个随机数
		this.randomNum();
		this.updateView();
		var me=this;
		//为当前网页绑定键盘按下事件
		document.onkeydown=function(){
			if(this.state==this.RUNNING){
				var e=window.event||arguments[0];
				switch(e.keyCode){
					case 37:me.moveLeft();break;
					case 39:me.moveRight();break;
					case 38:me.moveUp();break;
					case 40:me.moveDown();break;
				}
			}
		}
		
	},
	//在随机空白位置生成2或4
	randomNum:function(){
		for(;;){
			var r=Math.floor(Math.random()*this.RN);
			var c=Math.floor(Math.random()*this.CN);
			if(this.data[r][c]==0){
				this.data[r][c]=(Math.random()<0.5?2:4);
			}
			break;
		}
	},
	//将data中的数据更新到页面
	updateView:function(){
		for(var r=0;r<this.RN;r++){
			for(var c=0;c<this.CN;c++){
				var div=document.getElementById("c"+r+c);
				if(this.data[r][c]){
					div.innerHTML=this.data[r][c];
					div.className="cell n"+this.data[r][c];
				}else{
					div.innerHTML="";
					div.className="cell";
				}
			}
		}
		//将游戏分数显示在界面上
		document.getElementById("score").innerHTML=this.score;
		//将游戏最高分显示在界面上
		document.getElementById("top").innerHTML=this.top1;
		var div=document.getElementById("gameOver");
		if(this.state==this.RUNNING){
			div.style.display="none";
		}else{
			div.style.display="block";
			document.getElementById("final").innerHTML=this.score;
		}

	},
	//重构所有移动方法的相同部分
	move:function(iterator){
		var before=String(this.data);
		iterator.call(this);
		var after=String(this.data);
		if(before!=after){
			animation.start(function(){
				this.randomNum();
				if(this.isGameOver()){
					this.state=this.GAMEOVER;
					this.score>this.top1&&this.setTop();
				}
				this.updateView();
			}.bind(this));
		}
	},
	//判断游戏结束
	isGameOver:function(){
		for(var r=0;r<this.RN;r++){
			for(var c=0;c<this.CN;c++){
				if(this.data[r][c]==0){return false;}
				else if(c<this.CN-1&&
					this.data[r][c]==this.data[r][c+1]){
					return false;
				}else if(r<this.RN-1&&
					this.data[r][c]==this.data[r+1][c]){
					return false;
				}
			}
		}
		return true;
	},
	//左移所有行
	moveLeft:function(){
		this.move(function(){
			for(var r=0;r<this.RN;this.moveLeftInRow(r),r++);
		});
	},
	//左移第r行
	moveLeftInRow:function(r){
		for(var c=0;c<this.CN-1;c++){
			var nextc=this.getNextInRow(r,c);
			if(nextc==-1){break;}
			else{
				if(this.data[r][c]==0){
					this.data[r][c]=this.data[r][nextc];
					animation.addTask(
						document.getElementById("c"+r+nextc),
						r,nextc,r,c
					);
					this.data[r][nextc]=0;
					c--;
				}else if(this.data[r][c]==this.data[r][nextc]){
					this.score+=this.data[r][c]*=2;
					animation.addTask(
						document.getElementById("c"+r+nextc),	
						r,nextc,r,c
					);
					this.data[r][nextc]=0;
				}
			}
		}
	},
	//查找c之后下一个不为0的位置
	getNextInRow:function(r,c){
		for(var nextc=c+1;nextc<this.CN;nextc++){
			if(this.data[r][nextc]!=0){
				return nextc;
			}
		}
		return -1;
	},
	//右移所有行
	moveRight:function(){
		this.move(function(){
			for(var r=0;r<this.RN;this.moveRightInRow(r),r++);
		});
	},
	//右移第r行
	moveRightInRow:function(r){
		for(var c=this.CN-1;c>0;c--){
			var prevc=this.getPrevInRow(r,c);
			if(prevc==-1){break;}
			else{
				if(this.data[r][c]==0){
					this.data[r][c]=this.data[r][prevc];
					animation.addTask(
						document.getElementById("c"+r+prevc),	
						r,prevc,r,c
					);
					this.data[r][prevc]=0;
					c++;
				
				}else if(this.data[r][c]==this.data[r][prevc]){
					this.score+=this.data[r][c]*=2;
					animation.addTask(
						document.getElementById("c"+r+prevc),	
						r,prevc,r,c
					);
					this.data[r][prevc]=0;
				}
			}
		}
	},
	 //查找c之前前一个不为0的位置
	getPrevInRow:function(r,c){
		for(var prevc=c-1;prevc>=0;prevc--){
			if(this.data[r][prevc]!=0){return prevc;}
		}
		return -1;
	},
	//上移所有列
	moveUp:function(){
		this.move(function(){
			for(var c=0;c<this.CN;this.moveUpInCol(c),c++);
		});
	},
	//上移第c列
	moveUpInCol:function(c){
		for(var r=0;r<this.RN-1;r++){
			var nextr=this.getDownInCol(r,c);
			if(nextr==-1){break;}
			else if(this.data[r][c]==0){
					this.data[r][c]=this.data[nextr][c];
					//找到rc位置的div,加入要移动的位置
					animation.addTask(
						document.getElementById("c"+nextr+c),	
						nextr,c,r,c
					);
					this.data[nextr][c]=0;
					r--;
			}else if(this.data[r][c]==this.data[nextr][c]){
					this.score+=this.data[r][c]*=2;
					animation.addTask(
						document.getElementById("c"+nextr+c),	
						nextr,c,r,c
					);
					this.data[nextr][c]=0;
			}
			
		}
	},
	//找r下方的下一个不为0的行位置
	getDownInCol:function(r,c){
		for(var nextr=r+1;nextr<this.RN;nextr++){
			if(this.data[nextr][c]!=0){
				return nextr;
			}
		}
		return -1;
	},

	//下移所有列
	moveDown:function(){
		this.move(function(){
			for(var c=0;c<this.CN;this.moveDownInCol(c),c++);
	})},
	//下移第c列
	moveDownInCol:function(c){
		for(var r=this.RN-1;r>0;r--){
			var prevr=this.getUpInCol(r,c);
			if(prevr==-1){break;}
			else if(this.data[r][c]==0){
					this.data[r][c]=this.data[prevr][c];
					animation.addTask(
						document.getElementById("c"+prevr+c),	
						prevr,c,r,c
					);
					this.data[prevr][c]=0;
					r++;
			}else if(this.data[r][c]==this.data[prevr][c]){
					this.score+=this.data[r][c]*=2;
					animation.addTask(
						document.getElementById("c"+prevr+c),	
						prevr,c,r,c
					);
					this.data[prevr][c]=0;
			}
		}
	},
	//找r上方的上一个不为0的行位置
	getUpInCol:function(r,c){
		for(var prevr=r-1;prevr>=0;prevr--){
			if(this.data[prevr][c]!=0){return prevr;}
		}
		return -1;
	},
}
window.onload=function(){
	game.start();
}