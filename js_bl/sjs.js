document.writeln("<script type='text/javascript' src='ext/jquery/jquery.cookie.min.js'></script>");
document.writeln("<script type='text/javascript' src='ext/jquery/anti-rightkey.js'></script>");
document.writeln("<script type='text/javascript' src='js_bl/WFU-ts-mix.js'></script>");//簡繁轉換
document.writeln("<script type='text/javascript' src='js_bl/language.js'></script>"); //語系
document.writeln("<script type='text/javascript' src='js_bl/jquery.validate.js'></script>"); //表單判斷
document.writeln("<script type='text/javascript' src='js_bl/jquery.lazyload.js'></script>"); //圖片延載
document.writeln("<script type='text/javascript' src='js_bl/append.js'></script>"); //新增js
document.writeln("<script type='text/javascript' src='js_bl/shopping.js'></script>"); //新增js

//toast
document.writeln("<link href='ext/jquery/toast/jquery.toastmessage.css' rel='stylesheet' />");
document.writeln("<script type='text/javascript' src='ext/jquery/toast/jquery.toastmessage.js'></script>");

// 日曆
document.writeln("<link rel='stylesheet' href='ext/jquery/ui/redmond/jquery-ui.css'>");
document.writeln("<script src='ext/jquery/ui/jquery-ui-1.10.3.js'></script>");

