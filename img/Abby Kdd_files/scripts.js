
var Book = Backbone.Model.extend({
	defaults: {
		title: '',
		author: '',
		year: '',
		imgUrl: '',
		language: '',
		description: '',
	}
});
var Books = Backbone.Collection.extend({});

var books = new Books();

var BookView = Backbone.View.extend({
	model: new Book(),
	tagName: 'div',
	className: 'col',
	initialize: function(){
		this.template = _.template($('.books-list-template').html());
	},

	render: function(){
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	}
});

var BooksView = Backbone.View.extend({
	model: books,
	el: $('.books-list'),
	initialize: function(){
		this.model.on('add', this.render, this);
	},
	render: function(){
		var self = this;
		this.$el.html('');
		_.each(this.model.toArray(), function(book){
			self.$el.append((new BookView({model: book})).render().$el);
		});
		return this;
	},
});

var booksView = new BooksView();

$(document).ready(function(){
	$('.search').on('click', function(){
		var searchTitle = $('.search-input').val();
		var BookCollection = Backbone.Collection.extend({
			url: `https://www.googleapis.com/books/v1/volumes?q=${searchTitle}`
			});
		var collection = new BookCollection();
		console.log(collection.url)
		collection.fetch({
			success: function(){
				console.log(collection.models[0]);
				var list = collection.models[0].attributes.items;
				console.log(list);
				_.each(list, function(cur){
					var book = new Book({
						title: cur.volumeInfo.title,
						author: cur.volumeInfo.authors[0],
						year: cur.volumeInfo.publishedDate,
						imgUrl: cur.volumeInfo.imageLinks.thumbnail,
						language: cur.volumeInfo.language,
						description: cur.volumeInfo.subtitle,
					});
					console.log(book);
					books.add(book);
				});
			}
		});
		$('.search').val('');
		// console.log(book.toJSON());
		// books.add(book);
	});
})
