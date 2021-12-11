const sharp=require("sharp")
const file=require("fs")
const axios = require("axios");
const http = require('http')
const https = require('https');
var Stream = require('stream').Transform;

const downloadImageFromURL = (url, filename,original, callback) => {
    try{
      var client = http;
      if (url.toString().indexOf("https") === 0){
        client = https;
       }
    
      client.request(url, function(response) {                                        
        var data = new Stream();                                                    
    
        response.on('data', function(chunk) {                                       
           data.push(chunk);                                                         
        });                                                                         
    
        response.on('end', function() {     
            let path="public/images/"                                        
           file.writeFileSync(path+filename, data.read());  
           resizeImage(filename,500,300,"m"+filename).then(()=>{deleteImage(filename);
          
               mergeImage(filename,path,original).then(()=>{deleteImage("m"+filename)  }).catch((err)=>{deleteImage("m"+filename);console.log("error",err)})                     
          }).catch((err)=>{deleteImage(filename);console.log(err)})
        });                                                                         
     }).end();
     return true;
  }
  catch(e){
      console.log(e)
      return false
  }
  };
  
  async function mergeImage(filename,path,original){
  
      console.log(path +"m"+ filename)
      await sharp(path +"m"+ filename)
      .composite([{input: path + original, gravity: 'south' }])
      .toFile(path+filename);  
      
  } 
  function deleteImage(filename){
      file.unlinkSync(`public/images/${filename}`)
  }
  async function resizeImage(filename,width,height,finalFileName) {
      try {
        await sharp(`public/images/${filename}`)
          .resize({
            width: width,
            height: height
          })
          .toFile(`public/images/${finalFileName}`);
      } catch (error) {
        console.log(error);
      }
    }

module.exports={downloadImageFromURL,deleteImage,resizeImage,mergeImage}