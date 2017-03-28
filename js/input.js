$(function(){
	(function($,window){
		"use strict";
		window.InputTask={
			$input:$("input"),
			$popmenu:$("<div class='autocomplete'></div>").hide().insertAfter("input"),  //弹出框
			selectedItem:null,     //弹出框index
            timeoutid:null,    //弹出框计时器

            bindEvent:function(){
                var self=this;
                self.$input.focus(function(){ //高亮后就显示弹出框
                	self.$popmenu.empty().hide();   //清除现有内容，防止重复出现
		            clearTimeout(self.timeoutid);  //清除上次请求数据

		            if (self.$input.val().trim()) {   //判断，空字符不弹出框
		                self.timeoutid = setTimeout(function(){
		                	self.ajax_request();
		                }, 100);
		            }
                });
                self.$input.blur(function(){self.clear();});

                //键盘事件
                self.$input.keyup(function (event) {
		            if (event.keyCode > 40 || event.keyCode == 8 || event.keyCode == 32) {  //字母数字，退格，空格
		                self.$popmenu.empty().hide();   //防止重复出现
		                clearTimeout(self.timeoutid);
		                if (self.$input.val().trim()) {   //判断，空字符不弹出框
		                    self.timeoutid = setTimeout(function(){
		                    	self.ajax_request();
		                    }, 100);  //控制请求频率
		                }
		            }
		            else if (event.keyCode == 38) { //上
		                self.selectedItem--;
		                self.setSelectedItem(self.selectedItem);
		                return false;  //阻止事件冒泡,或者event.preventDefault();
		            }
		            else if (event.keyCode == 40) {//下
		                self.selectedItem++;
		                self.setSelectedItem(self.selectedItem);
		                return false;
		            }
		        }).keydown(function (event) {//enter键
		            if (event.keyCode == 13) {
		                self.$input.val(self.$popmenu.find('li').eq(self.selectedItem).text());  //按回车把把列表想加入输入框
		                self.$popmenu.empty().hide();  //同时清除弹出框
		                return false;
		            } else if (event.keyCode == 27) {     //Esc键     //关闭弹出框
		                self.$popmenu.empty().hide();
		                return false;
		            }
		        });
            },

            //清除弹出框 
            clear:function(){
                var self=this;
                self.$popmenu.slideUp(200, function () {  //先滑，滑完再清空内容
                    self.$popmenu.empty();
                });
            },

            setSelectedItem:function(item){
            	var self=this;
            	self.selectedItem=item;
            	if (self.selectedItem < 0) {
	                self.selectedItem = self.$popmenu.find('li').length - 1;
	            }
	            else if (self.selectedItem > self.$popmenu.find('li').length - 1) {
	                self.selectedItem = 0;
	            }
	            self.$popmenu.find('li').removeClass('highlight').eq(self.selectedItem).addClass('highlight');
            },

            //ajax服务端通信
            ajax_request:function(){ 
            	var self=this;
            	$.ajax({
            		'url': 'ajax/datas.txt',
            		'dataType': 'json',
            		'type': 'POST',
            		scriptCharset: 'utf-8',  //加上，不然获取中文乱码
            		success:function(data){
            			var keyword=self.$input.val().trim().charAt(0), //输入框第一个字符为关键字
            				final_keywords=self.$input.val().trim().replace(/\s*/g,""),
            				pattern=new RegExp("^"+final_keywords,"i"),
            				arr=[];//匹配关键词的数组
            			if(self.$input.val().trim()){//生成匹配数组
            				for(var i=0;i<data[keyword].length;i++){
            					if(data[keyword][i].match(pattern)){
	                                arr.push(data[keyword][i]);
	                            }
            				}
            			}
            			if(data){//遍历data
            				$.each(arr,function(index, word){//创建li标签,添加到下拉列表中
            					var liString="<span>"+final_keywords+"</span>"+word.substr(final_keywords.length);
            					$('<li></li>').html(liString).appendTo(self.$popmenu)
            					.addClass('clickable')
            					.hover(function(){
            						$(this).addClass('highlight').siblings().removeClass('highlight');  //增加高亮选项
                                    self.selectedItem = index;     //跟随index
            					},function(){ //移出时取消高亮
            						 $(this).removeClass('highlight');
                                     self.selectedItem = -1;
            					})
            					.click(function(){
            						self.$input.val(word);  //点击选项把list内容放入input
                                    self.$popmenu.empty().hide();//然后把弹出式菜单隐藏了
            					});
            				});
							self.setSelectedItem(0); //默认高亮第一个
							self.$popmenu.slideDown(200);   //获取数据成功后显
            			}
            		}
            	});
            }
		}
	})(jQuery,window);

	InputTask.bindEvent();
});