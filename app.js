const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");

// console.log(date());

const app = express();


app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));

mongoose.connect("mongodb+srv://anuragkum135:Q8Y6psvGRuXdz8dc@cluster0.ymktxjm.mongodb.net/todolistDB", {family: 4});

const itemsSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your todo List"
});

const item2 = new Item({
   name: "Hit the + button to add a new item."
});
const item3 = new Item({
    name: "<---- Hit this to delete an Item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};
 
const List = mongoose.model("List", listSchema);

app.get("/", function(req, res){

Item.find({}).then(function(foundItems){
    // console.log(items);

    if(foundItems.length === 0){
        Item.insertMany(defaultItems).then(function(items){
             console.log("Inserted to DB");
         }).catch(function(err){
             console.log(`Error inserting ${err}`);
         });
         res.redirect("/");
    }else{
    res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
}).catch(function(err){
    console.error(`Error finding data from db :${err}`) ;
});
});

app.get("/:customListName", function(req, res) {
    const customListName = _.capitalize(req.params.customListName);
  
    List.findOne({ name: customListName })
      .then(function(foundList) {
        if (!foundList) {
          // Create a new list
          const list = new List({
            name: customListName,
            items: defaultItems
          });
          list.save();
          res.redirect("/" + customListName);
        } else {
          // Show an existing list
          res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
        }
      })
      .catch(function(err) {
        console.log(err);
        res.send("An error occurred");
      });
  });
  
app.post("/", function(req, res){
    const itemName = req.body.newItem;

    const listName = req.body.list;
    const item =new Item({
        name: itemName,
    });
    if(listName === "Today"){
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name: listName}).then(function(foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+ listName);
        });
    }
    
   
});
app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkBox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId).then(function(items){
            console.log("deleted");
         }).catch(function(err){
             console.log(err);
         });
         res.redirect("/");
     
    } else{
         List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}).then(function(foundList){
            res.redirect("/" +listName);
         });
    }
   });


app.get("/work", function(req, res){
    res.render("list", {listTitle: "work List", newListItems: workItems});
});

app.get("/about", function(req, res){
    res.render("about");
});

app.post("/work", function(req, res){
    const item = req.body.newItem;
    workItems.push(item);
    res.redirect("/work");
});



app.listen(3000, function(){
    console.log('Server started on port 3000');
});