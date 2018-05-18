<?php

ob_start();

require 'db.php';
require 'functions.php';

setGeneralHeaders();
header('Content-type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

ob_end_clean();

$conn = new mysqli($host, $user, $pw, $db);
$conn->set_charset('utf8');

$getAllBooksStmt = "SELECT * FROM `books` ORDER BY `category` ASC, `title` ASC";
$getAllBooks = $conn->query($getAllBooksStmt);

$result = [];

if ($getAllBooks->num_rows > 0) {
    while ($dataset = $getAllBooks->fetch_assoc()) {
        if (empty($result[$dataset['category']])) {
            $result[$dataset['category']] = [];
        }

        $dataset['type'] = updateType($dataset['type']);
        $dataset['added'] = updateAddedTimestamp($dataset['added']);
        array_push($result[$dataset['category']], $dataset);
    }
}

echo json_encode($result, JSON_NUMERIC_CHECK);

?>