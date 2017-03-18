/**
 * Created by lenovo on 2016/2/4.
 */
$(function () {
    var $input = $("input");  //输入框
    var $popmenu = $("<div class='autocomplete'></div>").hide().insertAfter("input");  //弹出框
    var selectedItem = null;     //弹出框index
    var timeoutid = null;      //弹出框计时器

    var clear = function () {  //清除弹出框 
        $popmenu.slideUp(200, function () {  //先滑，滑完再清空内容
            $popmenu.empty();
        });
    }


    String.prototype.trim=function(){    //为ie8加入此函数
        return this.replace(/(^\s*)|(\s*$)/g,"");
    }

    $("#input").focus(function () {     //高亮后就显示弹出框
        $popmenu.empty().hide();   //清除现有内容，防止重复出现
        clearTimeout(timeoutid);  //清除上次请求数据

        if ($input.val().trim()) {   //判断，空字符不弹出框
            timeoutid = setTimeout(ajax_request, 100);
        }
    });

    $("#input").blur(function () {
        setTimeout(clear, 200);  //失去焦点后，干掉弹出框
    });

    var setSelectedItem = function (item) {     //弹出框list选择
        selectedItem = item;
        if (selectedItem < 0) {
            selectedItem = $popmenu.find('li').length - 1;
        }
        else if (selectedItem > $popmenu.find('li').length - 1) {
            selectedItem = 0;
        }
        $popmenu.find('li').removeClass('highlight').eq(selectedItem).addClass('highlight');
    }

    var ajax_request = function () {   //ajax服务端通信
        $.ajax({
            'url': 'ajax/datas.txt',
            //'data': {'search-text': $input.val()}, //请求参数（发送请求参数，服务器根据参数判断后响应回制定数据，我这因为没有服务器，就不加了）
            'dataType': 'json',
            'type': 'POST',
            scriptCharset: 'utf-8',  //加上，不然获取中文乱码
            'success': function (data) {
                var keyword = $input.val().trim().charAt(0); //输入框第一个字符为关键字
                var final_keywords=$input.val().trim().replace(/\s*/g,"");
                var pattern=new RegExp("^"+final_keywords,"i");
                var arr=[];//匹配关键词的数组
                if($input.val().trim()){   //生成匹配数组
                    for(var i=0;i<data[keyword].length;i++){
                        if(data[keyword][i].match(pattern)){
                            arr.push(data[keyword][i]);
                        }
                    }
                }
                if (data) {//遍历data
                    $.each(arr, function (index, word) { //创建li标签,添加到下拉列表中
                        var liString="<span>"+final_keywords+"</span>"+word.substr(final_keywords.length);
                        $('<li></li>').html(liString).appendTo($popmenu)
                            .addClass('clickable')
                            .hover(function () {
                                $(this).addClass('highlight').siblings().removeClass('highlight');  //增加高亮选项
                                selectedItem = index;     //跟随index
                            }, function () {   //移出时取消高亮
                                $(this).removeClass('highlight');
                                selectedItem = -1;
                            })
                            .click(function () {
                                $input.val(word);  //点击选项把list内容放入input
                                $popmenu.empty().hide();//然后把弹出式菜单隐藏了
                            });
                    });
                    setSelectedItem(0); //默认高亮第一项
                    $popmenu.slideDown(200);   //获取数据成功后显示
                }
            }
        });
    };

    //键盘事件
    $input.keyup(function (event) {
        if (event.keyCode > 40 || event.keyCode == 8 || event.keyCode == 32) {  //字母数字，退格，空格
            $popmenu.empty().hide();   //防止重复出现
            clearTimeout(timeoutid);
            if ($input.val().trim()) {   //判断，空字符不弹出框
                timeoutid = setTimeout(ajax_request, 100);  //控制请求频率
            }
        }
        else if (event.keyCode == 38) { //上
            selectedItem--;
            setSelectedItem(selectedItem);
            return false;  //阻止事件冒泡,或者event.preventDefault();
        }
        else if (event.keyCode == 40) {//下
            selectedItem++;
            setSelectedItem(selectedItem);
            return false;
        }
    }).keydown(function (event) {//enter键
        if (event.keyCode == 13) {
            $input.val($popmenu.find('li').eq(selectedItem).text());  //按回车把把列表想加入输入框
            $popmenu.empty().hide();  //同时清除弹出框
            return false;
        } else if (event.keyCode == 27) {     //Esc键     //关闭弹出框
            $popmenu.empty().hide();
            return false;
        }
    });



});
