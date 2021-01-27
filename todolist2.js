//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();


//to use ejs
app.set('view engine', 'ejs');
//to use bodyParser
app.use(bodyParser.urlencoded({
  extended: true
}));
//to make public folder recognized by express.js
app.use(express.static("public"));
//link to mongoose
mongoose.connect("mongodb+srv://admin-caspar:<password>@caspardb.oc61l.mongodb.net/<dbname>", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.set('useFindAndModify', true);

const itemSchema = ({
  name: String
});

const Item = mongoose.model("item", itemSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});
const item2 = new Item({
  name: "Hit the button to add a new item."
});
const item3 = new Item({
  name: "<-- Hit this to delete the item."
});
const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (!err) {
          console.log("successful added");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }
  });
});

app.get("/:customeListName", function(req, res) {
  const customeListName = _.capitalize(req.params.customeListName);
  List.findOne({
    name: customeListName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customeListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customeListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        })
      }
    }
  });
});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {

    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  };
});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (!err) {
        console.log("deleted checked item");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: checkedItemId
        }
      }
    }, function(err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    })
  }

});


// set server port and webpage port if have one
let port = process.env.PORT;
if (port == null || port == ""){
  prot =3000;
}
app.listen(port, function() {
  console.log("Server has started!");
});
