
let isOnSearch = true;
let bookListName = ".search-books-list";
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
		categories: '',
	}
});

var categories = {};

var Books = Backbone.Collection.extend({});

var books = new Books();
var savedBooks = new Books();
var searchedBooks = new Books();

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
			savedBooks = $.grep(savedBooks, function(value){
					return value.id != self.model.id
			});
			localStorage.setItem("books", JSON.stringify(savedBooks));
			books.reset();
			_.each(savedBooks, function(data){
				var obj = new Book(data);
				books.add(obj);
			});
			booksView.render();
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
	console.log("here");
	books.comparator = function(model){
		var date = new Date(model.get('year'));
		return -date.getFullYear();
	};
	console.log("here2");
	console.log(books);
	books.sort();
	console.log("here3");
	console.log(books);
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
	books.comparator = '';
	$('input[name=selected-filter]:checked').prop("checked",false);
	if(!keyword || keyword == ' '){
		$('.err').show();
	}else{
		$('.err').hide();
		var BookCollection = Backbone.Collection.extend({
			url: `https://www.googleapis.com/books/v1/volumes?q=${keyword}&maxResults=40`
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
					var imgUrl;
					if(!cur.volumeInfo.imageLinks || !cur.volumeInfo.imageLinks.thumbnail){
						imgUrl = "#";
					} else {
						imgUrl = cur.volumeInfo.imageLinks.thumbnail;						
					}
					var book = new Book({
						id: cur.id,
						title: cur.volumeInfo.title,
						author: mainAuthor,
						year: pDate.toDateString(),
						imgUrl: imgUrl,
						language: cur.volumeInfo.language,
						description: cur.volumeInfo.subtitle,
						readerLink: cur.volumeInfo.infoLink,
						categories: cur.volumeInfo.categories,
					});
					books.add(book);
				});
				drawChart();
			}

		});
	}
}
var drawChart = function(){
	_.each(books.models, function(mod){
		var cats = mod.attributes.categories;
		_.each(cats, function(c){
			if(categories[c]){
				categories[c] += 1;
			}else{
				categories[c] = 1;
			}
		})
	})
	var chartData = []
	_.each(Object.keys(categories), function(cur){
		var d = {
			name: cur,
			y: categories[cur], 
		}
		chartData.push(d);
	});
	// $('#chart').show();
	chartData.sort((a,b) => (b.y - a.y));
	chartData[0].sliced = "true";
	chartData[0].selected = "true";

	Highcharts.chart('charts', {
    chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie'
    },
    title: {
        text: 'Search results by book categories'
    },
    tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
    },
    accessibility: {
        point: {
            valueSuffix: '%'
        }
    },
    plotOptions: {
        pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
                enabled: true,
                format: '<b>{point.name}</b>: {point.y}'
            }
        }
    },
    series: [{
        name: 'Number of books',
        colorByPoint: true,
	        data: chartData,
	    }]
	});
}

$(document).ready(function(){
	$('.search').on('click', function(){
		getBooks($('.search-input').val());
		// drawChart();
	});
	$('.search-input').keypress(function(e){
		if(e.which == 13){
			getBooks($('.search-input').val());
		}
	});
	$('.save-page-link').on('click', function(){
		$('#charts').highcharts().destroy();
		books.reset();
		$('input[name=selected-filter]:checked').prop("checked",false);
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
			_.each(savedBooks, function(data){
				var obj = new Book(data);
				books.add(obj);
			});
			booksView.render();
		}
	});
	$('.search-page-link').on('click', function(){
		$('input[name=selected-filter]:checked').prop("checked",false);
		books.reset();
		isOnSearch = true;
		bookListName = ".search-books-list";
		$('.search-page').show();
		$('.save-page').hide();
	});
	$('input[name=selected-filter]').change(function(){
		var filter = $('input[name=selected-filter]:checked').attr('id');
		switch(filter) {
		  case "newest":
		  case "newest2":
		  	sortByYearNew();
		  	break;
		  case "oldest":
		  case "oldest2":
		    // code block
		    sortByYearOld();
		    break;
		  case "title":
		  case "title2":
		  	sortByTitle();
		  	break;
		  case "author":
		  case "author2":
		  	sortByAuthor();
		  	break;
		  default:
		    // code block
		}		
	});
});
