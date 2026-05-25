<?php
        define("OK", true);
        require_once("session.php");
        require_once("global.php");
?>

<html>
<meta name="Author" content="Gaby_chen">
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>后台管理</title>
<style type=text/css>
body  { background:#799AE1; margin:0px; font:9pt 宋体; }
table  { border:0px; }
td  { font:normal 16px 宋体; }
img  { vertical-align:bottom; border:0px; }

a  { font:normal 16px 宋体; color:#000000; text-decoration:none; }
a:hover  { color:#428EFF;text-decoration:underline; }

.sec_menu  { border-left:1px solid white; border-right:1px solid white; border-bottom:1px solid white; overflow:hIdden; background:#D6DFF7; }
.menu_title  { }
.menu_title span  { position:relative; top:2px; left:8px; color:#000000; font-weight:bold; }
.menu_title2  { }
.menu_title2 span  { position:relative; top:2px; left:8px; color:#428EFF; font-weight:bold; }

body { background:#eef3fb; margin:0; font:13px Arial, Helvetica, sans-serif; color:#1f2f46; }
td { font:13px Arial, Helvetica, sans-serif; }
a { color:#1f2f46; text-decoration:none; display:block; padding:4px 8px; border-radius:4px; }
a:hover { color:#1e63c9; background:#eef5ff; text-decoration:none; }
.menu_title, .menu_title2 { height:28px; cursor:pointer; background:#2f5fa8; border-top:1px solid #6f91ca; border-bottom:1px solid #204983; color:#fff; }
.menu_title span, .menu_title2 span { display:block; position:relative; top:0; left:0; padding:6px 8px 5px 18px; color:#fff; font-weight:bold; }
.menu_title span:before, .menu_title2 span:before { content:'\25b8'; position:absolute; left:7px; top:6px; font-size:10px; transition:transform .18s ease; }
.menu_title.open span:before, .menu_title2.open span:before { transform:rotate(90deg); }
.menu_title2 { background:#356bb8; }
.menu_title a, .menu_title2 a { display:inline; padding:0; color:#fff; }
.menu_title a:hover, .menu_title2 a:hover { background:transparent; color:#dbeaff; }
.sec_menu { width:185px; overflow:hidden; background:#f7faff; border-left:1px solid #b7c8e8; border-right:1px solid #b7c8e8; border-bottom:1px solid #b7c8e8; box-shadow:inset 0 1px 0 #fff; transition:max-height .32s ease, opacity .26s ease; }
.sec_menu table { width:177px; margin:3px auto 5px auto; }
.sec_menu td { height:auto; line-height:18px; }
.sec_menu a.active { background:#d9e9ff; color:#0d4fab; font-weight:bold; }
#submenu0 .sec_menu td { padding:3px 8px; color:#33435c; }

</style>
<SCRIPT language=javascript1.2>
function menuEl(id) { return document.getElementById('submenu' + id); }
function titleEl(id) { return document.getElementById('menuTitle' + id); }
function setTitleOpen(id, open) { var t = titleEl(id); if (!t) return; t.className = open ? 'menu_title open' : 'menu_title'; }
function closeSubmenu(id) {
    if (id == 0) return;
    var el = menuEl(id);
    if (!el || el.style.display == 'none') return;
    var box = el.getElementsByTagName('div')[0];
    if (!box) return;
    box.style.maxHeight = box.scrollHeight + 'px';
    setTimeout(function(){ box.style.opacity = 0; box.style.maxHeight = '0px'; }, 10);
    setTitleOpen(id, false);
    setTimeout(function(){ el.style.display = 'none'; }, 320);
}
function closeOtherSubmenus(openId) {
    var cells = document.getElementsByTagName('td');
    for (var i=0; i<cells.length; i++) {
        if (cells[i].id && cells[i].id.indexOf('submenu') === 0) {
            var id = parseInt(cells[i].id.replace('submenu', ''), 10);
            if (id != openId) closeSubmenu(id);
        }
    }
}
function showsubmenu(ClassId) {
    var el = menuEl(ClassId);
    if (!el) return;
    var box = el.getElementsByTagName('div')[0];
    if (!box) return;
    if (el.style.display == 'none') {
        closeOtherSubmenus(ClassId);
        el.style.display = '';
        box.style.opacity = 0;
        box.style.maxHeight = '0px';
        setTitleOpen(ClassId, true);
        setTimeout(function(){ box.style.opacity = 1; box.style.maxHeight = box.scrollHeight + 'px'; }, 20);
    } else {
        closeSubmenu(ClassId);
    }
}
function initMenu() {
    var titles = document.getElementsByTagName('td');
    for (var ti=0; ti<titles.length; ti++) {
        if (titles[ti].id && titles[ti].id.indexOf('menuTitle') === 0) {
            titles[ti].onmouseover = null;
            titles[ti].onmouseout = null;
        }
    }
    var divs = document.getElementsByTagName('div');
    for (var i=0; i<divs.length; i++) {
        if (divs[i].className == 'sec_menu') {
            divs[i].style.maxHeight = divs[i].scrollHeight + 'px';
            divs[i].style.opacity = 1;
        }
    }
    var links = document.getElementsByTagName('a');
    for (var j=0; j<links.length; j++) {
        if (links[j].target == 'main') {
            var oldClick = links[j].onclick;
            links[j].onclick = (function(oldHandler){
            return function(){
                if (oldHandler && oldHandler.call(this) === false) return false;
                for (var k=0; k<links.length; k++) links[k].className = links[k].className.replace(' active', '').replace('active ', '').replace('active', '');
                this.className = (this.className ? this.className + ' ' : '') + 'active';
                if (parent && parent.frames && parent.frames['main']) {
                    parent.frames['main'].location.href = this.href;
                    return false;
                }
                return true;
            };
            })(oldClick);
        }
    }
    setTitleOpen(0, true);
    setTitleOpen(1, true);
}
window.onload = initMenu;
</SCRIPT>
</head>
<BODY leftmargin="0" topmargin="0" marginheight="0" marginwIdth="0">
<table wIdth=185 cellpadding=0 cellspacing=0 border=0 align=left>
    <tr><td valign=top>
<table wIdth=185 border="0" align=center cellpadding=0 cellspacing=0>
  <tr>
  </tr>
</table>
<table cellpadding=0 cellspacing=0 wIdth=185 align=center>
  <tr>
        <td height=25 class=menu_title onmouseover=this.className='menu_title2'; onmouseout=this.className='menu_title';  Id=menuTitle0> 
          <span><a href="main.php" target=main><b>管理首页</b></a> | <a href=logout.php target=_top><b>退出</b></a></span> 
        </td>
  </tr>
  <tr>
    <td style="display:" Id='submenu0'>
<div class=sec_menu style="wIdth:185">
<table cellpadding=0 cellspacing=0 align=center wIdth=177>
<tr><td height=20>用户:<?php echo $_SESSION['goip_username'] ?></td>
</tr>
<tr><td height=20>权限:<?php $adm=array("系统管理员","高级管理员","群管理员","组管理员", "GoIP操作者", "GoIP所有者");echo $adm[$_SESSION['goip_permissions']] ?></td>
</tr>
</table>
</div>
	</td>
  </tr>
</table>
<table cellpadding=0 cellspacing=0 wIdth=185 align=center>
  <tr>
        <td height=25 class=menu_title onmouseover=this.className='menu_title2'; onmouseout=this.className='menu_title';  Id=menuTitle1 onClick="showsubmenu(1)" style="cursor:pointer;"> 
          <span>发送信息</span> </td>
  </tr>
  <tr>
    <td style="display:" Id='submenu1'>
<div class=sec_menu style="wIdth:185">
<table cellpadding=0 cellspacing=0 align=center wIdth=177>
<tr><td height=20><a href="send.php?type=re" target=main>直接发送</a></td>
</tr>
<?php if(!operator_owner_forbid()) {
?>
<tr><td height=20><a href="send.php?type=all" target=main>向所有人发送</a></td>
</tr>
<tr><td height=20><a href="send.php?type=crowd" target=main>群发送</a></td>
</tr>
<tr><td height=20><a href="send.php?type=group" target=main>组发送</a></td>
</tr>
<?php } ?>
<tr><td height=20><a href="xmlfile.php" target=main>xml文件发送</a></td>
</tr>
<tr><td height=20><a href="filesms.php" target=main>新文件发送</a></td>
</tr>
<tr><td height=20><a href="all_send.php" target=main>全体发送设置</a></td>
</tr>
<tr><td height=20><a href="do_all_send.php" target=main onClick="return confirm('确认用所有在线的终端发送短信?')">一键群发</a></td>
</tr>
<tr><td height=20><a href="cron.php" target=main>定时计划查询</a></td>
</tr>
<tr><td height=20><a href="sendinfo.php" target=main>已发送查询</a></td>
</tr>
<tr><td height=20><a href="sms_count.php" target=main>短信发送数量</a></td>
</tr>
<tr><td height=20><a href="receive.php" target=main>收件箱</a></td>
</tr>
<tr><td height=20><a href="ussd_ch.php" target=main>SIM网络服务</a></td>
</tr>
<tr><td height=20><a href="ussdinfo.php" target=main>USSD查询</a></td>                                          
</tr>
</table>
</div>
	</td>
  </tr>
</table>

<table cellpadding=0 cellspacing=0 wIdth=185 align=center>
  <tr>
        <td height=25 class=menu_title onmouseover=this.className='menu_title2'; onmouseout=this.className='menu_title';  Id=menuTitle7 onClick="showsubmenu(7);" style="cursor:pointer;">
          <span>自动查余额与充值</span> </td>
  </tr>
  <tr>
    <td style="display:none" Id='submenu7'>
<div class=sec_menu style="wIdth:185">
            <table cellpadding=0 cellspacing=0 align=center wIdth=177>

<tr><td height=20><a href="recharge.php" target=main>自动查余额与充值</a></td>
</tr>
<tr><td height=20><a href="recharge_card.php" target=main>充值卡号</a></td>
</tr>
            </table>
          </div>
        </td>
  </tr>
</table>


<table cellpadding=0 cellspacing=0 wIdth=185 align=center>
  <tr>
    <td height=25 class=menu_title onmouseover=this.className='menu_title2'; onmouseout=this.className='menu_title';  Id=menuTitle8 onClick="showsubmenu(8)" style="cursor:pointer;"> <span>发送人信息管理</span> </td>
  </tr>
  <tr>
    <td style="display:none" Id='submenu8'>
      <div class=sec_menu style="wIdth:185">
        <table cellpadding=0 cellspacing=0 align=center wIdth=177>
         <tr><td height=20><a href="user.php?action=modifyself" target=main>修改密码</a></td>
</tr>
<tr><td height=20><a href="user.php?action=modifymsg" target=main>编辑常用语</a></td>
</tr>
<?php if($_SESSION['goip_permissions']<2) {
?>
<tr><td height=20><a href="user.php?job=modify" target=main>管理他人</a></td>
</tr>
<?php } ?>
		  
        </table>
      </div>
    </td>
  </tr>
</table>
<?php if($_SESSION['goip_permissions']<4) {
?>
<table cellpadding=0 cellspacing=0 wIdth=185 align=center>
  <tr>
        <td height=25 class=menu_title onmouseover=this.className='menu_title2'; onmouseout=this.className='menu_title';  Id=menuTitle2 onClick="showsubmenu(2)" style="cursor:pointer;"> 
          <span>接收人管理</span> </td>
  </tr>
  <tr>
    <td style="display:none" Id='submenu2'>
<div class=sec_menu style="wIdth:185">
            <table cellpadding=0 cellspacing=0 align=center wIdth=177>
<tr><td height=20><a href="receiver.php" target=main>接收人管理</a></td>
</tr>
<?php if($_SESSION['goip_permissions']<2){
echo '<tr><td height=20><a href="receiver.php?action=add" target=main>添加接收人</a></td>
</tr>';
echo '<tr><td height=20><a href="upload.php" target=main>导入接受人信息</a></td>
</tr>';
}
?>
      </table>
	  </div>
	</td>
  </tr>
</table>
<?php }
?>
<?php if($_SESSION['goip_permissions']<2) {
?>
      <table cellpadding=0 cellspacing=0 wIdth=185 align=center>
  <tr>
        <td height=25 class=menu_title onmouseover=this.className='menu_title2'; onmouseout=this.className='menu_title';  Id=menuTitle44 onClick="showsubmenu(44)" style="cursor:pointer;"> 
          <span>群组管理</span> </td>
  </tr>
  <tr>
    <td style="display:none" Id='submenu44'>
<div class=sec_menu style="wIdth:185">
<table cellpadding=0 cellspacing=0 align=center wIdth=177>
         <tr><td height=20><a href="crowd.php" target=main>群管理</a></td>
</tr>
<tr><td height=20><a href="groups.php" target=main>组管理</a></td>
</tr>
</table>
	  </div>
	</td>
  </tr>
</table>

<table cellpadding=0 cellspacing=0 wIdth=185 align=center>
  <tr>
        <td height=25 class=menu_title onmouseover=this.className='menu_title2'; onmouseout=this.className='menu_title';  Id=menuTitle4 onClick="showsubmenu(4);" style="cursor:pointer;"> 
          <span>数据维护</span> </td>
  </tr>
  <tr>
    <td style="display:none" Id='submenu4'>
<div class=sec_menu style="wIdth:185">
            <table cellpadding=0 cellspacing=0 align=center wIdth=177>
			  <tr>
                <td height=20><a href="databackup.php"  target=main>数据备份</a></td>
              </tr>
              <tr>
                <td height=20>
                 <a href="datarestore.php" target=main>数据导入</a></td>
              </tr>
            </table>
	  </div>
	</td>
  </tr>
</table>

<table cellpadding=0 cellspacing=0 wIdth=185 align=center>
  <tr>
        <td height=25 class=menu_title onmouseover=this.className='menu_title2'; onmouseout=this.className='menu_title';  Id=menuTitle7 onClick="showsubmenu(17);" style="cursor:pointer;">
          <span>IMEI数据库</span> </td>
  </tr>
  <tr>
    <td style="display:none" Id='submenu17'>
<div class=sec_menu style="wIdth:185">
            <table cellpadding=0 cellspacing=0 align=center wIdth=177>

<tr><td height=20><a href="imei_db.php" target=main>IMEI数据库</a></td>
</tr>
            </table>
          </div>
        </td>
  </tr>
</table>
<?php }
?>

<table cellpadding=0 cellspacing=0 wIdth=185 align=center>
  <tr>
        <td height=25 class=menu_title onmouseover=this.className='menu_title2'; onmouseout=this.className='menu_title';  Id=menuTitle4 onClick="showsubmenu(5);" style="cursor:pointer;"> 
          <span>系统管理</span> </td>
  </tr>
  <tr>
    <td style="display:none" Id='submenu5'>
<div class=sec_menu style="wIdth:185">
            <table cellpadding=0 cellspacing=0 align=center wIdth=177>
<?php if($_SESSION['goip_permissions']<2) {
?>
	      <tr>
                <td height=20><a href="sys.php"  target=main>系统参数管理</a></td>
              </tr>
              <tr>
                <td height=20>
                 <a href="report.php" target=main>邮件报告</a></td>
              </tr>
<?php }
?>
              <tr>
                <td height=20>
                 <a href="goip_record.php" target=main>通话记录</a></td>
              </tr>
              <tr>
                <td height=20>
                 <a href="goip_cdr.php" target=main>GoIP CDR</a></td>
              </tr>
<?php if($_SESSION['goip_permissions']<2) {
?>
              <tr>
                <td height=20>
                 <a href="provider.php" target=main>服务商修改</a></td>
              </tr>
              <tr>
                <td height=20>
                 <a href="goip_group.php" target=main>GoIP组管理</a></td>
              </tr>
<?php }
?>
              <tr>
                <td height=20>
                 <a href="goip.php" target=main>GoIP参数管理</a></td>
              </tr>	  
            </table>
	  </div>
<div  style="wIdth:185">
<table cellpadding=0 cellspacing=0 align=center wIdth=177>
<tr><td height=20></td></tr>
</table>
	  </div>
	</td>
  </tr>
</table>

	  </div>
	</td>
  </tr>
</table>
</body>
</html>
