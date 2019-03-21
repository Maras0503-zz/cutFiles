<?php
    //SELECT INFORMATION ABOUT PRODUCTS
    $query = "select distinct type_type from type_tab";        
    
    function select($query){
        include('connection.php');
        $returnArray = array();
        $fetch = $mysqli->query($query); 
            while ($row = $fetch->fetch_array()) {
                $rowArray['type_type'] = $row['type_type'];
                array_push($returnArray,$rowArray);
            }
            $mysqli->close();
        return $returnArray;
    }   
    
    echo json_encode(select($query));