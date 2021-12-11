var multer=require('multer');
const generateUniqueId = require('generate-unique-id');
var des=multer.diskStorage({
    destination:(req,file,path)=>{
        path(null,"public/images");
    },
    filename:(req,file,path)=>{
        var id=generateUniqueId({
            length:10,
            includeSymbols:['@','$','!','^','&']
        })
        req.body['filename']=id
        path(null,(id+"1.png"));
    }
})
var upload=multer({storage:des});
module.exports=upload;