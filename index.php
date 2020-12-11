<?php
$pro=$_GET["pro"];
$id=$_GET["id"];
if ($id==null and $pro==null) {
	$mod = 'steam_id';
	$id='76561198070386645';
} elseif ($pro==null) {
	$id=$_GET["id"];
	$mod = 'steam_id';
} else {
	$pro=$_GET["pro"];
	$mod = 'profile_id';
}
?>
<!DOCTYPE html>
<html lang="en-US">
<head>
 	<meta http-equiv="refresh" content="60">
	<title>Ranked Games</title>
	<script src="https://code.jquery.com/jquery-3.5.0.js"></script>
    <link rel="stylesheet" type="text/css" href="rank.css">
</head>
<body onload="ranks(<?php echo  "'" . $mod . "'" . ', ' . "'" . addslashes($id) . "'"; ?>)">
<!-- <marquee behavior="scroll" direction="left" scrollamount="5"> -->
	<div id="map">
	</div>
	<div id="rank">
	</div>
<!-- </marquee> -->
	
<script src="data.js">
</script>
</body>
