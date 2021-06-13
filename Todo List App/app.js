//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(
  "mongodb+srv://admin-rishabh:database12@cluster0.hz3es.mongodb.net/todoList",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const itemsSchema = {
  name: String,
};

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const Item = mongoose.model("item", itemsSchema);

const List = mongoose.model("List", listSchema);

const item1 = new Item({
  name: "Welcome to your todo list.",
});

const item2 = new Item({
  name: "Hit the + button to add a new item",
});

const item3 = new Item({
  name: "<--- Hit this to delete an item ",
});

const defaultItems = [item1, item2, item3];

app.get("/", function (req, res) {
  // const day = date.getDate();
  const day = "Today";
  Item.find(function (err, items) {
    if (items.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) console.log(err);
        else console.log("Logged in sucessfully");
        res.redirect("/");
      });
    } else {
      res.render("list", { listTitle: day, newListItems: items });
    }
  });
});

app.post("/", function (req, res) {
  const item = req.body.newItem;
  const place = req.body.list;
  const newItem = new Item({
    name: item,
  });
  if (place === "Today") {
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({ name: place }, function (err, foundList) {
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + place);
    });
  }
});

app.post("/delete", function (req, res) {
  // console.log(mongoose.Types.ObjectId.isValid(deleteId));
  // console.log(deleteId + "1");
  const deleteId = req.body.checkbox;
  const title = req.body.listTitle;
  if (title === "Today") {
    Item.findByIdAndRemove(deleteId, function (err) {
      if (err) console.log(err);
      else {
        console.log("Deleted successfully!!");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: title },
      { $pull: { items: { _id: deleteId } } },
      function (err, foundList) {
        if (!err) {
          res.redirect("/" + title);
        }
      }
    );
  }
});

app.get("/:name", function (req, res) {
  const customListName = _.capitalize(req.params.name);
  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    }
  });
});

app.get("/about", function (req, res) {
  res.render("about");
});
let port = process.env.PORT;

if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("Server started sucessfully");
});
