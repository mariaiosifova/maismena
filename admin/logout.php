<?php
require_once 'auth_functions.php';

logoutAdmin();

header('Location: login.php');
exit;
?>