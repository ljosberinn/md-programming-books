<?php

require 'api/functions.php';
setGeneralHeaders();

?>

<!DOCTYPE html>
<html prefix="og: http://ogp.me/ns#" lang="en" itemscope itemtype="http://schema.org/WebPage">

<head>

    <?php

    require 'app/head.php';

    ?>

</head>

<body>
  <header>

    <?php

    require 'app/header.php';

    ?>
  </header>

  <main class="container">

    <?php

    require 'app/main.php';

    ?>

  </main>

  <footer class="page-footer teal">
    <?php

    require 'app/footer.php';

    ?>
  </footer>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/0.97.3/js/materialize.min.js"></script>

    <?php

      $jsFiles = [
          "assets/js/bundle.min.js" => [
              "mode" => "",
              "params" => "",
              "type" => "js",
          ],
      ];

      appendFiles($jsFiles);

    ?>

</body>

</html>