const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here

  const username = req.body.username;
  const password = req.body.password;

  // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (isValid(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "Same user already exists! Please change username to register or login with existing username"});
        }
    }
    // Return error if username or password is not provided
    return res.status(404).json({message: "Unable to register user. Provide both username and password."});

  // return res.status(300).json({message: "Yet to be implemented"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  return res.send(JSON.stringify(books, null, 4));
  //return res.status(300).json({message: "Yet to be implemented"});
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  return res.send(JSON.stringify(books[isbn], null, 2));
  //return res.status(300).json({message: "Yet to be implemented"});
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  const author = req.params.author;

  // Hint 1: Obtain all the keys for the 'books' object
  const keys = Object.keys(books);
  
  // array to store books that match the author
  let booksByAuthor = [];

  // Hint 2: Iterate through the keys and check if the author matches
  for (let i = 0; i < keys.length; i++) {
    let currentBook = books[keys[i]];
    
    // If the author matches, add the book to results array
    if (currentBook.author === author) {
      booksByAuthor.push(currentBook);
    }
  }

  // Check if we found any books and return the appropriate response
  if (booksByAuthor.length > 0) {
    return res.status(200).send(JSON.stringify(booksByAuthor, null, 4));
  } else {
    return res.status(404).json({ message: "No books found by this author" });
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const title = req.params.title;

  const keys = Object.keys(books);

  // array to store books that match the author
  let booksByTitle = [];

  for (let i = 0; i < keys.length; i++) {
    let currentBook = books[keys[i]];
    
    // If the author matches, add the book to results array
    if (currentBook.title === title) {
      booksByTitle.push(currentBook);
    }
  }

  // Check if we found any books and return the appropriate response
  if (booksByTitle.length > 0) {
    return res.status(200).send(JSON.stringify(booksByTitle, null, 4));
  } else {
    return res.status(404).json({ message: "No books found by this title" });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;

  return res.send(JSON.stringify(books[isbn].reviews, null, 2));
});

module.exports.general = public_users;
