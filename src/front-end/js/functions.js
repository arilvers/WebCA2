        //base url without final bar 
        //var baseUrl = 'http://localhost:3000';

        var currentUrl = window.location.href;
        var currentHost = currentUrl.split('/')[0]+currentUrl.split('/')[1]+'//'+currentUrl.split('/')[2]
        var baseUrl = currentHost; 
  
        function getHost (){
            var i=0,domain=document.domain,p=domain.split('.'),s='_gd'+(new Date()).getTime();
            while(i<(p.length-1) && document.cookie.indexOf(s+'='+s)==-1){
                domain = p.slice(-1-(++i)).join('.');
                document.cookie = s+"="+s+";domain="+domain+";";
            }
            document.cookie = s+"=;expires=Thu, 01 Jan 1970 00:00:01 GMT;domain="+domain+";";
            return domain;
        }



        var pathAPI = '/api/items';
        var APIUrl = baseUrl+pathAPI;
	    var imagesUrl = baseUrl

        //prevent form submit
        $('form').submit(false);


        //If close modal, clean all form inputs
        $(".modal").on("hidden.bs.modal", function () {

            if(document.getElementById("formInsert") !== null){
                document.getElementById("formInsert").reset();
            }

            if(document.getElementById("formUpdate") !== null){
                document.getElementById("formUpdate").reset();
            }

            if(document.getElementById("formDelete") !== null){
                document.getElementById("formDelete").reset();
            } 

            if(document.getElementById("formInsertImage") !== null){
                document.getElementById("formInsertImage").reset();
            }

            if(document.getElementById("formUpdateImage") !== null){
                document.getElementById("formUpdateImage").reset();  
            }

            clearModalMessage();

        }); 


        //Function to format money in EUR format
        function moneyFormat(value){
           if(value !== undefined){
                if(value !== null){
                    price = value.toLocaleString("en-IE", { style: "decimal" , currency:"EUR"});
                    return price;
                }
           }
        }


        //Function to verify if fields is not empty
        function isNotEmpty(str){
            //Remove all extra white spaces
            if(str.replace(/\s/g,"") == ""){
                return false;
            }
            else{
                return true;
            }
        }

        //Function to return empty fields message
        function emptyFielsMessage(){
            var x = document.querySelectorAll(".modalResponse");
            var i;
            for (i = 0; i < x.length; i++) {
                x[i].innerHTML = '<span style="color:red;">Empty fields, please fill in all fields</span>';
            }
        }


        //Function to return modal messages
        function defineModalMessage(message){
            var x = document.querySelectorAll(".modalResponse");
            var i;
            for (i = 0; i < x.length; i++) {
                x[i].innerHTML = message;
            }
        }


        //Function to clear all modal messages
        function clearModalMessage(){
            var x = document.querySelectorAll(".modalResponse");
            var i;
            for (i = 0; i < x.length; i++) {
                x[i].innerHTML = ' ';
            }
        }

        //Function to generate CSS preloader
        function loadingBar(){
            const loader = `<tr>
                                    <td colspan="4">  
                                        <div style="text-align:center">Loading data...</div>
                                        <br>
                                        <div id="floatBarsG">
                                            <div id="floatBarsG_1" class="floatBarsG"></div>
                                            <div id="floatBarsG_2" class="floatBarsG"></div>
                                            <div id="floatBarsG_3" class="floatBarsG"></div>
                                            <div id="floatBarsG_4" class="floatBarsG"></div>
                                            <div id="floatBarsG_5" class="floatBarsG"></div>
                                            <div id="floatBarsG_6" class="floatBarsG"></div>
                                            <div id="floatBarsG_7" class="floatBarsG"></div>
                                            <div id="floatBarsG_8" class="floatBarsG"></div>
                                        </div>
                                    </td>
                                </tr>`
            return loader
        }





        function AddToCart(id, item, quantity, price){
            //store items data in javascript localStorage
            localStorage.setItem("item" + id, item);
            localStorage.setItem("quantity" + id, quantity);
            price = price * quantity;
            localStorage.setItem("price" + id, price);

            // Get the existing data
            var existing = localStorage.getItem('ids');

            // If no existing data, create an array
            // Otherwise, convert the localStorage string to an array
            existing = existing ? existing.split(',') : [];

            // Add new data to localStorage Array
            existing.push(id);

            //Remove  duplicated values
            let uniqids = [ ...new Set(existing) ];
            console.log(uniqids)

            // Save back to localStorage
            localStorage.setItem('ids', uniqids.toString());

            //show item name added to cart
            document.querySelector("#cartAddMessage").innerHTML = `
                Item <b>`+item+`</b> was successfully added to cart!    
                <div class="mt-3 mb-3">
                    <a href="shopping-cart.html">See items in shopping cart</a>
                </div>

                <div class="mt-3 mb-3">
                    <a href="javascript:void(0);" data-dismiss="modal" aria-label="Close">Continue shopping</a>
                </div>

            `
        }



        //Load div with id="shopping-cart" from file "shopping-cart.html"
        $("#shoppingCartMini").load("shopping-cart.html #shopping-cart");

        function reloadMiniCart(){
            setTimeout(function(){ 
                shoppingCart();
            }, 200);
            
        }



        //Show stored item data
        function shoppingCart(){

            let total = 0; // Total items in LocalStorage

            let cartItems = '';
            let subTotal = []

            let ids = []
            ids = localStorage.getItem('ids')
            ids = ids.split(',')
            
            
            for (let id of ids) {
         
                //Get item data from localStorage
                let prod = localStorage.getItem("item" + id + ""); 
                if(prod != null) {	

                    subTotal[id] = (parseFloat(localStorage.getItem("price" + id)) * parseFloat(localStorage.getItem("quantity" + id))).toFixed(2)

                    cartItems += `
                            <div class="row">

                                <div style="padding: 8px 20px 0px 16px">
                                    <h5 class="item-name">
                                        `+localStorage.getItem("item" + id)+
                                    `</h5>
                                </div>
        
                                <div style="padding: 12px 5px 0px 5px">
                                    <h6>
                                        $`+parseFloat(localStorage.getItem("price" + id)).toFixed(2)+`
                                        <span class="text-muted"> x </span>
                                    </h6>
                                </div>

                                <div style="padding: 2px 5px 0px 0px">
                                    <div class="quantity">
                                        <input type="number" step="1" max="99" min="1" id="qty`+id+`" class="qty" value="`+localStorage.getItem("quantity" + id)+`" onchange="changeQuantityFromCart('`+id+`')">
                                    </div>
                                </div>

                                <div style="padding: 8px 5px 0px 5px">
                                    $`+subTotal[id]+`
                                </div>

                                <div style="padding: 0px 5px 0px 5px">
                                    <button type="button" class="btn btn-outline-danger btn-xs" onclick="removeFromCart('`+id+`')">
                                        <i class="fa fa-trash" aria-hidden="true"></i>
                                    </button>
                                </div>
                                
                            </div>
                            <hr>
                            `

                    
                    total += parseFloat(subTotal[id]);
                }
            } 

            document.getElementById("items").innerHTML = cartItems;
            //Show total price with two decimals
            document.getElementById("total").innerHTML = total.toFixed(2); 

            
        }





        function removeFromCart(id){

            //Remove stored data in localStorage
            window.localStorage.removeItem("item" + id);
            window.localStorage.removeItem("quantity" + id);
            window.localStorage.removeItem("price" + id);

            let ids = []
            ids = localStorage.getItem('ids')
            //convert string with another strings separated with comma in array
            ids = ids.split(',')
            //search defined id in array
            ids = ids.filter(item => item !== id)

            // Save back to localStorage
            window.localStorage.setItem('ids', ids.toString());

            console.log(window.localStorage.getItem('ids'))

            //Refresh shopping Cart
            shoppingCart()
        }  


         function changeQuantityFromCart(id){

            //get quantity defined in field with prop id
            let newQuantity = document.getElementById("qty"+id).value;

            //set in localStorage the new quantity defined in field with prop id
            window.localStorage.setItem("quantity" + id, newQuantity);

            setTimeout(function(){
                shoppingCart()
            }, 200);

        }  




        async function insert(){

            let id = '';
            let status = '';
            let message = '';

            //get data from inputs
            const name = document.querySelector("#insertName").value;
            const price = document.querySelector("#insertPrice").value.replace(",", "");
            const description = document.querySelector("#insertDescription").value;

            let data = new FormData()

            //convert to form data and apend to send to server
            data.append('name', name);
            data.append('price', price);
            data.append('description', description);

            //convert data form object to JSON
            formData = JSON.stringify(Object.fromEntries(data));

            //verify if field is not empty
            if(isNotEmpty(name) && isNotEmpty(price) && isNotEmpty(description)){

                const url = APIUrl;

                await fetch(url, {
                method: "post",
                headers: {
                    'Content-Type': 'application/json'
                },
                //Send form data in body
                body: formData

                }).then( (response) => { 

                    status = response.status;
                    //convert data in JSON format
                    data = response.json();
                    return data

                    
                }).then((data) => { 

                    message = data.message;

                    if(status == 201){

                        id = data.serial;

                        defineModalMessage('<span style="color:green">item &nbsp;<b>' + name + '</b>&nbsp; has been successfully inserted</span>');
                        
                        document.querySelector("#formInsert").reset();
                        document.querySelector("#list").innerHTML = ''
    
    
                        document.querySelector("#message-alert").innerHTML = `<div class="alert alert-success alert-dismissible fade show" role="alert">                  
                            item <b>` + name + `</b> has been successfully inserted
                            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                            </div>`
                    }
                    else{
                        console.error(message);
                        defineModalMessage(message);  
                    }
                   


                }).catch(function(err){ 

                    console.error('Failed to insert data', err);
                    defineModalMessage('Failed to insert data, ' + err);   

                });
  

                //If image was select in input type file
                if(document.querySelector('#insertImage').files.length > 0){  
                    
                    //change to loading bar preloader
                    document.querySelector("#list").innerHTML = loadingBar()

                    const image = document.querySelector('#insertImage');
    
                    let imageData = new FormData()
                    //get image in formdata object and apend
                    imageData.append('image', image.files[0]) 

        
                    //Image uploaded in PUT method
                    await fetch(url+'/'+id, {
                        method: "put",
                        //define 'enctype': 'multipart/form-data' to allow send files
                        headers: {
                            'enctype': 'multipart/form-data'
                        },
        
                        
                        body: imageData
                        }).then( (response) => { 

                            status = response.status;
                            data = response.json();
                            return data
        
                            
                        }).then((data) => { 

                            message = data.message;

                             document.querySelector("#list").innerHTML = ''

                            if(status == 200 || message == 'Item data missing'){
                                document.getElementById("formInsertImage").reset(); 
                            }
                            else{
                                console.error(message);
                                defineModalMessage(message);
                            }
             
        
                        }).catch(function(err){ 
        
                            console.error('Failed update image, ' + err);
                            defineModalMessage('Failed update image, ' + err);
                        
                        });  

                }

                //Clear items list
                document.querySelector("#list").innerHTML = ''; 
                //Refresh items list with new insert item
                listAll();
            }
            else{

                emptyFielsMessage();

            }



        }






        async function listAll(){

            document.querySelector("#list").innerHTML = loadingBar()

            await fetch(APIUrl)
                .then(function(response){

                    let status = response.status;

                    response.json().then(function(data){

                        document.querySelector("#list").innerHTML = ' ';

                        data = data.data

                        for (i = 0; i < data.length; i++) {

                            data[i] = data[i].attributes

                            let tr = document.createElement("tr");
                            tr.setAttribute("id", 'row-'+data[i].serial);

                            const image = imagesUrl+'/'+data[i].image+'?updated='+data[i].updated;

                            //Generate table cells of table with items data
                            tr.innerHTML = '' +
                                           '<td><img src="' + image + '" alt="' + data[i].name + '" class="table-image"></td>' +
                                           '<td>' + data[i].name + '</td>' +
                                           '<td class="hidden_in_mobile">$' + moneyFormat(data[i].price) + '</td>' +
                                           '' +
                                 

                            '<td> <a href="javascript:void(0);" class="table-icon" onclick=list("'+data[i].serial+'") data-toggle="modal" data-target="#updateModal"><i class="fas fa-edit"></i></a>'  +
                            '<a href="javascript:void(0);" class="table-icon" onclick=list("'+data[i].serial+'") data-toggle="modal" data-target="#deleteModal"><i class="fas fa-trash"></i></a>' +
                            '';
                            
                            //Put table cells in table rows
                            document.getElementById("list").appendChild(tr);


                        }

                
                    });
                })
                .catch(function(err){ 

                    console.error('Failed retrieving information', err);
                    document.querySelector("#message-alert").innerHTML = 'Failed retrieving information, '+ err;

                 });

                document.getElementById("formSearch").reset();
        }






        async function search(){

            document.querySelector("#list").innerHTML = loadingBar()

            let search =  document.querySelector("#search").value;

            if(isNotEmpty(search)){

                //Encode to url format
                search = encodeURI(search);

                await fetch(APIUrl+'?search='+search)
                    .then(function(response){

                        let status = response.status;

                        response.json().then(function(data){

                            data = data.data
  
                            document.querySelector("#list").innerHTML = ' '
             
                            if(data.length > 0){

                                document.querySelector("#list").innerHTML = ' '
                                for (i = 0; i < data.length; i++) {

                                    data[i] = data[i].attributes

                                    let tr = document.createElement("tr");
                                    tr.setAttribute("id", 'row-'+data[i].serial);

                                    const image = imagesUrl+'/'+data[i].image+'?updated='+data[i].updated;
                                    tr.innerHTML = '' +
                                                '<td><img src="' + image + '" alt="' + data[i].name + '" class="table-image"></td>' +
                                                '<td>' + data[i].name + '</td>' +
                                                '<td class="hidden_in_mobile">$' + moneyFormat(data[i].price) + '</td>' +
                                                '' +
                                        

                                    '<td> <a href="javascript:void(0);" class="table-icon" onclick=list("'+data[i].serial+'") data-toggle="modal" data-target="#updateModal"><i class="fas fa-edit"></i></a>'  +
                                    '<a href="javascript:void(0);" class="table-icon" onclick=list("'+data[i].serial+'") data-toggle="modal" data-target="#deleteModal"><i class="fas fa-trash"></i></a>' +
                                    '';

                                    document.getElementById("list").appendChild(tr);
                                }

                            }

                            else{
                                //If search not found
                                document.querySelector("#list").innerHTML = `<tr>
                                    <td colspan="4">  
                                        No search found
                                    </td>
                                </tr>`
                            }

                    
                        });
                    })
                    .catch(function(err){ 

                        console.error('Failed retrieving information', err);
                        document.querySelector("#message-alert").innerHTML = 'Failed retrieving information, '+ err;

                    });

                }
                else{

                    document.querySelector("#list").innerHTML = ''
                    listAll();
                }

                search = '';
        }





        async function list(id){

            const url = APIUrl+'/'+id;

            await fetch(url)
                .then(function(response){

                    let status = response.status;
 
                    response.json().then(function(data){         

                        //get only one register
                         data = data.data[0].attributes

                         const createDate = data.created
                         const updateDate = data.updated
                   
                        //fill input fields and divs with data from server
                         document.querySelector("#showUpdateId").innerHTML = 'Item ID: <b>' + id + '</b>'
                         document.querySelector("#created").innerHTML = 'Created at: <b>' + createDate + '</b>'
                         document.querySelector("#updated").innerHTML = 'Updated at: <b>' + updateDate + '</b>'

                         document.querySelector("#updateId").value = id
                         document.querySelector("#updateName").value = data.name
                         document.querySelector("#updatePrice").value = moneyFormat(data.price)
                         document.querySelector("#updateDescription").value = data.description

                         document.querySelector("#showUpdateImage").src = imagesUrl+'/'+data.image+'?updated='+updateDate
                         
                         document.querySelector("#showDeleteName").innerHTML = 'Really delete item: <b>' + data.name + '</b> ?'
                         document.querySelector("#deleteId").value = id
                         document.querySelector("#deleteName").value = data.name

                        id = '';
                    });
                })
                .catch(function(err){ 

                    console.error('Failed retrieving information', err);
                    defineModalMessage('Failed retrieving information, ' + err);
                
            });

            
        }

        
        

        async function update(){

            //Get data from input fields
            const id = document.querySelector("#updateId").value;
            const name = document.querySelector("#updateName").value;
            const price = document.querySelector("#updatePrice").value.replace(",", "");
            const description = document.querySelector("#updateDescription").value;

            let status = '';
            let message = '';


            let data = new FormData()

            data.append('name', name);
            data.append('price', price);
            data.append('description', description);

            formData = JSON.stringify(Object.fromEntries(data));

            //verify if values is not empty
            if(isNotEmpty(id) && isNotEmpty(name) && isNotEmpty(price) && isNotEmpty(description)){

                const url = APIUrl+'/'+id;

                await fetch(url, {
                method: "put",
                headers: {
                    'Content-Type': 'application/json'
                },

                //make sure to serialize your JSON body
                body: formData
                }).then( (response) => { 

                    status = response.status;
                    data = response.json();
                    return data

                    
                }).then((data) => { 

                    message = data.message;

                    if(status == 200){
                        $('.modal').modal('hide');
                        document.querySelector("#formUpdate").reset();
                        document.querySelector("#list").innerHTML = ''; 

                        document.querySelector("#message-alert").innerHTML = `<div class="alert alert-success alert-dismissible fade show" role="alert">                  
                            item <b>` + name + `</b> has been successfully updated
                            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>`
                    }
                    else{
                        console.error(message);
                        defineModalMessage(message);
                    }

                }).catch(function(err){ 

                    console.error('Failed update data, ' + err);
                    defineModalMessage('Failed update data, ' + err);
                   
                });  


                //verify if image file was send 
                if(document.querySelector('#updateImage').files.length > 0){   
                     
                    document.querySelector("#list").innerHTML = loadingBar();
                                
                                
                    const image = document.querySelector('#updateImage');

                    let imageData = new FormData()
                    imageData.append('image', image.files[0]) 
        

                    await fetch(url, {
                        method: "put",
                        headers: {
                            'enctype': 'multipart/form-data'
                        },
  
                        body: imageData
                        }).then( (response) => { 

                            status = response.status;
                            data = response.json();
                            return data
                            
                        }).then((data) => {

                            document.querySelector("#list").innerHTML = ''
    
                            message = data.message;

                            if(status == 200 || message == 'Item data missing'){
                                document.getElementById("formUpdateImage").reset();
                            }
                            else{
                                console.error(message);
                                defineModalMessage(message);
                            }
                            
        
                        }).catch(function(err){ 
        
                            console.error('Failed update image, ' + err);
                            defineModalMessage('Failed update image, ' + err);
                        
                        });      

                      

                }

                document.querySelector("#list").innerHTML = ''; 
                listAll();

            }
            else{

                emptyFielsMessage();

            }



        }
        
        

        async function remove(){

            const id = document.querySelector("#deleteId").value;
            const name = document.querySelector("#deleteName").value;

            let status = '';

            if(isNotEmpty(id) && isNotEmpty(name)){

                const url = APIUrl+'/'+id;

                await fetch(url, {
                method: "delete"
                })
                .then( (response) => { 

                    status = response.status;

                    if(status == 204){

                        document.querySelector("#message-alert").innerHTML = `<div class="alert alert-success alert-dismissible fade show" role="alert">                  
                        item <b>` + name + `</b> has been successfully deleted
                        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                        </div>`


                        $('.modal').modal('hide');
                        document.querySelector("#formDelete").reset();

                        //Remove row from table
                        document.querySelector("#row-"+id).remove();
                        document.querySelector("#deleteId").value = '';
                        document.querySelector("#deleteName").value = '';

                    }
                    else{
                        console.error('Failed to delete data');
                        defineModalMessage('Failed to delete data');   
                    }


                    

                }).catch(function(err){ 

                    console.error('Failed to delete data ', err);
                    defineModalMessage('Failed to delete data, ' + err);           

                });

            }

            else{
                emptyFielsMessage();
            }
           
        }




        async function listItems(){

            await fetch(APIUrl)
                .then(function(response){

                    response.json().then(function(data){

                        data = data.data

                        let items = '';

                        for (i = 0; i < data.length; i++) {

                            data[i] = data[i].attributes

                            items += `
                            <div class="col-md-4">
                                <figure class="card card-item-grid card-lg"> <a href="item.html?slug=`+data[i].slug+`" class="img-wrap" data-abc="true"><img src="`+imagesUrl+'/'+data[i].image+`"></a>
                                    <figcaption class="info-wrap">
                                        <div class="row">
                                            <div class="col-md-8"> <a href="item.html?slug=`+data[i].slug+`" class="title" data-abc="true">`+data[i].name+`</a> </div>
             
                                        </div>
                                    </figcaption>
                                    <div class="bottom-wrap"> <a data-toggle="modal" data-target="#cartMessageModal" onclick="AddToCart('`+data[i].serial+`', '`+data[i].name+`', '1', '`+data[i].price+`')" href="javascript:void(0);" class="btn btn-primary float-right" data-abc="true"> <i class="fas fa-shopping-cart"></i> Add to cart </a>
                                        <div class="price-wrap"> <span class="price h5">$`+moneyFormat(data[i].price)+`</span> <br> <small class="text-success">Free shipping</small> </div>
                                    </div>
                                </figure>
                            </div>
                            `
                        }

                        document.getElementById("itemsList").innerHTML = items;
                
                    });
                })
                .catch(function(err){ 
                    console.error('Failed retrieving information', err);
              
                 });

               
        }


        

        async function searchItems(){

            let search =  document.querySelector("#search").value;

            if(isNotEmpty(search)){

                search = encodeURI(search);

                await fetch(APIUrl+'?search='+search)
                    .then(function(response){

                        response.json().then(function(data){

                            data = data.data

                            let items = '';

                            if(data.length > 0){
                                for (i = 0; i < data.length; i++) {

                                    data[i] = data[i].attributes

                                    items += `
                                    <div class="col-md-4">
                                        <figure class="card card-item-grid card-lg"> <a href="item.html?slug=`+data[i].slug+`" class="img-wrap" data-abc="true"><img src="`+imagesUrl+'/'+data[i].image+`"></a>
                                            <figcaption class="info-wrap">
                                                <div class="row">
                                                    <div class="col-md-8"> <a href="item.html?slug=`+data[i].slug+`" class="title" data-abc="true">`+data[i].name+`</a> </div>
                    
                                                </div>
                                            </figcaption>
                                            <div class="bottom-wrap"> <a data-toggle="modal" data-target="#cartMessageModal" onclick="AddToCart('`+data[i].serial+`', '`+data[i].name+`', '1', '`+data[i].price+`')" href="javascript:void(0);" class="btn btn-primary float-right" data-abc="true"> <i class="fas fa-shopping-cart"></i> Add to cart </a>
                                                <div class="price-wrap"> <span class="price h5">$`+moneyFormat(data[i].price)+`</span> <br> <small class="text-success">Free shipping</small> </div>
                                            </div>
                                        </figure>
                                    </div>
                                    `

                                }

                                document.getElementById("itemsList").innerHTML = items;
                            }
                            else{
                                document.getElementById("itemsList").innerHTML = '<div class="col-md-12">No item found</div>'
                            }
                    
                        });
                    })
                    .catch(function(err){ 
                        console.error('Failed retrieving information', err);
                
                    });

            }
            else{
                document.getElementById("itemsList").innerHTML = '';
                listItems()
            }

        }



        async function listOneItem(slug){

            await fetch(APIUrl+'/'+slug)
            .then(function(response){

                let status = response.status;

                response.json().then(function(data){
                    
                    let items = ''

                    if(status == 200){

                        data = data.data[0].attributes

                        addToCartButton(data.serial, data.name, data.price);

                        items = `
                        <div class="card">
                        <div class="row">
                            <aside class="col-sm-7 border-right">
                            <article class="gallery-wrap"> 
                            <div class="img-big-wrap">
                                <div> 
                                    <a href="`+imagesUrl+'/'+data.image+`" target="_blank">
                                        <img src="`+imagesUrl+'/'+data.image+`" class="itemDetailImg">
                                    </a>
                                </div>
                            </div> 
                        
                            </article> <!-- gallery-wrap .end// -->
                                    </aside>
                                    <aside class="col-sm-5">
                            <article class="card-body p-5">
                                <h3 class="title mb-3">`+data.name+`</h3>
                        
                            <p class="price-detail-wrap"> 
                                <span class="price h3 text-warning"> 
                                    <span class="currency">$</span><span class="num">`+moneyFormat(data.price)+`</span>
                                </span> 
                                
                            </p> <!-- price-detail-wrap .// -->
                            <dl class="item-property">
                            <dt>Description</dt>
                            <dd><p>`+data.description+`</p></dd>
                            </dl>
                        
                        
                            <hr>
                                <div class="row">
                                    <div class="col-sm-5">
                                        <dl class="param param-inline">
                                        <dt>Quantity: </dt>
                                        <dd>
                                            <input type="number" step="1" max="99" min="1" value="1" class="mt-2" id="qtd" onchange="addToCartButton('`+data.serial+`', '`+data.name+`', '`+data.price+`')">
                                        </dd>
                                        </dl>  <!-- item-property .// -->
                                    </div> <!-- col.// -->
                        
                                    
                                </div> <!-- row.// -->
                                <hr>
                               

                                <span id="cartBtn"></span>


                            </article> <!-- card-body.// -->
                                    </aside> <!-- col.// -->
                                </div> <!-- row.// -->
                            </div> <!-- card.// -->
                        `
                    }

                    else{
                        items = `Item not found`
                    }


                    document.getElementById("itemDetails").innerHTML = items;
                    
                });
            })
            .catch(function(err){ 

                console.error('Failed retrieving information', err);
                defineModalMessage('Failed retrieving information, ' + err);
            
            });

               
        }



        function addToCartButton(id, name, price){

            setTimeout(function(){ 

                let qtd = 1;

                if(document.getElementById("qtd") == null){
                    qtd = 1
                }
                else{
                    qtd = document.getElementById("qtd").value
                }

                console.log(qtd) 
                let button = `
                <a data-toggle="modal" data-target="#cartMessageModal" onclick="AddToCart('`+id+`', '`+name+`', '`+qtd+`', '`+price+`')" href="javascript:void(0);" class="btn btn-primary" data-abc="true"> 
                    <i class="fas fa-shopping-cart"></i> Add to cart 
                </a>
                `

                document.getElementById("cartBtn").innerHTML = button;

            }, 100);
        }


  
        