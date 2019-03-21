var functionality = (function() {
    var x;
    var y;
    var qtyx;
    var qtyy;
    /**
     * Things what must be done when page is loaded
     */
    var init = (function() {
        $('#chooseType').html(generateTypeSelectBody(getTypes()));
        $('#chooseSize').html(generateSizeSelectBody(getSizes()));        
        getSelectedTypeData();
        $('#chooseQty').html(buildQtySelectOptions(qtyx, qtyy));
        $('#size').html('Size of single item is: '+x+'mm x '+y+'mm');
        $('.cutFileBody').html(createCutFile(x, y, qtyx, qtyy, $('#chooseQty').val()));
        listeners();
    });

    /**
     * In this function are all listeners pined to DOM
     */
    var listeners = (function() {
        $('#chooseSize').on('change', function() {
            getSelectedTypeData();
            $('#chooseQty').html(buildQtySelectOptions(qtyx, qtyy));
            $('#size').html('Size of single item is: '+x+'mm x '+y+'mm');
            $('.cutFileBody').html(createCutFile(x, y, qtyx, qtyy, $('#chooseQty').val()));
        });
        $('#chooseType').on('change', function() {
            $('#chooseSize').html(generateSizeSelectBody(getSizes()));
            getSelectedTypeData();
            $('#chooseQty').html(buildQtySelectOptions(qtyx, qtyy));
            $('#size').html('Size of single item is: '+x+'mm x '+y+'mm');
            $('.cutFileBody').html(createCutFile(x, y, qtyx, qtyy, $('#chooseQty').val()));
        });
        $('#chooseQty').on('change', function() {
            $('#size').html('Size of single item is: '+x+'mm x '+y+'mm');
            $('.cutFileBody').html(createCutFile(x, y, qtyx, qtyy, $('#chooseQty').val()));
        });
    });
    /**
     * GET INFORMATIONS FROM DB ABOUT AVAILABLE SIZES
     */
    var getTypes = (function(){
        var res;
        $.ajax({
            type: 'POST',
            async: false,
            dataType: 'json',
            url: 'PHP/getTypes.php',            
            success: function(data){
                res = data;
                console.log(res);
            }
        });
        return res;
    });

    /**
     * GENERATING TYPE SELECT CONTENT
     * @param {ARRAY} data 
     */
    var generateTypeSelectBody = function(data){
        var ans = '';
        $.each(data,function(index, value){
            ans += "<option value='"+value['type_type']+"'>"+value['type_type']+"</option>";
        });    
        return ans;
    }

    /**
     * GENERATING TYPE SELECT CONTENT
     * @param {ARRAY} data 
     */
    var generateSizeSelectBody = function(data){
        var ans = '';
        $.each(data,function(index, value){
            ans += "<option value='"+value['type_id']+"'>"+value['type_name']+"</option>";
        });    
        return ans;
    }
    /**
     * GET INFORMATIONS FROM DB ABOUT AVAILABLE SIZES
     */
    var getSizes = (function(){
        var res;
        var param = {};
        param['typeType'] = $('#chooseType').val();
        $.ajax({
            type: 'POST',
            async: false,
            data: param,
            dataType: 'json',
            url: 'PHP/getSizes.php',            
            success: function(data){
                res = data;
            }
        });
        return res;
    });
    /**
     * BUILD QUANTITY SELECT CONTENT
     * @param {INT} x MAX X QUANTITY FOR SELECTED SIZE
     * @param {INT} y MAX Y QUANTITY FOR SELECTED SIZE
     */
    var buildQtySelectOptions = function(x, y){
        res = '';
        for (i=0; i<x*y; i++){
            if (i<10){
                res += '<option value='+ (i+1) +'>'+ 'SUFFIX: 0' + (i) + ' (-' + (i+1) + ' pcs-)' + '</option>';
            } else {
                res += '<option value='+ (i+1) +'>'+ 'SUFFIX: ' + (i) + ' (-' + (i+1) + ' pcs-)' + '</option>';   
            } 
        }
        return res;
    }
    /**
     * GET DATA ABOUT SELECTED SIZE
     */
    var getSelectedTypeData = (function(){
        var param = {};
        param['typeId'] = $('#chooseSize').val();
        param['typeType'] = $('#chooseType').val();
        console.log(param['typeType']);
        $.ajax({
            type: 'POST',
            async: false,
            data: param,
            dataType: 'json',
            url: 'PHP/getSelectedTypeData.php',            
            success: function(data){
                x = data[0].type_x_size;
                y = data[0].type_y_size;
                qtyx = data[0].type_x_qty;
                qtyy = data[0].type_y_qty;
            }
        });
    });
    /**
     * COORDINATES FOR BOTTOM LEFT CORNER
     */
    var cornerPosX = 45;
    var cornerPosY = 47;
    /**
     * COORDINATES FOR BOTTOM LEFT REGISTRATION MARK 
    */
    var firstRegMarkX = 48;
    var firstRegMarkY = 34;

    var createCutFile = function(x, y, qtyx, qtyy, qty) {
        var c=document.getElementById("myCanvas");
        var ctx=c.getContext("2d");
        ctx.clearRect(0, 0, 1300, 900);
        ctx.setTransform(1,0,0,-1,0,800);
        var row = 0;
        var columns = 0;
        /**
         * CALCULATING FULL COLUMNS
         */
        var fullColumns = Math.floor(qty / qtyy);
        /**
         * CALCULATING ITEMS IN LAST ROW
         */
        var qtyInLastColumn = qty % qtyy;
        /**
         * SET VARIABLE WITH FULL COUNT OF COLUMNS
         */
        if (qtyInLastColumn !== 0){
            columns = fullColumns + 1;
        } else {
            columns = fullColumns;
        }
        /**
         * SET VARIABLE WITH NUMBER OF ROWS
         */
        if (Number(qty) <= Number(qtyy)) {
            row = qty;
        } else {
            row = qtyy;
        }
        /**
         * ADDING HEADER TO CUT FILE
         */
        var cut = 'MGE i-cut script<br>';
        cut += '// Produced by Esko - BRIXSDB 4.0<br>';
        cut += 'Clear<br>';
        cut += 'SystemUnits mm Local<br>';
        cut += 'OpenCuttingKeyFor Canvas A Mixed Eco<br>';
        
        /**
         * THIS PART IS RESPOSIBLE FOR PLACING PLACE HOLDERS OF SHEET BARCODE AND BARCODE REGMARKS
         */
        ctx.beginPath();
        ctx.arc(firstRegMarkX/2,(firstRegMarkY-20)/2,2,0,2*Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc((firstRegMarkX+6)/2,(firstRegMarkY-15)/2,2,0,2*Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.rect((firstRegMarkX+15)/2,(firstRegMarkY-30),40,10);
        ctx.stroke();
        ctx.beginPath();
        ctx.rect((firstRegMarkX)/2-10,(firstRegMarkY)/2-15,2190/2,1524/2);
        ctx.stroke();
        
        ctx.beginPath();
        /**
         * WHEN BATCH WILL HAVE MINIMUM SIZE
         * THIS PART IS RESPONIBLE FOR PLACING REG MARKS ON SHEET
        */
        cut += 'RegMark ' + firstRegMarkX + '.0,' + firstRegMarkY + '.0,Regmark<br>';
        ctx.beginPath();
        ctx.arc(firstRegMarkX/2,firstRegMarkY/2,2,0,2*Math.PI);
        ctx.stroke();
        cut += 'RegMark ' + (cornerPosX + columns*x) + '.0,' + firstRegMarkY + '.0,Regmark<br>';
        ctx.beginPath();
        ctx.arc((cornerPosX + columns*x)/2,firstRegMarkY/2,2,0,2*Math.PI);
        ctx.stroke();
        cut += 'RegMark ' + firstRegMarkX + '.0,' + (cornerPosY+row*y+12) + '.0,Regmark<br>';
        ctx.beginPath();
        ctx.arc(firstRegMarkX/2,(cornerPosY+row*y+12)/2,2,0,2*Math.PI);
        ctx.stroke();
        cut += 'RegMark ' + (cornerPosX + columns*x) + '.0,' + (cornerPosY+row*y+12) + '.0,Regmark<br>';
        ctx.beginPath();
        ctx.arc((cornerPosX + columns*x)/2,(cornerPosY+row*y+12)/2,2,0,2*Math.PI);
        ctx.stroke();
        cut += 'SelectLayer Cut<br>';
        /**
         * IF CUT MINIMUM TIMES
         * THIS PART IS RESPONSIBLE FOR ADDING CUT LINES ON SHEET
        */

        /**
         * CALCULATING HORIZONTAL CUTS
         */
        for(var i = 0; i <= Number(row) ; i++){
            if( i > qtyInLastColumn && qtyInLastColumn !== 0 ){
                cut += 'MoveTo ' + cornerPosX + '.0,' + (cornerPosY + (y * i)) + '.0,Open,Cut<br>';
                cut += 'LineTo ' + (((columns - 1) * x) + cornerPosX) + '.0,' + (cornerPosY + (y * i)) +'.0,Corner<br>';
                ctx.moveTo((cornerPosX) /2, (cornerPosY + (y * i)) /2);
                ctx.lineTo((((columns - 1) * x) + cornerPosX) /2, (cornerPosY + (y * i)) /2);
            } else {
                cut += 'MoveTo ' + cornerPosX + '.0,' + (cornerPosY + (y * i)) + '.0,Open,Cut<br>';
                cut += 'LineTo ' + (((columns) * x) + cornerPosX) + '.0,' + (cornerPosY + (y * i)) +'.0,Corner<br>';
                ctx.moveTo((cornerPosX) /2, (cornerPosY + (y * i)) /2);
                ctx.lineTo((((columns) * x) + cornerPosX) /2, (cornerPosY + (y * i)) /2);
            }
        }
        /**
         * CALCULATING VERTICAL CUTS
         */
        for(var j = 0; j <= Number(columns) ; j++){
            if (j === Number(columns) && qtyInLastColumn !== 0 ){
                cut += 'MoveTo ' + (cornerPosX + (x * j)) + '.0,' + cornerPosY + '.0,Open,Cut<br>';
                cut += 'LineTo ' + (cornerPosX + (x * j)) + '.0,' + ((qtyInLastColumn * y) + cornerPosY) +'.0,Corner<br>';
                ctx.moveTo((cornerPosX + (x * j)) /2, (cornerPosY) /2);
                ctx.lineTo((cornerPosX + (x * j)) /2, ((qtyInLastColumn * y) + cornerPosY) /2);
            } else {
                cut += 'MoveTo ' + (cornerPosX + (x * j)) + '.0,' + cornerPosY + '.0,Open,Cut<br>';
                cut += 'LineTo ' + (cornerPosX + (x * j)) + '.0,' + ((row * y) + cornerPosY) +'.0,Corner<br>';
                ctx.moveTo((cornerPosX + (x * j)) /2, (cornerPosY) /2);
                ctx.lineTo((cornerPosX + (x * j)) /2, ((row * y) + cornerPosY) /2);
            }
        }
        ctx.stroke();
         /**
         * THIS OFFSET IS NECESSARY
         */
        cut += 'Offset 1.0, 20.0<br>';
        return cut;
    }
   
    /**
     * Functions what must be executed when document is fully loaded
     */
    $(document).ready(function() {
        init();
    });
})();