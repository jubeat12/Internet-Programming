<?php
include_once 'database.php';

if (!isset($_SESSION['username'])) {
  header('Location: login.php');
  exit;
}

$con=new mysqli($db_servername, $db_username, $db_password, $db_name);

if (mysqli_connect_errno()) {
  echo 'Failed to connect to MySQL:' . mysqli_connect_error();
}

if ($_POST['event_name']) {
  $sql = mysqli_query($con, "SELECT * FROM tbl_events ORDER BY event_name ASC");
}
else if ($_POST['event_location']) {
  $sql = mysqli_query($con, "SELECT * FROM tbl_events ORDER BY event_location ASC");
}
else if ($_POST['event_date']) {
  $sql = mysqli_query($con, "SELECT * FROM tbl_events ORDER BY event_date ASC");
}
else {
  $sql = mysqli_query($con, "SELECT * FROM tbl_events");
}

if (!$sql) {
  print(mysqli_error($con));
}
$con->close();
?>

<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
  <title>events</title>
</head>

<body>
  <nav>
 		<div class="jumbotron" style="background-color: DarkSeaGreen !important;">
      <ul style="background-color: green;">
        <li style="list-style-type: none; float: left;"> <a style="text-decoration: none; margin-left: 20px; color:white;"href="events.php"> Events Page </a> </li>
        <li style="list-style-type: none; float: left;"> <a style="text-decoration: none; margin-left: 20px; color:white;"href="logout.php"> Logout </a> </li>
      </ul>
      <p id="user" style="text-decoration: none; margin-left: 20px; color:white; text-align: right !important; font-size: 15px;">Welcome, <?php print($_SESSION['username']) ?>!</p>
    </div>
  </nav>
  <table class="table" id="events" style="">
   <thead>
     <tr>
       <th style="background-color: green; color: white;">Event Name</th>
       <th style="background-color: green; color: white;">Location</th>
       <th style="background-color: green; color: white;">Date</th>
     </tr>
   </thead>
   <tbody style="background-color: #d3d3d3;">
    <?php
      while($row = mysqli_fetch_row($sql)) {
          print("<tr>");
          print("<td>$row[1]</td>");
          print("<td>$row[2]</td>");
          print("<td>$row[3]</td>");
          print("</tr>");
      }
    ?>
    <form id="sortForm" method="post" action="events.php">
      <tr>
        <td><input type="radio" id="event_name" name="event_name" value="event_name" onclick=document.getElementById('sortForm').submit()><b> event name</b></td>
      	<td><input type="radio" id="event_location" name="event_location" value="event_location" onclick=document.getElementById('sortForm').submit()><b> event location</b></td>
      	<td><input type="radio" id="event_date" name="event_date" value="event_date" onclick=document.getElementById('sortForm').submit()><b> event date</b></td>
      <tr>
    </form>
   </tbody>
 </table>
</body>
</html>