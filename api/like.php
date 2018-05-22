<?php

if (isset($_POST['like'])) {

    ob_start();

    include 'functions.php';
    setGeneralHeaders();
    header('Content-type: application/json');

    ob_end_clean();

    include 'db.php';

    $conn = new mysqli($host, $user, $pw, $db);
    $conn->set_charset('utf8');

    $result = [];

    if (strpos($_POST['like'], 'search-') !== false) {
        $_POST['like'] = substr($_POST['like'], 7);
    }

    $payload = explode('-', $_POST['like']);

    $category = filter_var($payload[0], FILTER_SANITIZE_STRING);
    $index = filter_var($payload[1], FILTER_VALIDATE_INT);

    if (empty($category) || empty($index) && $index !== 0) {
        header('HTTP/1.0 403 Forbidden');
        die();
    }

    $cookieValidator = $category. '-' .$index;

    // if cookie exists
    if ($_COOKIE['liked']) {
        $currentCookie = json_decode($_COOKIE['liked']);

        // if cookie is already an array
        if (is_array($currentCookie)) {
            if (in_array($cookieValidator, $currentCookie)) {// cookie is identical within array
                $result['success'] = false;
                $result['message'] = "Sorry, you already voted for this resource!";
                echo json_encode($result);
                die();
            } else { // shove to array and set new
                array_push($currentCookie, $cookieValidator);
                setcookie('liked', json_encode($currentCookie), time() + 2419200, '/', 'gerritalex.de', 1);
            }
        } else if ($cookieValidator === $currentCookie) { // cookie is string and exists
            $result['success'] = false;
            $result['message'] = "Sorry, you already voted for this resource!";
            echo json_encode($result);
            die();
        } else { // cookie is string and different than this value
            $newCookieArray = [$currentCookie, $cookieValidator];
            unset($_COOKIE['liked']);
            setcookie('liked', json_encode($newCookieArray), time() + 2419200, '/', 'gerritalex.de', 1);
        }
    } else { // cookie does not exist yet
        setcookie('liked', json_encode($cookieValidator), time() + 2419200, '/', 'gerritalex.de', 1);
    }

    $allowedCategories = [];
    $fetchAllCategoriesStmt = "SELECT * FROM `pdf_categories`";
    $fetchAllCategories = $conn->query($fetchAllCategoriesStmt);

    if ($fetchAllCategories->num_rows > 0) {
        while ($dataset = $fetchAllCategories->fetch_assoc()) {
            $allowedCategories[$dataset['id']] = $dataset['category'];
        }
    }

    $categoryId = array_search($category, $allowedCategories);

    if (in_array($category, $allowedCategories)) {
        $resources = [];
        $getCategoryEntriesStmt = "SELECT `title` FROM `pdfs` WHERE `category` = " .$categoryId. " ORDER BY `title` ASC";
        $getCategoryEntries = $conn->query($getCategoryEntriesStmt);

        if ($getCategoryEntries->num_rows > 0) {
            while ($entry = $getCategoryEntries->fetch_assoc()) {
                array_push($resources, $entry);
            }
        }

        $resourceToBeUpdated = $resources[$index];

        $updateStmt = "UPDATE `pdfs`
        SET `likes` = `likes` + 1
        WHERE `category` = " .$categoryId. "
        AND `title` = '" .$resourceToBeUpdated['title']. "'";

        $update = $conn->query($updateStmt);

        if ($update) {
            $result['success'] = true;
        } else {
            $result['success'] = false;
        }
    }

    echo json_encode($result);
} else {
    header('HTTP/1.0 403 Forbidden');
}



?>