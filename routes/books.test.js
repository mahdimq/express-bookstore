process.env.NODE_ENV = 'test'
const request = require('supertest')
const app = require('../app')
const db = require('../db')
const Book = require('../models/book')

let testBook

beforeEach(async () => {
	await db.query('DELETE FROM books') //<-- Empty tables

	testBook = await Book.create({
		isbn: '0691161518',
		amazon_url: 'http://a.co/eobPtX2',
		author: 'Fake Author',
		language: 'english',
		pages: 500,
		publisher: 'Penguin Bird Publisher',
		title: 'Test Title for a Test book',
		year: 2020
	})
})

afterAll(async () => {
	await db.end() //<-- Close connection to database
})

// GET ROUTE FOR ALL BOOKS
describe('GET /books', () => {
	test('Get list of all books', async () => {
		const res = await request(app).get('/books')
		expect(res.statusCode).toBe(200)
		expect(res.body).toBeInstanceOf(Object)
		expect(res.body.books[0]).toHaveProperty('year')
		expect(res.body).toEqual({
			books: [
				{
					isbn: '0691161518',
					amazon_url: 'http://a.co/eobPtX2',
					author: 'Fake Author',
					language: 'english',
					pages: 500,
					publisher: 'Penguin Bird Publisher',
					title: 'Test Title for a Test book',
					year: 2020
				}
			]
		})
	})
})

// GET ROUTE FOR ONE BOOK
describe('GET /books/:isbn', () => {
	test('Get a single book', async () => {
		const res = await request(app).get(`/books/${testBook.isbn}`)
		expect(res.statusCode).toBe(200)
		expect(res.body).toEqual({
			book: {
				isbn: '0691161518',
				amazon_url: 'http://a.co/eobPtX2',
				author: 'Fake Author',
				language: 'english',
				pages: 500,
				publisher: 'Penguin Bird Publisher',
				title: 'Test Title for a Test book',
				year: 2020
			}
		})
	})
	test('Respond with 404 for invalid code', async () => {
		const res = await request(app).get(`/books/error`)
		expect(res.statusCode).toBe(404)
	})
})

describe('POST /books', () => {
	test('Create a single book', async () => {
		const res = await request(app).post(`/books`).send({
			isbn: '12345678',
			amazon_url: 'http://anothertest.book',
			author: 'Fake Author',
			language: 'spanish',
			pages: 456,
			publisher: 'Fake Test Publisher',
			title: 'Another Title for a Test book',
			year: 2019
		})
		expect(res.statusCode).toBe(201)
		expect(res.body).toBeInstanceOf(Object)
		expect(res.body.book).toHaveProperty('isbn')
		expect(res.body).toEqual({
			book: {
				isbn: '12345678',
				amazon_url: 'http://anothertest.book',
				author: 'Fake Author',
				language: 'spanish',
				pages: 456,
				publisher: 'Fake Test Publisher',
				title: 'Another Title for a Test book',
				year: 2019
			}
		})
	})
	test('data with pages returns 400 error', async () => {
		const response = await request(app).post(`/books`).send({
			isbn: '12345678',
			amazon_url: 'http://anothertest.book',
			author: 'Fake Author',
			language: 'spanish',
			pages: '199999',
			publisher: 'Fake Test Publisher',
			title: 'Another Title for a Test book',
			year: 2019
		})
		expect(response.status).toBe(400)
	})

	test('data with missing fields returns 400 error', async () => {
		const response = await request(app).post(`/books`).send({
			isbn: '12345678',
			amazon_url: 'http://anothertest.book',
			author: 'Fake Author',
			language: 'spanish'
		})
		expect(response.status).toBe(400)
	})
})

describe('PUT /books/:isbn', () => {
	test('Update a single book', async () => {
		const res = await request(app).put(`/books/${testBook.isbn}`).send({
			isbn: '0691161518',
			amazon_url: 'http://a.co/eobPtX2',
			author: 'Fake Author',
			language: 'english',
			pages: 2000,
			publisher: 'Early Publishers',
			title: 'Test Title for a Test book',
			year: 1904
		})
		expect(res.statusCode).toBe(200)
		expect(res.body).toBeInstanceOf(Object)
		expect(res.body.book).toHaveProperty('isbn')
		expect(res.body).toEqual({
			book: {
				isbn: '0691161518',
				amazon_url: 'http://a.co/eobPtX2',
				author: 'Fake Author',
				language: 'english',
				pages: 2000,
				publisher: 'Early Publishers',
				title: 'Test Title for a Test book',
				year: 1904
			}
		})
	})
	test('Respond with 404 for invalid code', async () => {
		const res = await request(app).patch(`/books/error`).send({
			isbn: '0691161518',
			amazon_url: 'http://a.co/eobPtX2',
			author: 'Fake Author',
			language: 'english',
			pages: 2000,
			publisher: 'Early Publishers',
			title: 'Test Title for a Test book',
			year: 1904
		})
		expect(res.statusCode).toBe(404)
	})
})

describe('DELETE /books/:isbn', () => {
	test('Delete a single book', async () => {
		const res = await request(app).delete(`/books/${testBook.isbn}`)
		expect(res.statusCode).toBe(200)
		expect(res.body).toEqual({ message: 'Book deleted' })
	})
})
