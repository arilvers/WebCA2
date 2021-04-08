const express = require('express')
const mongoose = require('mongoose');
require('dotenv').config();
const fs = require('fs')
const sanitizer = require('sanitizer');
const striptags = require('striptags');
const fileUpload = require('express-fileupload');
const cors = require('cors')


const app = express()

//Database credentials defined in .env file
const dbServer = process.env.DB_SERVER;
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbCluster = process.env.DB_CLUSTER;

//change connectionString acording to your server connection - in this case, is Atlas Mongo DB
let connectionString =  ''+dbServer+dbUser+':'+dbPassword+dbCluster+dbName;


mongoose.Promise = global.Promise;
//Connect to Mongo database
mongoose.connect(connectionString, {
    useNewUrlParser: true , 
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false 
}).then(()=>{
    console.log("Database connected");
}).catch((err)=>{
    console.log("Error to connect database: " + err);
});


//get current date in usual format
const getDateTime = function() {

    let dt = new Date();

    year  = dt.getFullYear();
    month = (dt.getMonth() + 1).toString().padStart(2, "0");
    day   = dt.getDate().toString().padStart(2, "0");
    hour   = dt.getHours().toString().padStart(2, "0");
    minute   = dt.getMinutes().toString().padStart(2, "0");
    second   = dt.getSeconds().toString().padStart(2, "0");

    //Formated date
    return year+'-'+month+'-'+day+' '+hour+':'+minute+':'+second;
}


//Define model to generate database and collection automatically
const itemSchema = mongoose.Schema({
    serial: { type: String,  unique: true, required: true, trim: true },
    name: { type: String, unique: true, required: true, trim: true },
    slug: { type: String, unique: true, required: true, trim: true },
    price:{ type: String , required: true, trim: true },
    description: { type: String, required: true, trim: true },
    created: { type: String, default: getDateTime() },
    updated: { type: String, default: getDateTime() }
});

//Generate Collection item
const Item = mongoose.model('item', itemSchema);


//Function to format data into json
const transformer = item => ({
    type: 'items',
    attributes: {
        serial: item.serial,
        name: item.name,
        slug: item.slug,
        price: item.price,
        description: item.description,
        image: `/images/${item.serial}.jpg`,
        created: item.created,
        updated: item.updated
    },
    links: {
        self: `/api/items/${item.serial}`
    }
}); 


app.use(
    express.json(), //acept json data
    express.static("src/front-end"), //specify static folder
    express.static('src/api/public'), //specify another static folder
    fileUpload(), //allow file upload
    cors() //Allow requests for all origins
)

/* front-end - Read - GET method */
app.get('/', (req, res) => {
    res.sendFile('src/front-end/');
})


/* Create - POST method */
app.post('/api/items', async(req, res) => {

    //create item object for fields
    let inputData = {}

    //get serial by Timestamp
    inputData.serial = getTimestamp();

    //Sanitize fields 
    inputData.name = sanitize(req.body.name);

    //Generate slug field
    inputData.slug = toSEOString(inputData.name)

    //Define format of Float(Double) type
    inputData.price = parseFloat(sanitize(req.body.price))

    inputData.description = sanitize(req.body.description);



    if(req.files == null || req.files == ''){

        //Generate defult image named with item serial
        inputData.image = 'images/'+inputData.serial+'.jpg'

        //Copy default image to images folder
        fs.copyFile('src/api/public/images/dont-delete/default.jpg', 'src/api/public/'+inputData.image+'', (error) => { 
            if (error) { 
                return res.status(500).send(
                    {
                        message: 'Image not copied to server folder'
                    }
                )
            } 
        });
    }
    else{
        //request file
        image = req.files.image;
        imagePath = 'src/api/public/images/'+inputData.serial+'.jpg'

        //Save image in server
        const imageStored = saveImage(image, imagePath);

        if(imageStored){
            inputData.image = 'images/'+inputData.serial+'.jpg'
        }
        else{
            return res.status(500).send(
                {
                    message: 'Image not uploaded'
                }
            )
        }

    }



    //check if the inputData fields are missing or empty
    if (empty(inputData.name) || empty(inputData.price) || empty(inputData.description)) {
        return res.status(202).send(
            {
                message: 'Item data missing'
            }
        )
    }


    verify = await Item.findOne({ name: inputData.name }, 'name').exec();
    if (verify !== null){
        if (verify.name == inputData.name) {
            return res.status(202).send(
                {
                    message: 'This item name already exists'
                }
            )
        }
    }

    
    //save the new item data to database
    new Item({
        serial:  inputData.serial,
        name:  inputData.name,
        slug:  inputData.slug,
        price: inputData.price,
        description:  inputData.description
    }).save().then(() => {
        //console.log('registered succesfull')
    }).catch((error) =>{
        console.log('Error to register '.error)
    })
    

    //Generate link
    const linkSelf = req.protocol+'://'+req.get('host')+req.originalUrl

    //Generate image link from image stored in server
    const linkImage = (linkSelf).slice(0, -10)
    
    //Formated response 
    res.status(201).send(
        {
            serial: inputData.serial,
            message: ''+inputData.name+' item has been successfully created',
            self: linkSelf+'/'+inputData.serial,
            image: linkImage+'/images/'+inputData.serial+'.jpg'
        }
    )
})



