'use strict';

const mongoose = require('mongoose');

const anotSchema = mongoose.Schema(

  
  {idAnnot: String,
    title: String,
  annotation: String},);

const bookSchema = mongoose.Schema({
  idBook: {type: String, required: true},
  title: { type: String, required: true },
  authorBook: { type: String, required: true },
  url: {type: String},
  date: { type: String },
  pages: {type: String},
  description: {type: String},
  annotations: [anotSchema],
  author: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User'
  },
  created: { type: Date, default: Date.now }
});


// recipeSchema.virtual('authorName').get(function () {
//   return `${this.author.firstName} ${this.author.lastName}`.trim();
// });

bookSchema.methods.serialize = function () {
  return {
    id: this._id,
    title: this.title,
    authorBook: this.authorBook,
   
  };
};

const Book = mongoose.model('Book', bookSchema);

module.exports = { Book };
