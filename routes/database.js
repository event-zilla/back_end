const sqlite=require("sqlite3").verbose()

const database=()=>{
    const db=new sqlite.Database("./event.db",sqlite.OPEN_READWRITE,(err)=>{
        if(err){
            console.log(err)
        }
        console.log("Connected......")
    })
    return db;
}
module.exports=database;