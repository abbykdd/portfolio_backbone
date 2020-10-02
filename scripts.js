//Model

var Book = Backbone.Model.extend({
	defaults: {
		title: '',
		author: '',
		year: '',
		imgUrl: '',
		language: '',
		review: '',
		description: '',
	}
});
var Books = Backbone.Collection.extend({});
var books = new Books();

var BookView = Backbone.View.extend({
	model: new Book(),
	tagName: 'div',
	initialize: function(){
		this.template = _.template($('.books-list-template').html());
	},

	render: function(){
		console.log(this.model.toJSON());
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
		var book = new Book({
			title: 'abc333333',
			author: 'abc',
			imgUrl: 'img/1.jpg',
			year: '1978',
			language: 'English',
			review: '4.6',
			description: 'abababababababab',
		});
		$('.search').val('');
		console.log(book.toJSON());
		books.add(book);
	});
})
