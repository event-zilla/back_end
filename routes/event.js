const express=require("express")
const router=express.Router()
const upload=require("./upload")
const axios=require("axios");
const cheerio = require("cheerio");
const {downloadImageFromURL,deleteImage,resizeImage,mergeImage}=require("./imageAnalysis");

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