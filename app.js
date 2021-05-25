//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _=require("lodash");

const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin_aniket:Aniket@1102@clustertodolist.njzcs.mongodb.net/todolistDB", {useNewUrlParser: true,  useUnifiedTopology: true});

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name:"Welcome to To DO List "
});

const item2 = new Item({
  name:"Hit + to add an item"
});

const item3 = new Item({
  name:"<-- Hit to delete the item "
});

defaultItem = [item1,item2,item3];

const listsSchema = new mongoose.Schema({
  name: String,
  item: [itemsSchema]
});

const List = mongoose.model("List",listsSchema);







app.get("/", function(req, res) {

  Item.find({},function(err,foundItems){
    if (foundItems.length==0){
      Item.insertMany(defaultItem,function(err){
        if (err){
          console.log("Error");
        }
        else{
          console.log("Sucessfully added default Items");
        }
      }) ;
      res.redirect("/");
}
else{
    res.render("list", {listTitle: "Today", newListItems: foundItems});
}
  });

});

app.post("/", function(req, res){
const itemName = req.body.newItem;
const listName = req.body.list;


  const item = new Item({
    name: itemName

  });

  if (listName==="Today")
  {
  item.save();
res.redirect("/");
}

else{
  List.findOne({name: listName},function(err,foundList){
foundList.item.push(item);
foundList.save();
res.redirect("/"+ listName);
  })
}
});

app.post("/delete",function(req,res){
  const checkedItemId= req.body.checkbox;
  const listName= req.body.listName;

  if (listName==="Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if (err){
        console.log("error");

      }
      else{
        console.log("Item Sucessfully Deleted");
        res.redirect("/");
      }
    });
  }

  else{
    List.findOneAndUpdate ({name: listName}, {$pull : { item:{ _id: checkedItemId}}},function(err,foundList){
      if (!err){
        res.redirect("/"+listName);
      }
    });


  }


});




app.get("/:customName", function(req,res){
  const customName = _.capitalize(req.params.customName) ;
  console.log(customName);



List.findOne({name: customName}, function(err, result){
  if (!err){
  if (!result){
  console.log("not found");
  const list = new List({
    name: customName,
    item: defaultItem

  });
  list.save();
  res.redirect("/" + customName);
}
else{
  res.render("list", {listTitle: result.name, newListItems:result.item});

}
}
});


});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started on port Sucessfully");
});
