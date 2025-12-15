<?php
$token = "8307379900:AAFmdLYfc2OoL31Z8Ajf6UwnjeL-QOMZ70M";
$main_host = "localhost";
$main_user = "u3301335_main";
$main_pass = "oB4wW4pE2yaT0vB5";
$main_db = "u3301335_main";

$main_pdo = new PDO(
    "mysql:host=$main_host;dbname=$main_db;charset=utf8mb4",
    $main_user,
    $main_pass, 
    [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_EMULATE_PREPARES => true,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]
);
?>