var sjs = {
    init : function() {
    "use script";
    //有關會員的頁面，禁止回到上一頁，保護會員資料的安全性
    jQuery("a").click(function(){
      var aHref = jQuery(this).attr("href");
      if (aHref.indexOf("member") != -1){
        window.location.replace(aHref);
        return false;
      }
    });
    //會員登出
    jQuery(".logOff").css("cursor","pointer").click(function(){    
      var len = window.history.length;
      window.history.go(-len);
      window.location.replace("member-logOff.asp?act=logOff");
    }); 

    //幣值選單
    jQuery(".clickCurrency").click(function(){    
      var comCurrency = jQuery(this).attr("id");
      jQuery.cookie("comCurrency",comCurrency,{path:'/'}); 
      sjs.currencyFun();
    });

    //日曆選取-生日用
    if (jQuery('.date').length > 0){
      jQuery('.date').datepicker({'yearRange': '-100:+0'});
      if (window.matchMedia('(max-width: 767px)').matches) {
        jQuery(".date").get(0).setAttribute("type","date");
        var dateClass = "dateMoble";
      } else {
        jQuery(".date").get(0).setAttribute("type","text");
        var dateClass = "date";
      }
      if (jQuery("input[class*='date']").length > 0){
        jQuery("input[class*='date']").each(function(){
          if (dateClass == "dateMoble"){
            jQuery(this).datepicker("destroy");
          }else{
            jQuery(this).datepicker("enable" );
          }
        });
      }
    }  

    //語言切換
    jQuery("#flang").change(function(){   //下拉
		sjs.langFun(jQuery(this).val());      
    });    
    jQuery(".flang a").css("cursor","pointer").click(function(){ //點選
		//sjs.langFun(jQuery(this).attr("lang"));  
		var blanguage = jQuery(this).attr("lang"); 
		//alert(blanguage);
		$.post("boss/blang.php",{pvar:blanguage},function(data){
			//var json = jQuery.parseJSON(data);
			//alert(json);
			if(data==0){
				//window.alert("success!");
				location.replace(location);
			}
		});
    }); 
	/*
    var lang = jQuery.cookie("flanguage");  
    if (lang == null || lang == ""){var lang = "tw";}
    if (lang != "tw"){
      jQuery.getScript("js_bl/jquery.validate_"+lang+".js");
    }
	*/
    //前台下拉顯示目前語系
    if (jQuery("select#flang").length > 0){  
      jQuery("select#flang").find("option").each(function(i){
        if (jQuery(this).val() == lang){
          jQuery("select#flang").prop("selectedIndex",i);
          return false;
        }
      }); 
    }
    //前台點選顯示目前語系
    jQuery(".flang a").each(function(){    
      jQuery(this).addClass("cancel");
      if (jQuery(this).attr("lang") != null && jQuery(this).attr("lang") == lang){
        jQuery(this).removeClass("cancel");
      }
    });

    //後台顯示目前語系
    jQuery(".lang a").each(function(){
      jQuery(this).removeClass("backlang");
      if (jQuery(this).attr("lang") != null && jQuery(this).attr("lang") == lang){
        jQuery(this).addClass("backlang");
      }
    });

    //驗證碼更換
	/*
    jQuery(".captcha").click(function(){
      jQuery(this).attr("src","captcha/captcha.asp?r=" + Math.random());
    });
	*/
  },
  currencyFun : function(){
    var comCurrency = jQuery.cookie("comCurrency");
    switch (comCurrency){
      case "USD": var excStr = "美金 $";break;
      case "CNY": var excStr = "人民幣 ¥";break;
      default: var excStr = "台幣 NT";
    }
    jQuery("#currencyShow").text(excStr);
    shopping.carryFun();
    sjs.excFun();
  }, //currencyFun     
  excFun :function(){
    /*貨幣換算*/
    var comCurrency = jQuery.cookie("comCurrency"); 
    if (comCurrency == null){
      var comCurrency = "TWD";
      jQuery.cookie("comCurrency",comCurrency,{path:'/'}); 
    }
    //擷取台銀匯率
    jQuery.getJSON("bl_excjson.asp?currencys="+comCurrency,function(data, textStatus){
      jQuery.cookie(comCurrency+"_rate",data.buyCash,{path:'/'});
    });
    var rate = jQuery.cookie(comCurrency+"_rate");

    switch (comCurrency){
      case "USD":
        var exDecimal = 100;var exRate = rate;var exCurr = "US$";break;
      case "CNY":
        var exDecimal = 10;var exRate = rate;var exCurr = "CNY¥";break;          
      default:
        var exDecimal = 1;var exRate = 1;var exCurr = "NT$";
    }
    //exDecimal = 100 小數兩位，exDecimal = 10 小數一位

    jQuery(".price, .price-old, .tot").each(function(){
      var pricehtmlVal = jQuery(this).html().trim();
      priceDim = pricehtmlVal.split("$");
      TitlepriceVal = "";
      for (pi=1;pi<priceDim.length;pi++){
        var priceVal = priceDim[pi].replace("</del>","");
        if (TitlepriceVal != ""){TitlepriceVal += ",";}
        TitlepriceVal += priceVal;

        if (jQuery(this).attr("title") == null && pi==priceDim.length-1){  
          jQuery(this).attr("title",TitlepriceVal);    //將台幣金額記錄到title
        }else{
          if (jQuery(this).attr("title") != null && !jQuery(this).hasClass("carry")){
            TitlepriceVal = jQuery(this).attr("title");  //取出台幣金額
          }
        }

        if (!jQuery(this).hasClass("totalTWD")){            
          if (pricehtmlVal.indexOf(exCurr) == -1){ //有對應的幣別代表已換算過，就不用再換
            var price = commafyRemove(shopping.priceFun(priceVal));
            if (price >= 0){   
              TitlepriceValDim = TitlepriceVal.split(",");
              var pvalue = parseFloat(price/exRate);
              var exPrice = parseFloat(Math.round(pvalue*exDecimal))/exDecimal;
              var pricehtmlVal = jQuery(this).html().trim();
              jQuery(this).html(pricehtmlVal.replace("$"+TitlepriceValDim[pi-1],exCurr+exPrice));
            }
          }
        }
        
      }
    });
   shopping.totalFun();
  },//sjsFun
  langFun:function(val){
    var flanguage = val;   
    jQuery.cookie("flanguage",flanguage,{path:'/'});     
    document.location.href = location.href;
  }
};

jQuery(document).ready(function() {  
  sjs.init();  
}); //jQuery
