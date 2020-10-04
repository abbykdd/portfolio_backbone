
let isOnSearch = true;
let relevanceOrder;
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

var sortByYearOld = function(){
	books.comparator = function(model){
		var date = new Date(model.get('year'));
		return date.getFullYear();
	};
	books.sort();
	booksView.render();
}

var sortByYearNew = function(){
	books.comparator = function(model){
		var date = new Date(model.get('year'));
		return -date.getFullYear();
	};
	books.sort();
	booksView.render();
}

var sortByAuthor = function(){
	books.comparator = function(model){
		return model.get('author');
	};
	books.sort();
	booksView.render();
}

var sortByTitle = function(){
	books.comparator = function(model){
		return model.get('title');
	};
	books.sort();
	booksView.render();
}

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
					var pDate = new Date(cur.volumeInfo.publishedDate);					
					var authors = cur.volumeInfo.authors;
					var mainAuthor = '';
					if (authors){
						mainAuthor = authors[0];
					}
					var book = new Book({
						id: cur.id,
						title: cur.volumeInfo.title.substring(0,50),
						author: mainAuthor,
						year: pDate.toDateString(),
						imgUrl: cur.volumeInfo.imageLinks.thumbnail,
						language: cur.volumeInfo.language,
						description: cur.volumeInfo.subtitle,
						readerLink: cur.volumeInfo.infoLink,
					});
					books.add(book);
				});
				relevanceOrder = books;
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
	$('input[name=selected-filter]').change(function(){
		var filter = $('input[name=selected-filter]:checked').attr('id');
		if(filter != "relevance"){
			var comp = '';
			switch(filter) {
			  case "newest":
			  	sortByYearNew();
			  	break;
			  case "oldest":
			    // code block
			    sortByYearOld();
			    break;
			  case "title":
			  	sortByTitle();
			  	break;
			  case "author":
			  	sortByAuthor();
			  	break;
			  default:
			    // code block
			}
		}
		
	});
});
