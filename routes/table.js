const db=require("./database")

const makeTable=()=>{
    let pool=db();
    pool.run("create table gallery(imageid integer primary key autoincrement,image text)",(err)=>{
        if(err){
            console.log(err)
        }
        console.log("Table Created.......")
        pool.close()
    })
}

module.exports={makeTable,db};