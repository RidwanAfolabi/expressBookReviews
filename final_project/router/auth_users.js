const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    if (userswithsamename.length === 0) {
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username, password) => {
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in. Input username and password" });
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
        
        // Store username in BOTH places
        req.session.authorization = {
            accessToken, username
        }
        req.session.username = username;  //
        
        return res.status(200).json({ message: "User successfully logged in", username: username });
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    
    // Get username from session (now should work)
    const username = req.session.username;

    // Validation checks
    if (!username) {
        return res.status(401).json({ 
            message: "Authentication required. Please login first." 
        });
    }

    if (!review || review.trim() === "") {
        return res.status(400).json({ 
            message: "Review content cannot be empty" 
        });
    }

    if (!books[isbn]) {
        return res.status(404).json({ 
            message: `Book with ISBN ${isbn} not found` 
        });
    }

    // Initialize reviews object if it doesn't exist
    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    // Check if user already has a review
    const isUpdate = books[isbn].reviews.hasOwnProperty(username);

    // Add or update the review
    books[isbn].reviews[username] = review;

    const action = isUpdate ? "updated" : "added";

    return res.status(isUpdate ? 200 : 201).json({
        message: `Review ${action} successfully`,
        isbn: isbn,
        username: username,
        book_title: books[isbn].title,
        review: review,
        action: action
    });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  //Write your code here
  
  const isbn = req.params.isbn;
  const username = req.session.username;
  
  // Check if user is logged in
  if (!username) {
    return res.status(401).json({ 
      message: "Authentication required. Please login first." 
    });
  }
  
  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({ 
      message: `Book with ISBN ${isbn} not found` 
    });
  }
  
  // Check if the book has any reviews
  if (!books[isbn].reviews) {
    return res.status(404).json({ 
      message: "No reviews found for this book" 
    });
  }
  
  // Check if the user has a review for this book
  if (!books[isbn].reviews.hasOwnProperty(username)) {
    return res.status(404).json({ 
      message: "You don't have a review for this book to delete" 
    });
  }
  
  // Delete the user's review
  delete books[isbn].reviews[username];
  
  // Check if there are no more reviews for this book
  if (Object.keys(books[isbn].reviews).length === 0) {
    // Optional, can remove the reviews object or leave it empty
    // books[isbn].reviews = {};
  }
  
  return res.status(200).json({
    message: "Review deleted successfully",
    isbn: isbn,
    username: username,
    book_title: books[isbn].title
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
