#!/usr/bin/env node

const quotes = require("./quotes.json")

const i  = Math.floor(Math.random() * quotes.flat().length)

q = quotes.flat()[i]

// Double to \n's
console.log(q.text.replace(/\n/g, "\n\n"));
