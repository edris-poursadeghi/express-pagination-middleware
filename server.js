const express = require("express");
const app = express();

const mongoose = require("mongoose");
const User = require("./users");

mongoose.connect("mongodb://localhost/pagination", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.once("open", async () => {
  if ((await User.countDocuments().exec()) > 0) return;

  Promise.all([
    User.create({ id: 1, name: "USER 1" }),
    User.create({ id: 2, name: "USER 2" }),
    User.create({ id: 3, name: "USER 3" }),
    User.create({ id: 4, name: "USER 4" }),
    User.create({ id: 5, name: "USER 5" }),
    User.create({ id: 6, name: "USER 6" }),
    User.create({ id: 7, name: "USER 7" }),
    User.create({ id: 8, name: "USER 8" }),
    User.create({ id: 9, name: "USER 9" }),
    User.create({ id: 10, name: "USER 10" }),
    User.create({ id: 11, name: "USER 11" }),
    User.create({ id: 12, name: "USER 12" }),
    User.create({ id: 13, name: "USER 13" }),
  ]).then(() => console.log("Added Users"));
});

app.get("/users", paginatedResults(User), (req, res, next) => {
  res.json(res.paginatedResults);
});

function paginatedResults(modal) {
  return async (req, res, next) => {
    const page = +req.query.page;
    const limit = +req.query.limit;

    const startIndex = (page - 1) * limit;

    const endIndex = page * limit;

    const results = {};

    if (endIndex < (await modal.countDocuments().exec())) {
      results.next = {
        page: page + 1,
        limit: limit,
      };
    }

    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit,
      };
    }

    /*   results.results = modal.slice(startIndex, endIndex);
    res.paginatedResults = results;
 */

    try {
      results.results = await modal.find().limit(limit).skip(startIndex).exec();
      res.paginatedResults = results;
      next();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
}

app.listen(3000);
