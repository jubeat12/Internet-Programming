<?php
include_once 'database.php';

$error = False;
$con=new mysqli($db_servername, $db_username, $db_password, $db_name);

if (isset($_POST['username'])) {
  if (mysqli_connect_errno()) {
    echo 'Failed to connect to MySQL:' . mysqli_connect_error();
  }

  $username = $_POST['username'];
  $password = sha1($_POST['password']);
  $sql = mysqli_query($con, "SELECT acc_name, acc_password FROM tbl_accounts WHERE acc_login = '$username'");
  $con->close();

  $row = mysqli_fetch_row($sql);
  if (mysqli_num_rows($sql) == 0 || $row[1] != $password) {
    $error = True;
    header('Location: login.php');
    exit;
  }
  if ($error == False) {
    $_SESSION['username'] = $row[0];
    header('Location: events.php');
    exit;
  }
}
?>

<!doctype html>
<html lang="en">
  <head>
    	<meta charset="utf-8">
    	<meta name="viewport" content="width=device-width, initial-scale=1">
	    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
	    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
	    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
	    <title>Login Page</title>
  </head>

  <body>
   		<div class="jumbotron" style="background: DarkSeaGreen !important">
        <h1 style="text-align: center;">Login Page</h1>
        <p style="text-align: center;">Please enter your user name and password. Both are case sensitive.</p>
      </div>

      <form id="login" method="post" action="login.php">

      <div class="row">
        <label style="margin-left:50px;">User:</label></br><input style="margin-left:50px; width:90%;" type="text" name="username" id="username"></br>
        <label style="margin-left:50px;">Password:</label></br><input style="margin-left:50px; width:90%;" type="password" name="password" id="password"></br></br>
        <input style="margin-left:50px; background-color: blue; color: white; width:90%;" class="btn btn-default" type="submit" value="Submit" id="submit" style="margin-left:50px;">
      </div>
    </form>
</body>
</html>
