const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        if (isValid(username)) {
            users.push({ "username": username, "password": password });
            return res.status(200).json({ message: "User successfully registered. Now you can login" });
        } else {
            return res.status(404).json({ message: "Same user already exists! Please change username to register or login with existing username" });
        }
    }
    return res.status(404).json({ message: "Unable to register user. Provide both username and password." });
});

// Task 10: Get book list using Async-Await with Axios
public_users.get('/', async function (req, res) {
    try {
        const getBooks = () => {
            return new Promise((resolve, reject) => {
                if (books) {
                    resolve(books);
                } else {
                    reject(new Error("Books not found"));
                }
            });
        };
        
        const bookList = await getBooks();
        return res.status(200).send(JSON.stringify(bookList, null, 4));
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books", error: error.message });
    }
});

// Task 11: Get book details based on ISBN using Async-Await with Axios
public_users.get('/isbn/:isbn', async function (req, res) {
    try {
        const isbn = req.params.isbn;
        
        const getBookByISBN = () => {
            return new Promise((resolve, reject) => {
                if (books[isbn]) {
                    resolve(books[isbn]);
                } else {
                    reject(new Error(`Book with ISBN ${isbn} not found`));
                }
            });
        };
        
        const book = await getBookByISBN();
        return res.status(200).send(JSON.stringify(book, null, 2));
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
});

// Task 12: Get book details based on Author using Async-Await with Axios
public_users.get('/author/:author', async function (req, res) {
    try {
        const author = req.params.author;
        
        const getBooksByAuthor = () => {
            return new Promise((resolve, reject) => {
                const keys = Object.keys(books);
                let booksByAuthor = [];

                for (let i = 0; i < keys.length; i++) {
                    let currentBook = books[keys[i]];
                    if (currentBook.author === author) {
                        booksByAuthor.push(currentBook);
                    }
                }

                if (booksByAuthor.length > 0) {
                    resolve(booksByAuthor);
                } else {
                    reject(new Error(`No books found by author: ${author}`));
                }
            });
        };
        
        const booksByAuthor = await getBooksByAuthor();
        return res.status(200).send(JSON.stringify(booksByAuthor, null, 4));
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
});

// Task 13: Get book details based on Title using Async-Await with Axios
public_users.get('/title/:title', async function (req, res) {
    try {
        const title = req.params.title;
        
        // Create a Promise that returns books by title
        const getBooksByTitle = () => {
            return new Promise((resolve, reject) => {
                const keys = Object.keys(books);
                let booksByTitle = [];

                for (let i = 0; i < keys.length; i++) {
                    let currentBook = books[keys[i]];
                    if (currentBook.title === title) {
                        booksByTitle.push(currentBook);
                    }
                }

                if (booksByTitle.length > 0) {
                    resolve(booksByTitle);
                } else {
                    reject(new Error(`No books found with title: ${title}`));
                }
            });
        };
        
        // Using async-await with the Promise
        const booksByTitle = await getBooksByTitle();
        return res.status(200).send(JSON.stringify(booksByTitle, null, 4));
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
});

public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn] && books[isbn].reviews) {
        return res.send(JSON.stringify(books[isbn].reviews, null, 2));
    } else {
        return res.status(404).json({ message: "No reviews found for this book" });
    }
});

module.exports.general = public_users;
