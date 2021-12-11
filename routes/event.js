const express=require("express")
const router=express.Router()
const sharp=require("sharp")
const upload=require("./upload")
const file=require("fs")
const axios = require("axios");
const cheerio = require("cheerio");
const http = require('http')
const https = require('https');
var Stream = require('stream').Transform;

  
var downloadImageFromURL = (url, filename, callback) => {
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
         resizeImage(filename,500,300).then(()=>{deleteImage(filename);
        
             mergeImage(filename,path).then(()=>{deleteImage("m"+filename)  }).catch((err)=>{console.log("error",err)})                     
        }).catch((err)=>{console.log(err)})
      });                                                                         
   }).end();
   return true;
}
catch(e){
    console.log(e)
    return false
}
};

async function mergeImage(filename,path){
    console.log(path +"m"+ filename)
    await sharp(path +"m"+ filename)
    .composite([{input: path + 'b.png', gravity: 'south' }])
    .toFile(path+filename);  
    
} 
function deleteImage(filename){
    file.unlinkSync(`public/images/${filename}`)
}
async function resizeImage(filename,width,height) {
    try {
      await sharp(`public/images/${filename}`)
        .resize({
          width: width,
          height: height
        })
        .toFile(`public/images/m${filename}`);
    } catch (error) {
      console.log(error);
    }
  }


router.post("/setbackground",upload.single("picture"),async(req,res)=>{
    try{
        console.log(req.body)
        let eventType=req.body.eventType
        let keyword=req.body.keyword
        let url=`https://www.google.com/search?q=${eventType}+${keyword}&sxsrf=AOaemvIbrtqI8yK9GHNcFZYRidCXKotN5A:1639203389198&source=lnms&tbm=isch&sa=X&ved=2ahUKEwi0t-i9jNv0AhWNNpQKHbX0CkIQ_AUoAXoECAEQAw&biw=1366&bih=657&dpr=1`
        let {data}=await axios.get(url)
        let html=cheerio.load(data)
        let img=html("img")
        let i=0;
        img.each((index,el)=>{
            if(el.name==="img" && (el.attribs.src.toString().indexOf("https") === 0 || el.attribs.src.toString().indexOf("http") === 0)){
                a=downloadImageFromURL(el.attribs.src,req.body.filename+i+".png")
                if(!a){
                    deleteImage(req.body.filename+i+".png")
                }
                i++;
            }
        })
        return res.status(200).json({status:true,filename:req.body.filename,count:i})
    }
    catch(e){
        console.log(e)
        file.unlinkSync(`public/images/${req.body.filename}`)
        return res.status(500).json({status:false})
    }
    
})

module.exports=router;





// router.get("/test",async(req,res)=>{
//     try{
//         req.body.filename="testststts"
//         let eventType="agra"
//         let keyword="taj mahal"
//         let url=`https://www.google.com/search?q=${eventType}+${keyword}&sxsrf=AOaemvIbrtqI8yK9GHNcFZYRidCXKotN5A:1639203389198&source=lnms&tbm=isch&sa=X&ved=2ahUKEwi0t-i9jNv0AhWNNpQKHbX0CkIQ_AUoAXoECAEQAw&biw=1366&bih=657&dpr=1`
//         let {data}=await axios.get(url)
//         let html=cheerio.load(data)
//         let img=html("img")
//         let i=1
//         img.each((index,el)=>{
//             if(el.name==="img" && (el.attribs.src.toString().indexOf("https") === 0 || el.attribs.src.toString().indexOf("http") === 0)){
//                 downloadImageFromURL(el.attribs.src,req.body.filename+i+".png")
                
//                 console.log(el.attribs.src)
//                 i++;
//             }
//         })
//         return res.status(200).json({status:true})
//     }
//     catch(e){
//         console.log(e)
//         return res.status(500).json({status:false})
//     } 
// })
