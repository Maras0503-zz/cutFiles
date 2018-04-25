<?php
    $typeId = $_POST['typeId'];
    //SELECT INFORMATION ABOUT PRODUCTS
    $query = "select * from type_tab where type_id='".$typeId."'";        
    
    function select($query){
        include('connection.php');
        $returnArray = array();
        $fetch = $mysqli->query($query); 
            while ($row = $fetch->fetch_array()) {
                $rowArray['type_id'] = $row['type_id'];
                $rowArray['type_name'] = $row['type_name'];
                $rowArray['type_x_size'] = $row['type_x_size'];
                $rowArray['type_y_size'] = $row['type_y_size'];
                $rowArray['type_x_qty'] = $row['type_x_qty'];
                $rowArray['type_y_qty'] = $row['type_y_qty'];
                array_push($returnArray,$rowArray);
            }
            $mysqli->close();
        return $returnArray;
    }   
    
    echo json_encode(select($query));