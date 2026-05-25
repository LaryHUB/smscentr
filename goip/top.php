
<html>
<meta name="Author" content="Gaby_chen">
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<title></title>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<style type="text/css">
a:link { color:#000000;text-decoration:none}
a:hover {color:#666666;}
a:visited {color:#000000;text-decoration:none}

td {FONT-SIZE: 9pt; FILTER: dropshadow(color=#FFFFFF,offx=1,offy=1); COLOR: #000000; FONT-FAMILY: "瀹嬩綋"}
img {filter:Alpha(opacity:100); chroma(color=#FFFFFF)}
</style>
<base target="main">
<script>
/*
function preloadImg(src)
{
	var img=new image();
	img.src=src
}
preloadImg("images/admin_top_open.gif");
*/
var displayBar=true;
function switchBar(obj)
{
	if (displayBar)
	{
		parent.frame.cols="0,*";
		displayBar=false;
		obj.src="images/admin_top_open.gif";
		obj.title="打开左边管理功能表";
	}
	else{
		parent.frame.cols="180,*";
		displayBar=true;
		obj.src="images/admin_top_close.gif";
		obj.title="关闭左边管理功能表";
	}
}
//onload="alert('hello')";
</script>
</head>

<body background="images/admin_top_bg.gif" leftmargin="0" topmargin="0" >
<table height="100%" wIdth="100%" border=0 cellpadding=0 cellspacing=0>
<tr valign=mIddle>
	<td wIdth=50>
	<img onClick="switchBar(this)" src="images/admin_top_close.gif" title="关闭左边管理功能表" style="cursor:pointer">
	</td>

	<td wIdth=40>
		<img src="images/admin_top_icon_1.gif">
	</td>

	<td wIdth=300>
<?php
define("OK", true);
require_once("global.php");
/*
$rs=$db->fetch_array($query=$db->query("SELECT id FROM message WHERE userid=$_SESSION[goip_userid] and over=2")); 
	if(!empty($rs[0])){
		echo '<a href="cron.php"><font color="#FF0000">您有新完成的定时发送</font></a>    ';
	}
$rs=$db->fetch_array($query=$db->query("SELECT id FROM receive WHERE status=0"));
        if(!empty($rs[0])){
                echo '<a href="receive.php"><font color="#FF0000">您收到新的短信</font></a>';
        }
*/
echo '<span id="goip-clock" data-tz="'.date('T').'" data-offset="'.(date('Z')).'">'.date('Y-m-d H:i:s T').'</span>';
echo '<script>(function(){
    var el = document.getElementById("goip-clock");
    if (!el) return;
    var tz = el.dataset.tz, offset = parseInt(el.dataset.offset, 10) * 1000;
    var serverNow = new Date("'.date('c').'").getTime();
    var localStart = Date.now();
    function pad(n){ return n < 10 ? "0" + n : n; }
    function tick(){
        var t = new Date(serverNow + (Date.now() - localStart));
        var d = new Date(t.getTime() + offset + new Date().getTimezoneOffset()*60000);
        el.textContent = d.getFullYear() + "-" + pad(d.getMonth()+1) + "-" + pad(d.getDate()) + " " +
            pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds()) + " " + tz;
    }
    tick();
    setInterval(tick, 1000);
})();</script>';
?>

<!--
			
-->	
	</td>

	<td wIdth=40>&nbsp;
	</td>
	<td wIdth=100>&nbsp;</td>	
	<td align="right"><!-- <a href="" onClick="parent.location.href='tw/index.php'">切換到繁體版</a> | --><a href="" onClick="parent.location.href='en/index.php'; ">English</a>&nbsp;&nbsp;&nbsp; <?php echo $version." ".$bdate ?></td>
</tr>
</table>
</body>
</html>


