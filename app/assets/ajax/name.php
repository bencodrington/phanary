<?php
if (isset($_POST['name']) === true && empty($_POST['name']) === false) {
    require '../db/connect.php';

    $query = mysql_query("
        SELECT `names`.`location`
        FROM `names`
        WHERE `names`.`name` = '" . mysql_real_escape_string(trim($_POST['name'])) . "'
    ");

    echo (mysql_num_rows($query) !== 0) ? mysql_result($query, 0, 'location') : 'Name not found'; 
}


// var name = $('input#name').val();
// if ($.trim(name) != '') {
//     $.post('ajax/name.php', {name: name}, function(data) {
//         alrt(data);
//     });
// }