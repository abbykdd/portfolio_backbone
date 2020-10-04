
let isOnSearch = true;
let bookListName = ".search-books-list"
var Book = Backbone.Model.extend({
	defaults: {
		id: '',
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
	className: 'col s12 m7 book-container',

	events: {
		'click .save-book': 'saveBook',
	},

	saveBook: function(){
		if(isOnSearch){
			var savedBooks = JSON.parse(localStorage.getItem("books")) || [];
			savedBooks.push(this.model.attributes);
			localStorage.setItem("books", JSON.stringify(savedBooks));
		}else{
			var self = this;
			var savedBooks = JSON.parse(localStorage.getItem("books"));
			_.each(savedBooks, function(){
				if (this.id == self.id){
					savedBooks.pop(this);
				}
			});
			localStorage.setItem("books", JSON.stringify(savedBooks));
		}
		this.remove();

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
	el: $(bookListName),
	initialize: function(){
		this.model.on('add', this.render, this);
	},
	render: function(){
		var self = this;
		this.$el.html('');
		this.$el = $(bookListName);
		_.each(this.model.toArray(), function(book){
			self.$el.append((new BookView({model: book})).render().$el);
			if(!isOnSearch){
				self.$('.save-book').html("Delete");
			}
		});
		return this;
	},
});



var booksView = new BooksView();

var getBooks = function(keyword){
	if(!keyword || keyword == ' '){
		$('.err').show();
	}else{
		$('.err').hide();
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
						id: cur.id,
						title: cur.volumeInfo.title.substring(0,50),
						author: mainAuthor,
						year: cur.volumeInfo.publishedDate,
						imgUrl: cur.volumeInfo.imageLinks.thumbnail,
						language: cur.volumeInfo.language,
						description: des,
						readerLink: cur.volumeInfo.infoLink,
					});
					books.add(book);
				});
			}
		});
	}
}

$(document).ready(function(){
	$('.search').on('click', function(){
		getBooks($('.search-input').val());
	});
	$('.save-page-link').on('click', function(){
		isOnSearch = false;
		bookListName = ".save-books-list";
		$('.search-page').hide();
		$('.save-page').show();
		$('.warning').hide();
		var savedBooks = JSON.parse(localStorage.getItem("books")) || [];
		if(savedBooks.length == 0){
			$('.warning').show();
		}else{
			$('.warning').hide();
			books.reset();
			_.each(savedBooks, function(data){
				var obj = new Book(data);
				books.add(obj);
			});
			booksView.render();
		}
	});
	$('.search-page-link').on('click', function(){
		isOnSearch = true;
		bookListName = ".search-books-list";
		$('.search-page').show();
		$('.save-page').hide();
	});
})
