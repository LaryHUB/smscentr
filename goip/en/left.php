<?php
	define("OK", true);
	require_once("session.php");
	require_once("global.php");
?>

<html>
<meta name="Author" content="Gaby_chen">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>SMS Manage</title>
<style type=text/css>
body  { background:#799AE1; margin:0px; font:9pt 宋体; }
table  { border:0px; }
td  { font:normal 12px 宋体; }
img  { vertical-align:bottom; border:0px; }

a  { font:normal 12px ; color:#000000; text-decoration:none; }
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
.sec_menu { width:185px; overflow:hidden; background:#f7faff; border-left:1px solid #b7c8e8; border-right:1px solid #b7c8e8; border-bottom:1px solid #b7c8e8; box-shadow:inset 0 1px 0 #fff; transition:max-height .22s ease, opacity .18s ease; }
.sec_menu table { width:177px; margin:3px auto 5px auto; }
.sec_menu td { height:auto; line-height:18px; }
.sec_menu a.active { background:#d9e9ff; color:#0d4fab; font-weight:bold; }
#submenu0 .sec_menu td { padding:3px 8px; color:#33435c; }

</style>
<SCRIPT language=javascript1.2>
function menuEl(id) { return document.getElementById('submenu' + id); }
function titleEl(id) { return document.getElementById('menuTitle' + id); }
function setTitleOpen(id, open) { var t = titleEl(id); if (!t) return; t.className = open ? 'menu_title open' : 'menu_title'; }
function showsubmenu(ClassId) {
    var el = menuEl(ClassId);
    if (!el) return;
    var box = el.getElementsByTagName('div')[0];
    if (!box) return;
    if (el.style.display == 'none') {
        el.style.display = '';
        box.style.opacity = 0;
        box.style.maxHeight = '0px';
        setTitleOpen(ClassId, true);
        setTimeout(function(){ box.style.opacity = 1; box.style.maxHeight = box.scrollHeight + 'px'; }, 10);
    } else {
        box.style.maxHeight = box.scrollHeight + 'px';
        setTimeout(function(){ box.style.opacity = 0; box.style.maxHeight = '0px'; }, 10);
        setTitleOpen(ClassId, false);
        setTimeout(function(){ el.style.display = 'none'; }, 230);
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
          <span><a href="main.php" target=main><b>Main page</b></a> | <a href="../logout.php" target=_top><b>Logout</b></a></span> 
        </td>
  </tr>
  <tr>
    <td style="display:" Id='submenu0'>
<div class=sec_menu style="wIdth:185">
<table cellpadding=0 cellspacing=0 align=center wIdth=177>
<tr><td height=20>User Name:<?php echo $_SESSION['goip_username'] ?></td>
</tr>
<tr><td height=20>Permissions:<?php $adm=array("Super Adminstrator","Senior Adminstrator","Crowd Adminstrator","Group Adminstrator","GoIP Operator","GoIP Owner");echo $adm[$_SESSION['goip_permissions']]; ?></td>
</tr>
</table>
</div>
	</td>
  </tr>
</table>
<table cellpadding=0 cellspacing=0 wIdth=185 align=center>
  <tr>
        <td height=25 class=menu_title onmouseover=this.className='menu_title2'; onmouseout=this.className='menu_title';  Id=menuTitle1 onClick="showsubmenu(1)" style="cursor:pointer;"> 
          <span>Send Message</span> </td>
  </tr>
  <tr>
    <td style="display:" Id='submenu1'>
<div class=sec_menu style="wIdth:185">
<table cellpadding=0 cellspacing=0 align=center wIdth=177>
<tr><td height=20><a href="send.php?type=re" target=main>Send Directly</a></td>
</tr>
<?php if(!operator_owner_forbid()) {
?>
<tr><td height=20><a href="send.php?type=all" target=main>Send to All</a></td>
</tr>
<tr><td height=20><a href="send.php?type=crowd" target=main>Send to Crowds</a></td>
</tr>
<tr><td height=20><a href="send.php?type=group" target=main>Send to A Group</a></td>
</tr>
<?php } ?>
<tr><td height=20><a href="xmlfile.php" target=main>Send From A Xml File</a></td>
</tr>
<tr><td height=20><a href="filesms.php" target=main>Bulk Send From File</a></td>
</tr>
<tr><td height=20><a href="all_send.php" target=main>All Send Settings</a></td>
</tr>
<tr><td height=20><a href="do_all_send.php" target=main onClick="return confirm('Sure to use all login lines to send a same SMS?')">All Lines Send</a></td>
</tr>
<tr><td height=20><a href="cron.php" target=main>Examine Tasks</a></td>
</tr>
<tr><td height=20><a href="sendinfo.php" target=main>Examine Sendings</a></td>
</tr>
<tr><td height=20><a href="sms_count.php" target=main>SMS Count</a></td>
</tr>
<tr><td height=20><a href="receive.php" target=main>Inbox</a></td>
</tr>
<tr><td height=20><a href="ussd_ch.php" target=main>Network Services</a></td>
</tr>
<tr><td height=20><a href="ussdinfo.php" target=main>USSD Records</a></td>
</tr>
</table>
</div>
	</td>
  </tr>
</table>

<table cellpadding=0 cellspacing=0 wIdth=185 align=center>
  <tr>
        <td height=25 class=menu_title onmouseover=this.className='menu_title2'; onmouseout=this.className='menu_title';  Id=menuTitle7 onClick="showsubmenu(7);" style="cursor:pointer;">
          <span>Auto balance and recharge</span> </td>
  </tr>
  <tr>
    <td style="display:none" Id='submenu7'>
<div class=sec_menu style="wIdth:185">
            <table cellpadding=0 cellspacing=0 align=center wIdth=177>

<tr><td height=20><a href="recharge.php" target=main>Auto balance and recharge</a></td>
</tr>
<tr><td height=20><a href="recharge_card.php" target=main>Recharge Card</a></td>
</tr>
              <tr>
                <td height=20>
                 <a href="auto_num.php" target=main>Auto Get Num</a></td>
              </tr>
            </table>
          </div>
        </td>
  </tr>
</table>

<table cellpadding=0 cellspacing=0 wIdth=185 align=center>
  <tr>
    <td height=25 class=menu_title onmouseover=this.className='menu_title2'; onmouseout=this.className='menu_title';  Id=menuTitle8 onClick="showsubmenu(8)" style="cursor:pointer;"> <span>User Manage</span> </td>
  </tr>
  <tr>
    <td style="display:none" Id='submenu8'>
      <div class=sec_menu style="wIdth:185">
        <table cellpadding=0 cellspacing=0 align=center wIdth=177>
         <tr><td height=20><a href="user.php?action=modifyself" target=main>Change Password</a></td>
</tr>
<tr><td height=20><a href="user.php?action=modifymsg" target=main>Edit Templates</a></td>
</tr>
<?php if($_SESSION['goip_permissions']<2) {
?>
<tr><td height=20><a href="user.php?job=modify" target=main>Manage Other Users</a></td>
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
          <span>Receivers Manage</span> </td>
  </tr>
  <tr>
    <td style="display:none" Id='submenu2'>
<div class=sec_menu style="wIdth:185">
            <table cellpadding=0 cellspacing=0 align=center wIdth=177>
<tr><td height=20><a href="receiver.php" target=main>Receivers Manage</a></td>
</tr>
<?php if($_SESSION['goip_permissions']<2){
echo '<tr><td height=20><a href="receiver.php?action=add" target=main>Add a Receiver</a></td>
</tr>';
echo '<tr><td height=20><a href="upload.php" target=main>Import Receivers</a></td>
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
          <span>Crowd and Group Manage</span> </td>
  </tr>
  <tr>
    <td style="display:none" Id='submenu44'>
<div class=sec_menu style="wIdth:185">
<table cellpadding=0 cellspacing=0 align=center wIdth=177>
         <tr><td height=20><a href="crowd.php" target=main>Crowd Manage</a></td>
</tr>
<tr><td height=20><a href="groups.php" target=main>Group Manage</a></td>
</tr>
</table>
	  </div>
	</td>
  </tr>
</table>

<table cellpadding=0 cellspacing=0 wIdth=185 align=center>
  <tr>
        <td height=25 class=menu_title onmouseover=this.className='menu_title2'; onmouseout=this.className='menu_title';  Id=menuTitle4 onClick="showsubmenu(4);" style="cursor:pointer;"> 
          <span>Data Manage</span> </td>
  </tr>
  <tr>
    <td style="display:none" Id='submenu4'>
<div class=sec_menu style="wIdth:185">
            <table cellpadding=0 cellspacing=0 align=center wIdth=177>
			  <tr>
                <td height=20><a href="databackup.php"  target=main>Data Backup</a></td>
              </tr>
              <tr>
                <td height=20>
                 <a href="datarestore.php" target=main>Data Import</a></td>
              </tr>
            </table>
	  </div>
	</td>
  </tr>
</table>

<table cellpadding=0 cellspacing=0 wIdth=185 align=center>
  <tr>
        <td height=25 class=menu_title onmouseover=this.className='menu_title2'; onmouseout=this.className='menu_title';  Id=menuTitle7 onClick="showsubmenu(17);" style="cursor:pointer;">
          <span>IMEI Data</span> </td>
  </tr>
  <tr>
    <td style="display:none" Id='submenu17'>
<div class=sec_menu style="wIdth:185">
            <table cellpadding=0 cellspacing=0 align=center wIdth=177>

<tr><td height=20><a href="imei_db.php" target=main>IMEI Data</a></td>
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
          <span>System Manage</span> </td>
  </tr>
  <tr>
    <td style="display:none" Id='submenu5'>
<div class=sec_menu style="wIdth:185">
            <table cellpadding=0 cellspacing=0 align=center wIdth=177>
<?php if($_SESSION['goip_permissions']<2) {
?>
	      <tr>
                <td height=20><a href="sys.php"  target=main>System Manage</a></td>
              </tr>
              <tr>
                <td height=20>
                 <a href="report.php" target=main>Mail Report</a></td>
              </tr>
<?php }
?>
              <tr>
                <td height=20>
                 <a href="goip_record.php" target=main>Call Record</a></td>
              </tr>

              <tr>
                <td height=20>
                 <a href="goip_cdr.php" target=main>GoIP CDR</a></td>
              </tr>

<?php if($_SESSION['goip_permissions']<2) {
?>
              <tr>
                <td height=20>
                 <a href="provider.php" target=main>Provider Manage</a></td>
              </tr>
              <tr>
                <td height=20>
                 <a href="goip_group.php" target=main>GoIP Group</a></td>
              </tr>
<?php }
?>
              <tr>
                <td height=20>
                 <a href="goip.php" target=main>GoIP Manage</a></td>
              </tr>	  
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