/* Read - GET method */
app.get('/api/items', async(req, res) => {

    let items = {}

    //Search for name
    if(req.query.search && req.query.search !== null){

        const search = sanitize(req.query.search);
        items = await Item.find( { $or:[ 
            {'name': { "$regex": search, $options: 'i' }},  
            {'description': { "$regex": search, $options: 'i' }} 
        ]});

        if (Array.isArray(items) && items.length) {
            const data = {data: items.map(transformer)};
            res.status(200).send(data)
        }
        else{
            return res.status(404).send(
                {
                    message: 'Not exists items for search '+search+''
                }
            )
        }


    }
    else{

        items = await Item.find().sort({serial: -1})
        const data = {data: items.map(transformer)};
        res.status(200).send(data)

    }
})



/* Read one - GET method - get register by serial or slug */
app.get('/api/items/:serial', async (req, res) => {

    //get the serial from url
    const serial = sanitize(req.params.serial);

    let item = {};
    
    //If is number, search by serial, else, search by slug
    if(isNaN(serial)){
        //check if the slug exist
        item = await Item.findOne({ slug: serial }).exec();
    }
    else{
        //check if the serial exist
        item = await Item.findOne({ serial: serial }).exec();
    }


    if (item !== null) {
        const data = {data: [transformer(item)]};
        res.status(200).send(data)
    }
    else{
        return res.status(404).send(
            {
                message: 'The item with serial or slug '+serial+' not exist'
            }
        )
    }
    
})






/* Update - PUT method */
app.put('/api/items/:serial', async (req, res) => {
    //get the serial from url
    const serial = sanitize(req.params.serial);

    //Verify if exists item with this serial
    verify = await Item.findOne({ serial: serial }, 'serial name').exec();

    if (verify !== null){

        if (verify.serial == serial) {

            //create item object for fields
            let inputData = {}

            //get serial by url
            inputData.serial = sanitize(serial);

            //Sanitize fields 
            inputData.name = sanitize(req.body.name);

            //Generate slug field
            inputData.slug = toSEOString(inputData.name)

            //Define format of Float(Double) type
            inputData.price = parseFloat(sanitize(req.body.price))

            inputData.description = sanitize(req.body.description); 

        

            if(req.files == null || req.files == ''){

            }

            else{

                image = req.files.image;
                imagePath = 'src/api/public/images/'+inputData.serial+'.jpg'

                //Save image in server
                const imageStored = saveImage(image, imagePath);

                if(imageStored){
                    inputData.image = 'images/'+inputData.serial+'.jpg'
                }
                else{
                    return res.status(500).send(
                        {
                            message: 'Image not uploaded'
                        }
                    )
                }

            }


            //check if the inputData fields are missing
            if (empty(inputData.name) || empty(inputData.price) || empty(inputData.description)) {
                return res.status(202).send(
                    {
                        message: 'Item data missing'
                    }
                )
            }


            inputData.updated = getDateTime();

            const filter = { serial: inputData.serial };
            const update = { 
                name: inputData.name, 
                slug: inputData.slug,
                price: inputData.price,
                description: inputData.description,
                updated: inputData.updated,
            };


            await Item.findOneAndUpdate(filter, update);


            const linkSelf = (req.protocol+'://'+req.get('host')+req.originalUrl).slice(0, -14);
            const linkImage = linkSelf.slice(0, -10)



            res.status(200).send(
                {
                    serial: inputData.serial, 
                    message: ''+inputData.name+' item has been successfully updated',
                    self: linkSelf+'/'+inputData.serial,
                    image: linkImage+'/images/'+inputData.serial+'.jpg'
                }
            )
        }
    }
    else{
        return res.status(404).send(
            {
                message: 'Not exists item with this serial'
            }
        )
    }
})






/* Delete - Delete method */
app.delete('/api/items/:serial', async (req, res) => {
    
    const serial = sanitize(req.params.serial);
    
    verify = await Item.findOne({ serial: serial }, 'serial').exec();
    if (verify !== null){
        if (verify.serial == serial) {


            item = await Item.deleteOne({ serial: serial }).exec();

            //Remove image from server 
            imageToDelete = 'src/api/public/images/'+serial+'.jpg'
        
            try {
                fs.unlinkSync(imageToDelete)
                //file removed
            } catch(err) {
                console.error(err)
            }
            
        
            res.status(204).send(
                {
        
                }
            )
        }
    }
    else{
        return res.status(404).send(
            {
                message: 'Not exists item with this serial'
            }
        )
    }

    
    
})








/* util functions */

//get current date in timestamp format
const getTimestamp = () => {
    let dt = new Date();
    return dt.getTime();
}


//save image file in server folder
const saveImage = (file, path) => {
    // Use the mv() method to place the file somewhere on your server
    try{
        file.mv(path);
        return true;
    }catch(error){
        console.log(error);
        return false;
    }
}


//verify if value (string) is empty
function empty(string){
    //Force convert to string
    string = String(string);
    //Remove extra white spaces
    string = string.replace(/\s{2,}/g, '');

    if(string == null || string == ''){
        return true
    }
    else{
        return false
    }
}

//remove HTML tags and convert to plain text
function sanitize(value){
    value = striptags(value)
    value = sanitizer.sanitize(value)
    value = sanitizer.escape(value)
    //remove extra white spaces
    value = value.replace(/\s+/g, ' ').trim()
    return value
  }



  function toSEOString(string) {      
    // make the url lowercase         
    let encodedString = string.toString().toLowerCase(); 
    // replace & with and           
    encodedString = encodedString.split(/\&+/).join("-and-")
    // remove invalid characters 
    encodedString = encodedString.split(/[^a-z0-9]/).join("-");       
    // remove duplicates 
    encodedString = encodedString.split(/-+/).join("-");
    // trim leading & trailing characters 
    encodedString = encodedString.trim('-');  
    return encodedString; 
  }

/* util functions ends */



//configure the server port
var listener = app.listen(process.env.PORT, function(){
    console.log('Listening on port ' + listener.address().port); 
});