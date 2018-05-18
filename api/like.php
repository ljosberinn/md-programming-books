<?php

require 'functions.php';
require 'db.php';

setGeneralHeaders();
header('Content-type: application/json');

$result = $allowedCategories = [];

$conn = new mysqli($host, $user, $pw, $db);
$conn->set_charset('utf8');

$payload = split('-', $_POST['like']);

$category = filter_var($payload[0], FILTER_SANITIZE_STRING);
$index = filter_var($payload[1], FILTER_VALIDATE_INT);

if (empty($category) || empty($index) && $index !== 0) {
    header('HTTP/1.0 403 Forbidden');
}

$fetchAllCategoriesStmt = "SELECT DISTINCT(`category`) FROM `books`";
$fetchAllCategories = $conn->query($fetchAllCategoriesStmt);

if ($fetchAllCategories->num_rows > 0) {
    while ($dataset = $fetchAllCategories->fetch_assoc()) {
        array_push($allowedCategories, $dataset['category']);
    }
}

if (in_array($category, $allowedCategories)) {
    $resources = [];
    $getCategoryEntriesStmt = "SELECT * FROM `books` WHERE `category` = '" .$category. "' ORDER BY `title` ASC";
    $getCategoryEntries = $conn->query($getCategoryEntriesStmt);

    if ($getCategoryEntries->num_rows > 0) {
        while ($entry = $getCategoryEntries->fetch_assoc()) {
            array_push($resources, $entry);
        }
    }

    $resourceToBeUpdated = $resources[$index];

    $updateStmt = "UPDATE `books` SET `likes` = `likes` + 1 WHERE `category` = '" .$resourceToBeUpdated['category']. "' AND `title` = '" .$resourceToBeUpdated['title']. "'";

    $update = $conn->query($updateStmt);

    if ($update) {
        $result['success'] = true;
    } else {
        $result['success'] = false;
    }
}

echo json_encode($result);

?>