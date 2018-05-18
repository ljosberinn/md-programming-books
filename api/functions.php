<?php

/**
 * @method public appendJSFiles
 * @param array $files [$ownJSFiles, relative links to file]
 * @return string [script link]
 */
function appendFiles($files)
{
    foreach ($files as $link => $subInfo) {
        $lastModified = filemtime($link);

        $mode = $subInfo["mode"];
        $params = $subInfo["params"];

        $link .= $params;

        if (empty($params)) {
            $link = $link."?";
        }

        if ($subInfo["type"] === "js") {
            echo '
            <script ' .$mode. ' src="' .$link. '' .$lastModified. '"></script>';
        } else if ($subInfo["type"] === "css") {
            echo '
            <link rel="stylesheet" href="' .$link. '' .$lastModified. '" />';
        }
    }
}

/**
 * @method public setGeneralHeaders
 *
 * @return mixed [general headers used for protecting the page]
 */
function setGeneralHeaders()
{
    $generalHeaders = [
      "X-Content-Type-Options: nosniff",
      "Strict-Transport-Security: max-age=63072000; includeSubDomains; preload",
      "X-Frame-Options: DENY",
      "X-XSS-Protection: 1; mode=block",
    ];

    foreach ($generalHeaders as $header) {
        header($header);
    }
}

/**
 * @method public updateType
 *
 * @param integer $type [integer type of db entry]
 *
 * @return string [converts integer to actual type]
 */
function updateType($type)
{
    switch($type) {
    case 0:
        $newType = 'PDF';
        break;
    case 1:
        $newType = 'Website';
        break;
    case 2:
        $newType = 'Mixed';
        break;
    case 3:
        $newType = '';
        break;
    default:
        $newType = 'Unknown';
        break;
    }

    return $newType;
}

/**
 * @method public updateAddedTimestamp
 *
 * @param string $date [mysql added timestamp]
 *
 * @return int [days since added]
 */
function updateAddedTimestamp($date)
{
    return strtotime($date, time('now')) * 1000;
}


?>

