var functionality = (function() {
    var x;
    var y;
    var qtyx;
    var qtyy;
    /**
     * Things what must be done when page is loaded
     */
    var init = (function() {
        $('#chooseSize').html(generateTypeSelectBody(getSizes()));        
        getSelectedTypeData();
        $('#chooseQty').html(buildQtySelectOptions(qtyx, qtyy));
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
            $('.cutFileBody').html(createCutFile(x, y, qtyx, qtyy, $('#chooseQty').val()));
        });
        $('#chooseQty').on('change', function() {
            $('.cutFileBody').html(createCutFile(x, y, qtyx, qtyy, $('#chooseQty').val()));
        });
        $('#alg').on('change', function() {
            $('.cutFileBody').html(createCutFile(x, y, qtyx, qtyy, $('#chooseQty').val()));
        });
    });

    var generateTypeSelectBody = function(data){
        var ans = '';
        $.each(data,function(index, value){
            ans += "<option value='"+value['type_id']+"'>"+value['type_name']+"</option>";
        });    
        return ans;
    }

    var getSizes = (function(){
        var res;
        $.ajax({
            type: 'POST',
            async: false,
            dataType: 'json',
            url: 'PHP/getSizes.php',            
            success: function(data){
                res = data;
            }
        });
        return res;
    });

    var buildQtySelectOptions = function(x, y){
        res = '';
        for (i=0; i<x*y; i++){
            res += '<option value='+ (i+1) +'>'+ (i+1) +'</option>';            
        }
        return res;
    }

    var getSelectedTypeData = (function(){
        var param = {};
        param['typeId'] = $('#chooseSize').val();
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

    var cornerPosX = 45;
    var cornerPosY = 47;
    var firstRegMarkX = 48;
    var firstRegMarkY = 34;

    var createCutFile = function(x, y, qtyx, qtyy, qty) {
        var c=document.getElementById("myCanvas");
        var ctx=c.getContext("2d");
        ctx.clearRect(0, 0, 1300, 900);
        ctx.setTransform(1,0,0,-1,0,800);
        var row = 0;
        var columns = 0;
        var fullColumns = Math.floor(qty / qtyy);
        var qtyInLastColumn = qty % qtyy;
        if (qtyInLastColumn !== 0){
            columns = fullColumns + 1;
        } else {
            columns = fullColumns;
        }
        if (Number(qty) <= Number(qtyy)) {
            row = qty;
        } else {
            row = qtyy;
        }
        var cut = 'MGE i-cut script<br>';
        cut += '// Produced by Esko - BRIXSDB 4.0<br>';
        cut += 'Clear<br>';
        cut += 'SystemUnits mm Local<br>';
        cut += 'OpenCuttingKeyFor Canvas A Mixed Eco<br>';

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
        
        if($('#alg').val() == 1){
            //WHEN ALWAYS THE SAME SIZE OF BATCH
            cut += 'RegMark ' + firstRegMarkX + '.0,' + firstRegMarkY + '.0,Regmark<br>';
            ctx.beginPath();
            ctx.arc(firstRegMarkX/2,firstRegMarkY/2,2,0,2*Math.PI);
            ctx.stroke();
            cut += 'RegMark ' + (cornerPosX + qtyx*x) + '.0,' + firstRegMarkY + '.0,Regmark<br>';
            ctx.beginPath();
            ctx.arc((cornerPosX + qtyx*x)/2,firstRegMarkY/2,2,0,2*Math.PI);
            ctx.stroke();
            cut += 'RegMark ' + firstRegMarkX + '.0,' + (cornerPosY+qtyy*y+12) + '.0,Regmark<br>';
            ctx.beginPath();
            ctx.arc(firstRegMarkX/2,(cornerPosY+qtyy*y+12)/2,2,0,2*Math.PI);
            ctx.stroke();
            cut += 'RegMark ' + (cornerPosX + qtyx*x) + '.0,' + (cornerPosY+qtyy*y+12) + '.0,Regmark<br>';
            ctx.beginPath();
            ctx.arc((cornerPosX + qtyx*x)/2,(cornerPosY+qtyy*y+12)/2,2,0,2*Math.PI);
            ctx.stroke();
            ctx.beginPath();
            cut += 'SelectLayer Cut<br>';
            //IF ALWAYS CUT MAXIMUM QTY
            for(var i = 0; i <= Number(qtyy) ; i++){
                cut += 'MoveTo ' + cornerPosX + '.0,' + (cornerPosY + (y * i)) + '.0,Open,Cut<br>';
                cut += 'LineTo ' + (((qtyx) * x) + cornerPosX) + '.0,' + (cornerPosY + (y * i)) +'.0,Corner<br>';
                ctx.moveTo(cornerPosX /2, (cornerPosY + (y * i)) /2);
                ctx.lineTo((((qtyx) * x) + cornerPosX) /2, (cornerPosY + (y * i)) /2);
            }
            for(var j = 0; j <= Number(qtyx) ; j++){
                cut += 'MoveTo ' + (cornerPosX + (x * j)) + '.0,' + cornerPosY + '.0,Open,Cut<br>';
                cut += 'LineTo ' + (cornerPosX + (x * j)) + '.0,' + ((qtyy * y) + cornerPosY) +'.0,Corner<br>';
                ctx.moveTo((cornerPosX + (x * j)) /2, cornerPosY /2);
                ctx.lineTo((cornerPosX + (x * j)) /2, ((qtyy * y) + cornerPosY) /2);
            }
            ctx.stroke();
        } else {
            ctx.beginPath();
            //WHEN BATCH WILL HAVE MINIMUM SIZE
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
            //IF CUT MINIMUM TIMES
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
        }

        cut += 'Offset 1.0,20.0<br>';
        return cut;
    }

   
    /**
     * Functions what must be executed when document is fully loaded
     */
    $(document).ready(function() {
        init();
    });
})();