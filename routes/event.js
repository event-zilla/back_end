const express=require("express")
const router=express.Router()
const upload=require("./upload")
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


router.post("/setbackground",upload.single("picture"),async(req,res)=>{
    try{
        console.log(req.body)
        let eventType=req.body.eventType
        let keyword=req.body.keyword
        await resizeImage(req.body.filename+"1.png",200,200,req.body.filename+".png")
        deleteImage(req.body.filename+"1.png")
        let url=`https://www.google.com/search?q=${eventType}+${keyword}&sxsrf=AOaemvIbrtqI8yK9GHNcFZYRidCXKotN5A:1639203389198&source=lnms&tbm=isch&sa=X&ved=2ahUKEwi0t-i9jNv0AhWNNpQKHbX0CkIQ_AUoAXoECAEQAw&biw=1366&bih=657&dpr=1`
        let {data}=await axios.get(url)
        let html=cheerio.load(data)
        let img=html("img")
        let i=0;
        img.each((index,el)=>{
            if(el.name==="img" && (el.attribs.src.toString().indexOf("https") === 0 || el.attribs.src.toString().indexOf("http") === 0)){
                a=downloadImageFromURL(el.attribs.src,req.body.filename+i+".png",req.body.filename+'.png')
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
        deleteImage(`${req.body.filename}.png`)
        return res.status(500).json({status:false})
    }
    
})

router.post("/deleteimage",(req,res)=>{
  try{
      let count=req.body.count;
      let filename=req.body.filename;
      for(let i=0;i<parseInt(count);i++){
        deleteImage(filename+i+".png")
      }
  }
  catch(e){
    console.log(e)
    res.status(500).json({"status":false})
  }
})

module.exports=router;