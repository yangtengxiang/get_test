	var main,main2;
			//map,地图,用来区分地图1地图二
			function Main(Map) {
				var main=this;
				this.state=2;/*游戏状态  代表是否可以进行游戏应有的操作  
				0	任意操作，代表游戏中
				1      暂停
				2      游戏结束或未开始
				3      手动输入时的状态 
				* */
				//仅为打印作用的变量
				var count = 1;
				//计时器
				this.Time;
				this.timeValue=0;//当前时间值（秒）
				this.allDiv = Map;//临时使用
				//当前地图的坐标排序，【x】【y】
				this.x = getArray(9);
				//用来存放错误，相对来说只是临时使用
				this.errorDiv = [];
				//用来存放数据的类
				function item(x, y, html) { 
					this.x = x;
					this.y = y;
					this.value = 0;
					this.html = html;
					this.optional = [true, true, true, true, true, true, true, true, true];
					this.optionalNumber = 9;
				}
				//为x赋值
				for (var i = 0, x = 0, y = 0; i < this.allDiv.length; i++) {
					if (y == 9) {
						x++;
						y = 0;
					}
					this.x[x][y] = new item(x, y, this.allDiv[i]);
					y++;
				}
				
				//添加set方法
				item.prototype.setValue = function(v,del) {
					this.value = v;
					if (v == 0 || v ==" ") {
						this.html.innerHTML = "";
						return;
					} else this.html.innerHTML = v;
					//如果不为0 并且第二个参数为true  删除候选数
					if(del==true){
						var x = this.x;
						var y = this.y;
						var num = main.x[x][y].value - 1;
						var z = parseInt(y / 3) + parseInt(x / 3) * 3;
						for (var i = 0; i < 9; i++) {
							main.x[x][i].removeOptional(num);
							main.x[i][y].removeOptional(num);
							main.getZ(z, i).removeOptional(num);
						}
					}
				}
				//添加removeOptional方法  删除候选数  是否添加返回成功失败？
				item.prototype.removeOptional = function(v) {
					if (this.optional[v]) {
						this.optional[v] = false;
						this.optionalNumber--;
						return true;
					}
					return false;
				}
				//当前div
				this.curItem = this.x[0][0];
				//需要锁定的单元格  默认全部不锁定,即该坐标值为0或false  锁定值为1(不为0)或true
				this.lock = getArray(9, false, 9);
				//当前div改变事件  点击
				this.curChange = function(cur) {
					this.clearSign();
					this.curItem = this.x[parseInt(cur.dataset.x)][parseInt(cur.dataset.y)];
					this.sign();
				}
				//当前div改变事件  键盘
				this.move = function(x, y) {
					this.clearSign();
					if(parseInt(this.curItem.y) + y >=9) x++;
					var x = (parseInt(this.curItem.x) + x + 9) % 9;
					var y = (parseInt(this.curItem.y) + y + 9) % 9;
					this.curItem = this.x[x][y];
					this.sign();
				}
				//当前div值改变
				this.valueChange = function(value) {
					if(this.lock[parseInt(this.curItem.x)][parseInt(this.curItem.y)])return;
					this.clearSign();
					this.curItem.setValue(value);
					this.checkError(); //检查错误
					//每次打印  ,没用的
					this.WriteLog("第"+count++ + "次输入验证完成" + (this.errorDiv.length == 0 ? "没有错误" : ("共有" + this.errorDiv.length / 2 + "个错误")))
					if (this.errorDiv.length == 0) {
						if (this.checkFull()){Victory();console.log("游戏胜利")}  //暂时不做处理
					}
					//标记
					this.sign();
				}
				//根据参数返回单元格 z指大九宫格内的9个小九宫格  z2指小九宫格内的九个 从左到右,从上到下
				this.getZ = function(z, z1) {
					return this.x[parseInt(z / 3) * 3 + parseInt(z1 / 3)][parseInt(z % 3) * 3 + z1 % 3];
				}
				//对当前地图进行判断是否有错误，返回数组
				this.checkError = function() {
					this.errorDiv = []; //每次重置错误名单
					var Value = [getArray(9, 0, 9), getArray(9, 0, 9), getArray(9, 0, 9)];
					//录入x轴y轴z轴
					for (var x = 0; x < 9; x++) {
						for (var y = 0; y < 9; y++) {
							if (this.x[x][y].value > 0) Value[0][x][parseInt(this.x[x][y].value) - 1]++; //x
							if (this.x[y][x].value > 0) Value[1][x][parseInt(this.x[y][x].value) - 1]++; //y
							var curZ = this.getZ(x, y); //z
							if (curZ.value > 0) Value[2][x][parseInt(curZ.value) - 1]++;
						}
					} //console.log(Value);
					//录入完成后检查是否有重复,如果有则添加进错误名单
					for (var x = 0; x < 9; x++) {
						for (var y = 0; y < 9; y++) {
							if (Value[0][x][y] > 1) { //x轴(每一横排)
								for (var i = 0; i < 9; i++) {
									if (this.x[x][i].value == y + 1) this.errorDiv.push(this.x[x][i]);
								}
							}
							if (Value[1][y][x] > 1) { //y轴(每一竖列)
								for (var i = 0; i < 9; i++) {
									if (this.x[i][y].value == x + 1) this.errorDiv.push(this.x[i][y]);
								}
							}
							if (Value[2][x][y] > 1) { //z轴(每一宫)
								for (var i = 0; i < 9; i++) {
									if (this.getZ(x, i).value == y + 1) this.errorDiv.push(this.getZ(x, i));
								}
							}
						}
					}
					//添加完毕,返回错误名单--------------------------是否返回bool？   是否清除重复？
					return this.errorDiv;
				}
				//标记  目前并不打算把标记分开  sign 标记
				this.sign = function() {
					//  锁定-    范围  -相同数字  -错误  -锁定且错误
					var sd = "#C8C49E",//sd = "#852909",
						fw = "#F0E5CA",
						xt = "#489BA4",
						err = "#F76F6F",
						xtErr = "#",
						cur = "#4ECABD";
					//锁定
					for (var x = 0; x < 9; x++) {
						for (var y = 0; y < 9; y++) {
							if (this.lock[x][y]) {
								this.x[x][y].html.style = "background:" + sd + ";color:#111;"
							}
						}
					}
					//没值标记范围,有值标记数字
					if (this.curItem.value == 0) {
						//标记当前范围
						for (var i = 0, x = this.curItem.x, y = this.curItem.y, z = parseInt(this.curItem.x / 3) * 3 + parseInt(this.curItem.y /
								3); i < 9; i++) {
							this.x[x][i].html.style.background = fw;
							this.x[i][y].html.style.background = fw;
							this.getZ(z, i).html.style.background = fw;
						}
					} else { //相同数字
						for (var i = 0, value = parseInt(this.curItem.value); i < 9; i++) {
							for (var o = 0; o < 9; o++) {
								if (this.x[i][o].value == value) this.x[i][o].html.style.background = xt;
							}
						}
					}
					//错误
					for (var i = 0; i < this.errorDiv.length; i++) {
						this.errorDiv[i].html.style.background = err;
					}
					this.curItem.html.style.background = cur; //当前div
				}
				//清除标记    sign 标记
				this.clearSign = function() {
					for (var x = 0; x < 9; x++) {
						for (var y = 0; y < 9; y++) {
							this.x[x][y].html.style = "";
						}
					}
				}
				//检查是否所有单元格都有数字（占满）  Victory 胜利
				this.checkFull = function() {
					for (var x = 0; x < 9; x++) {
						for (var y = 0; y < 9; y++) {
							if (this.x[x][y].value == 0) return false;
						}
					}
					return true;
				}
				//锁定某些单元格    --可以添加一个锁定当前单元格的方法 (也可以同事添加验证，符合后才锁定)
				this.lockDiv = function(arrhtml) {  }
				//锁定现有值的单元格
				this.lockNotNullDiv = function() {
					for (var x = 0; x < 9; x++) {
						for (var y = 0; y < 9; y++) {
							if (this.x[x][y].value > 0) this.lock[x][y] = true;
						}
					}
				}
				//计时显示函数
				this.timing =  function() {
					var tmp=main.timeValue;
					document.querySelector(".time").innerText=parseInt(tmp/60)+":"+(tmp%60<10? "0"+tmp%60 : tmp%60);
					main.timeValue++
				}
				//重置地图（九宫格内是所有没有锁定的格子的值）
				this.clearItemValue = function() {
					for (var x = 0; x < 9; x++) {
						for (var y = 0; y < 9; y++) {
							if (this.x[x][y].value > 0&&(!this.lock[x][y]))this.x[x][y].setValue(0);
						}
					}
				}
				this.clearlock=function(){
					this.lock=getArray(9, false, 9);
				}
				//返回一个二维数组,一维的大小是w1.value!=undefined代表需要初始化值,这时w2生效为第二维的长度
				function getArray(w1, value, w2) {
					var array = [];
					for (var i = 0; i < w1; i++) {
						array[i] = []; //正常添加第二维数组
					}
					if (value != undefined) { //初始化
						for (var i = 0; i < w1; i++) {
							for (var o = 0; o < w2; o++) {
								array[i][o] = value;
							}
						}
					}
					return array;
				}
				//拷贝整个地图，深度拷贝
				this.copyAllItem = function() {
					var all = getArray(9);
					for (var x = 0; x < 9; x++) {
						for (var y = 0; y < 9; y++) {
							var c = this.x[x][y];
							var tmp = new item(x, y, c.html);
							tmp.value = c.value;
							tmp.optionalNumber = c.optionalNumber;
							for (var i = 0; i < 9; i++) {
								tmp.optional[i] = c.optional[i]
							}
							all[x][y] = tmp;
						}
					}
					return all;
				}
				//数独计算器
				this.Calculator = function() {
					var m = this;
					//var sd = this.lock;
					//计算前检查错误
					if(this.checkError().length > 0) {alert("请检查您的数独是否有错误");return;}
					//每次计算前对加候选数筛选
					for (var x = 0; x < 9; x++) {
						for (var y = 0; y < 9; y++) {
							this.x[x][y].optional = [true, true, true, true, true, true, true, true, true];
							this.x[x][y].optionalNumber=9;
						}
					}
					for (var x = 0; x < 9; x++) {
						for (var y = 0; y < 9; y++) {
							this.x[x][y].setValue(this.x[x][y].value,true);
						}
					}
					function backup(i, value) {
						this.allItem = m.copyAllItem();
						this.curItem = new item(i.x, i.y, i.html);
						this.curItem.value = i.value;
						this.curItem.optionalNumber = i.optionalNumber;
						for (var o = 0; o < 9; o++) {
							this.curItem.optional[o] = i.optional[o]
						}
						
					}
					var recordNext = [];
					var aaa = 2; 
					+function cs() {
						var next = function() { //找出下一个候选数最少的数字,
							var min = 10;
							var next;
							for (var x = 0; x < 9; x++) {
								for (var y = 0; y < 9; y++) {
									if (m.x[x][y].optionalNumber < min && m.x[x][y].value == 0) {
										next = m.x[x][y];
										min = next.optionalNumber;
									}
								}
							}
							return next;
						}();

						if(next==undefined){
							m.WriteLog("计算完毕");
							return;
							
						}
						
						//填入候选数第一个，，并递归下一次   执行环境
						if (next.optionalNumber != 0) {
							if(next.optionalNumber==1){//只有一个候选数时不记录
								for (var i = 0; i < 9; i++) {
									if (next.optional[i]) {
										next.setValue(i + 1,true);
										m.WriteLog("位置x：" + next.x + " y：" + next.y + "填入唯一可选数" + next.value);
										cs();return;
									}
								}
							}
							else{//取出随机一个可用候选数
								var tmpArray=[];
								var tmpstr=" ";
								for (var i = 0; i < 9; i++) {
									if (next.optional[i]) {
										tmpArray.push(i);
										tmpstr+=++i +" ";
									}
								}
								var i=tmpArray[ parseInt( Math.random()*tmpArray.length)];
								next.removeOptional(i);
								recordNext.push(new backup(next, i))
								next.setValue(i + 1,true);
								m.WriteLog("位置x：" + next.x + " y：" + next.y + "具有多个可选数，填入" + next.value+"可选数"+tmpstr+"已记录");
								cs();return; 
							}
						} else {
							previous();
						}
						function previous(){
							var tmp = recordNext[recordNext.length - 1];
							if(tmp==undefined){alert("该题无解");return;}
							if(next) m.WriteLog("位置x"+next.x+"y"+next.x+"出错，返回至上一次记录的位置x："+tmp.curItem.x+"y:"+tmp.curItem.y);
							var nextOptional = function() {
								var tmpArray=[];
								for (var i = 0; i < 9; i++) {//取出随机一个可用候选数
									if (tmp.curItem.optional[i]) {
										tmpArray.push(i);
									}
								}
								if(tmpArray.length==0) return null;
								return tmpArray[ parseInt( Math.random()*tmpArray.length)]+1;
								
								
							}();
							//出错  如果候选数为空，返回上一个重算
							if (nextOptional == null) {
								previous2();
								return;
							}
							//替换地图
							m.x = tmp.allItem;
							m.x[tmp.curItem.x][tmp.curItem.y] = tmp.curItem;
							tmp.curItem.setValue(nextOptional,true);
							cs(); return;
						}
						function previous2(){
								recordNext.pop();
								var tmp2 = recordNext[recordNext.length - 1];
								m.x = tmp2.allItem;
								m.x[tmp2.curItem.x][tmp2.curItem.y] = tmp2.curItem;
								cs(); return;
						}
					}()
					/*
					for (var x = 0; x < 9; x++) {
						for (var y = 0; y < 9; y++) {
							m.x[x][y].html.innerText = m.x[x][y].value==0? "":m.x[x][y].value;
						}
					}*/
				}
				//数独生成
				this.Issue = function(difficulty) {//difficulty  难度
					if(difficulty==undefined) difficulty=30;
					//清除地图
					this.lock=getArray(9, false, 9);
					this.clearItemValue();
					//随机输入12个数字
					function getNum(){ return parseInt(Math.random()*9) }
					for(var i=0; i<12; i++){
						do{
							var x=getNum();
							var y=getNum();
							this.x[x][y].setValue(getNum());
							if(this.checkError().length) this.x[x][y].setValue(0);
							else break;
						}while(true)
					}
					//然后计算得出地图全部
					this.Calculator();
					//锁定其中多少个
					var i=0;
					while( i < difficulty){
						var x=getNum();
						var y=getNum();
						if(!this.lock[x][y]){
							this.lock[x][y]=true;
							i++
						}
					}
					//清除没有锁定的
					this.clearItemValue();
				}
				//打印日志
				this.WriteLog = function(value) {
					var log=document.querySelector("textarea");//打印日志
					/*onpropertychange="this.scrollTop = this.scrollHeight " 
					onfocus="this.scrollTop = this.scrollHeight " 
					onchange="this.scrollTop = this.scrollHeight "*/
					log.innerHTML=log.innerHTML+value+"&#10;";
					log.scrollTop = log.scrollHeight;
				}
			}
			//键盘事件
			function keydown(e) {
				//console.log(e)
				if(main.state && main.state != 3) return;
				if (e.key == " " || e.key == "0" || e.key == "Backspace" || e.key == "Delete") {
					main.valueChange(0);
				} else if (e.key == "1") {
					main.valueChange(1);
				} else if (e.key == "2") {
					main.valueChange(2);
				} else if (e.key == "3") {
					main.valueChange(3);
				} else if (e.key == "4") {
					main.valueChange(4);
				} else if (e.key == "5") {
					main.valueChange(5);
				} else if (e.key == "6") {
					main.valueChange(6);
				} else if (e.key == "7") {
					main.valueChange(7);
				} else if (e.key == "8") {
					main.valueChange(8);
				} else if (e.key == "9") {
					main.valueChange(9);
				} else if (e.key == "ArrowUp") {
					main.move(-1, 0)
				} else if (e.key == "ArrowRight") {
					main.move(0, 1)
				} else if (e.key == "ArrowDown") {
					main.move(1, 0)
				} else if (e.key == "ArrowLeft") {
					main.move(0, -1)
				} //else {}
			}
			//文档加载事件
			window.onload = function() {
				//绑定事件
				var map=document.querySelectorAll("#mainMap div");
				main = new Main(map);
				for (var i = 0; i < main.allDiv.length; i++) {
					main.allDiv[i].onclick = function(){if(main.state && main.state != 3) return;main.curChange(this);};
				}
				/*
				for (var x = 0; x < 9; x++) {
					for (var y = 0; y < 9; y++) {
						main.x[x][y].value=main.x[x][y].html.innerText;
					}
				}*/
				//首次提示游戏规则
				document.querySelector(".btn").style.display="block";
				//（复选框值改变事件）显示高级功能、显示日志,对比模式
				document.querySelector(".main h1 span input.senior").onchange=SeniorShow;
				document.querySelector(".main .bottom .function span input.ckbLog").onchange=LogShow;
				document.querySelector(".main .bottom .function span input.contrast").onchange=contrast;
				//求解
				document.getElementById("solve").onclick=Solve;
				//第一次是开始游戏，以后做暂停或继续游戏用
				document.querySelector(".start").onclick=Start;
				//正式开始游戏，生成地图，随机生成
				document.querySelector(".end").onclick=Random;
				//暂停
				document.getElementById("btn").onclick=Stop;
				//重新开始
				document.getElementById("reset").onclick=Reset;
				//手动输入
				document.getElementById("Manual").onclick=Manual;
				//加载完成后自动打开高级功能
				document.querySelector(".main h1 span input.senior").checked=true;
				SeniorShow();
			}
			//开始游戏
			function Start(){
				if(main.state==2){
					document.querySelector(".start").style.display="none";
					document.querySelector(".btn p").style.display="block";
					document.querySelector(".end").style.display="block";
				}else {alert("开始游戏失败，请刷新页面后重试！")}
			}
			//随机生成
			function Random(){
				if(main.state==2){
					document.querySelector(".btn").style.display="none";
					document.querySelector(".start").style.display="none";
					document.querySelector(".btn p").style.display="none";
					document.querySelector(".end").style.display="none";
					main.clearSign();
					//随机生成，并锁定
					main.Issue(function(){//根据玩家选择返回对应难度
						if(document.getElementById("high").checked) return 26;
						else if(document.getElementById("middle").checked) return 38;
						else return 45;
					}());
					main.curItem=main.x[0][0];
					main.sign();
					//计时器开始
					main.Time=setInterval(main.timing,1000);
					main.state=0;
					main.timeValue=0;
					main.count=0;
				}else {alert("开始游戏失败，请刷新页面后重试！")}
			}
			//暂停，开始
			function Stop(){
				if(main.state==0){//游戏中,暂停游戏
					document.querySelector(".btn").style.display="block";
					document.querySelector(".start").style.display="block";
					document.querySelector(".start").value="继续游戏";
					document.querySelector(".start").onclick=Stop;
					document.getElementById("btn").value="继续游戏";
					clearInterval(main.Time);
					//main.Time=undefined;
					main.state=1;
				}else if(main.state==1){//暂停中,恢复游戏
					document.querySelector(".btn").style.display="none";
					document.querySelector(".start").style.display="none";
					document.getElementById("btn").value="暂停游戏";
					main.Time=setInterval(main.timing,1000);
					main.state=0;
				}else{alert("请先开始游戏")}
			}
			//胜利
			function Victory(){
				document.querySelector(".btn").style.display="block";
				document.querySelector(".start").style.display="block";
				document.querySelector(".start").value="再来一局";//目前只有一个选项
				document.querySelector(".start").onclick=Random;
				clearInterval(main.Time);
				main.state=2;
				if(document.querySelector(".main .bottom span input.contrast").checked){
					document.querySelector(".main .bottom span input.contrast").checked=false;
					contrast();
				}
				alert("游戏胜利");
			}
			//求解
			function Solve(){
				if(main.state){
					alert("请先开始游戏");
					return;
				}
				main.Calculator()
			}
			//重新开始游戏
			function Reset(){
				if(main.state==2){
					Random();//可以直接开始游戏也可弹窗提示
				}else{
					if(confirm("你要放弃本局游戏吗？")) {
						if(main.state==1) {
							document.getElementById("btn").value="暂停游戏";
						}
						main.clearlock();
						main.clearItemValue();
						main.state=2;
						if(document.querySelector(".main .bottom span input.contrast").checked){
							document.querySelector(".main .bottom span input.contrast").checked=false;
							contrast();
						}
						clearInterval(main.Time);
						Random();
					}
				}
			}
			//手动输入
			function Manual(){
				var bt=document.getElementById("Manual");
				if(main.state < 2) {
					if(confirm("你要放弃本局游戏吗？")){
						main.clearlock();
						main.clearItemValue();
						main.clearSign();
						clearInterval(main.Time);
					}else return;
				}
				if(bt.value=="手动输入"){
					document.querySelector(".btn").style.display="none";
					document.querySelector(".start").style.display="none";
					document.querySelector(".btn p").style.display="none";
					document.querySelector(".end").style.display="none";
					if(document.querySelector(".main .bottom span input.contrast").checked){
						document.querySelector(".main .bottom span input.contrast").checked=false;
						contrast();
					}
					main.state=3;
					bt.value="输入完成";
				}else{
					if(main.checkError().length){ alert("该题有错误，请确认！");return}
					main.lockNotNullDiv();
					main.Time=setInterval(main.timing,1000);
					main.sign();
					main.state=0;
					main.timeValue=0;
					main.count=0;
					bt.value="手动输入";
				}
			}
			//显示/隐藏高级功能
			function SeniorShow(){
				var ckb=document.querySelector(".main h1 span input.senior");
				var Senior=document.querySelector(".bottom .function");
				if(ckb.checked){
					Senior.style.display="block";
				}
				else{
					Senior.style.display="none";
				}
			}
			//显示/隐藏日志 同时显示/隐藏
			function LogShow(){
				var ckb=document.querySelector(".main .bottom span input.ckbLog");
				var log=document.querySelector(".main .bottom textarea");
				if(ckb.checked){
					log.style.display="block";
					log.scrollTop = log.scrollHeight;
					document.querySelector(".main").style.top="130px";
					document.querySelector(".main h1").style.top="-96px";
					document.querySelector(".main .coord").style.display="block";
				}
				else{
					log.style.display="none";
					document.querySelector(".main h1").style="";
					document.querySelector(".main").style="";
					document.querySelector(".main .coord").style.display="none";
				}
			}
			//打开/关闭对比模式
			function contrast(){
				var ckb=document.querySelector(".main .bottom span input.contrast");
				var m1=document.querySelector("#mainMap");
				var cmain=document.querySelector(".main");
				if(ckb.checked){
					if(main.state!=0) {
						alert("请先开始游戏");
						ckb.checked=false;
						return;
					}
					var m2=document.createElement("div");//第二个地图
					m2.className="jgg";//设置类和id
					m2.id="viceMap";
					m2.innerHTML=(function(){//用js生成九宫格的div，同时对其添加x，y
						var x = 0,y = 0;
						var html = "";
						for (var i = 0; i < 81; i++) {
							if (y > 8) {y = 0;x++}
							html += `<div data-x="${x}" data-y="${y++}"></div>`;
						}
						return html;
					})();
					cmain.appendChild(m2);
					cmain.style.width="1200px";
					m2.style.left="680px";
					main2=new Main(m2.querySelectorAll("div"));//
					for (var x = 0; x < 9; x++) {
						for (var y = 0; y < 9; y++) {
							main2.x[x][y].setValue(main.x[x][y].value);
						}
					}
					main2.lock=main.lock;
					main2.Calculator();
					//main2.sign();
				}
				else{
					cmain.style.width="";
					document.getElementById("viceMap").remove();
					main2=null;
				}
				}