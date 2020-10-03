
var Book = Backbone.Model.extend({
	defaults: {
		title: '',
		author: '',
		year: '',
		imgUrl: '',
		language: '',
		description: '',
		readerLink: '',
	}
});
var Books = Backbone.Collection.extend({});

var books = new Books();

var BookView = Backbone.View.extend({
	model: new Book(),
	tagName: 'div',
	className: 'col',

	// events:{
	// 	'mouseover': "enter",
	// 	'mouseout': "leave",
	// },

	enter: function(e){
		this.$('.book-container').addClass('overlay-img');
		this.$('.btn-container').show();
	},

	leave: function(e){
		this.$('.book-container').removeClass('overlay-img');
		this.$('.btn-container').hide();
	},

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

var getBooks = function(keyword){
	var BookCollection = Backbone.Collection.extend({
		url: `https://www.googleapis.com/books/v1/volumes?q=${keyword}`
	});
	books.reset();
	var collection = new BookCollection();
	collection.fetch({
		success: function(){
			var list = collection.models[0].attributes.items;
			_.each(list, function(cur){
				var des = cur.volumeInfo.subtitle;
				if(!des){
					des = "";
				}
				var authors = cur.volumeInfo.authors;
				var mainAuthor = '';
				if (authors){
					mainAuthor = authors[0];
				}
				var book = new Book({
					title: cur.volumeInfo.title.substring(0,50),
					author: mainAuthor,
					year: cur.volumeInfo.publishedDate,
					imgUrl: cur.volumeInfo.imageLinks.thumbnail,
					language: cur.volumeInfo.language,
					description: des.substring(0, 100),
					readerLink: cur.volumeInfo.infoLink,
				});
				books.add(book);
			});
		}
	});
	$('.search-input').val('');
}

$(document).ready(function(){
	$('.search').on('click', function(){
		getBooks($('.search-input').val());
	});
})
