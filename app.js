//base for all course
const dotenv=require('dotenv');
dotenv.config();
const express = require("express");
const _=require("lodash")
const bodyParser = require("body-parser");
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
const mongoose=require("mongoose");
//original start
mongoose.connect(process.env.DATABASE)
.then(()=>{
  console.log("connection done");
}).catch((err)=>console.log(err))

 //content blueprint
 const itemsSchema=new mongoose.Schema({
   name:String
 })
 const Item=mongoose.model("Item",itemsSchema);
 const one=new Item({
   name:"Add a file"
 });
 const two=new Item({
   name:"Enter checkbox to delete"
 });
 
 const org=[one,two];
 // blue print of all type list
 const listSchema={
   name:String,
   items:[itemsSchema]
 };
 const List=mongoose.model("List",listSchema);



app.get("/", function(req, res) {
Item.find({},(err,foundItems)=>{
  if(foundItems.length==0)
  {
    Item.insertMany(org,(err)=>{
      if(err) console.log(err);
      else console.log(" successfully inserted org ");
    });
    res.redirect("/")

  }
  else{
  res.render("list", {listTitle: "Today", newListItems: foundItems});
  }
})

});

app.post("/", function(req, res){
  const listName=req.body.list;

  const item = req.body.newItem;

   const tempitem=new Item({
     name:item
   });
  //  console.log({item,listName});
   if(listName=="Today")
  { tempitem.save();
    res.redirect("/");}
    else
    {
      List.findOne({name:listName},(err,foundlist)=>{
        foundlist.items.push(tempitem);
        foundlist.save();
        res.redirect("/"+listName);

      })
    }
  

});
app.post("/delete",(req,res)=>{
  const checkbox=req.body.checkbox;
  const listname=req.body.ListName
  
  if(listname=="Today")
  {
    Item.deleteOne({_id:req.body.checkbox},(err)=>{
      if(err)console.log(err);
      
    })
    res.redirect("/");

  }
  else
  {
    List.findOneAndUpdate(
      {name:listname},
      {$pull:{items:{_id:checkbox}}},
      (err)=>{
        console.log(("done"));
      }
    )
    res.redirect("/"+listname)
     

     
    
  }
  
 
})
app.get("/:customurl",(req,res)=>{
  const customname=_.capitalize(req.params.customurl);
  List.findOne({name:customname},(err,findlist)=>{
    if(!err)
    {
      if(!findlist)
      {
        const list=new List({
          name:customname,
          items:org
        });
        list.save();
        console.log("created")
        res.redirect("/"+customname)
      }
      else res.render("list",{listTitle: customname, newListItems: findlist.items})
    }
  })
})
let port =process.env.PORT;
if(port==null||port=="")
{
  port=3000;
}
app.listen(port, function() {
  console.log("Server started on port 3000");
});
