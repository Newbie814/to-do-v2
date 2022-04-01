//jshint esversion:6

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const date = require(__dirname + '/date.js');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

mongoose.connect('mongodb://localhost:27017/todolistDB', {
  useNewUrlParser: true,
});

const itemsSchema = {
  name: String,
};

const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({
  name: 'to-do list',
});

const item2 = new Item({
  name: 'Hit the + to add a new entry',
});

const item3 = new Item({
  name: '<-- click here to delete.',
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const List = mongoose.model('List', listSchema);

// const items = ['Buy Food', 'Cook Food', 'Eat Food'];
// const workItems = [];

// app.get('/', function (req, res) {
//   Item.find({}, function (err, foundItems) {
//     if (foundItems.length === 0) {
//       Item.insertMany(defaultItems, function (err) {
//         if (err) {
//           console.log(err);
//         } else {
//           console.log('Successfully savevd default items to DB.');
//         }
//       });
//       res.redirect('/');
//     } else {
//       res.render('list', { listTitle: 'Today', newListItems: foundItems });
//     }
//   });
// });

app.get('/', function(req, res) {
  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log('Successfully saved items to DB.');
        }
      });
      res.redirect('/');
    } else {
      res.render('list', { listTitle: 'Today', newListItems: foundItems });
    }
  });
});

app.get('/:customListName', function(req, res) {
  const customListName = req.params.customListName;

  List.findOne({ name: customListName }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        // create new list
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect('/' + customListName);
      } else {
        // show existing list
        res.render('list', {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    }
  });

  const list = new List({
    name: customListName,
    items: defaultItems,
  });
  // const checkDbForRoute = List.find(
  //   { customListName },
  //   function (err, results) {
  //     if (checkDbForRoute !== customListName) {
  //       list.save();
  //     } else {
  //       console.log('Page already exists');
  //     }
  //   }
  // );
});

app.post('/', function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listName === 'Today') {
    item.save();
    res.redirect('/');
  } else {
    List.findOne({ name: listName }, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect('/' + listName);
    });
  }

  item.save();

  res.redirect('/' + listName);
});

app.post('/delete', function(req, res) {
  const checkedItemId = req.body.checkbox;

  Item.findByIdAndRemove(checkedItemId, function(err) {
    if (!err) {
      console.log('Succesfully deleted');
      res.redirect('/');
    }
  });
});

app.get('/about', function(req, res) {
  res.render('about');
});

app.listen(3000, function() {
  console.log('Server started on port 3000');
});
