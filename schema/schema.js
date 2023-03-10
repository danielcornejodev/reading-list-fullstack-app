const graphql = require('graphql');
const _ = require('lodash');
const Book = require('../models/book');
const Author = require('../models/author');

//destructuring grabs function GraphQLObjectType from graphql variable. 
//this code grabs different properties from the graphql package.
const { GraphQLObjectType, GraphQLString, GraphQLSchema, GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull } = graphql;

//Dummy data
// var books = [
//     { name: 'Name of the Wind', genre: 'Fantasy', id: '1', authorId: '1' },
//     { name: 'The Final Empire', genre: 'Fantasy', id: '2', authorId: '2' },
//     { name: 'The Hero of Ages', genre: 'Fantasy', id: '4', authorId: '2' },
//     { name: 'The Long Earth', genre: 'Sci-Fi', id: '3', authorId: '3' },
//     { name: 'The Colour of Magic', genre: 'Fantasy', id: '5', authorId: '3' },
//     { name: 'The Light Fantastic', genre: 'Fantasy', id: '6', authorId: '3' },
// ];

// var authors = [
//     { name: 'Patrick Rothfuss', age: 44, id: '1' },
//     { name: 'Brandon Sanderson', age: 42, id: '2' },
//     { name: 'Terry Pratchett', age: 66, id: '3' }
// ];

const BookType = new GraphQLObjectType({
    name: 'Book',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        genre: { type: GraphQLString },
        author: {
            type: AuthorType,
            resolve(parent, args){
                // return _.find(authors, { id: parent.authorId })
                return Author.findById(parent.authorId);
            }
        }
    })
});

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    fields: () => ({
        id: { type: GraphQLID },
        age: { type: GraphQLInt},
        name: { type: GraphQLString },
        books: {
            type: new GraphQLList(BookType),
            resolve(parent, args){
                //return _.filter(books, { authorId: parent.id });
                //code below will find all records in the book collection based on criteria placed inside object. 
                //the authorId of the book to equal the ID of whatever the parent is of the author. 
                return Book.find({authorId: parent.id})
            }
        }
    })
});

//Don't need an arrow function since we do not need to worry about the order so much. 
//which arg should come along when making a query for a book. c
//resolve is a function to get data from db / other source.
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        book: {
            type: BookType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args){
                //using lodash to look through the books array and finding any book with the id that has been attached the args.id that user sends along.
                //args to id is converted to a string tyoe. You can verify by console.logging typeof args.id
                // return _.find(books, {id: args.id})
                return Book.findById(args.id)
            }
        },
        author: {
            type: AuthorType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args){
                // return _.find(authors, { id: args.id });
                return Author.findById(args.id)
            }
        },
        books: {
            type: new GraphQLList(BookType),
            resolve(parent, args){
                // return books
                //pass in an empty object to find all books. All books match an empty criteria.
                return Book.find({});
            }
        },
        authors: {
            type: new GraphQLList(AuthorType),
            resolve(parent, args){
                // return authors
                return Author.find({});
            }
        }
    }
});

//Mutation means add, edit, delete data. 
const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addAuthor: {
            type: AuthorType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                age: { type: new GraphQLNonNull(GraphQLInt) }
            },
            resolve(parent, args){
                let author = new Author({
                    name: args.name,
                    age: args.age
                })
                return author.save()
            }
        },
        addBook: {
            type: BookType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                genre: { type: new GraphQLNonNull(GraphQLString) },
                authorId: {type: new GraphQLNonNull(GraphQLID)}
            },
            resolve(parent, args){
                let book = new Book({
                    name: args.name,
                    genre: args.genre,
                    authorId: args.authorId
                })
                return book.save()
            }
        }
    }
});

//defining which query we are allowing user to use when they are making queries from the front end.
module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});