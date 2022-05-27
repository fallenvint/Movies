let requestMoviesURL = 'https://api.themoviedb.org/3/movie/now_playing?api_key=ebea8cfca72fdff8d2624ad7bbf78e4c';
const urlPostfix = '&page=';
const posterUrl = 'http://image.tmdb.org/t/p/w342';
const documentTitle = document.title;
const logoBlock = document.querySelector('.logo-block');
const pageContent = document.querySelector('.page-content');
const pageTitle = document.querySelector('.page-title');
const modalBlock = document.querySelector('.modal');
const favoriteBtn = document.createElement('button');
const favoriteListBtn = document.querySelector('.menu-item');
let pagination = document.createElement('div');
let favoriteFilmList = localStorage.getItem('movies') ? JSON.parse(localStorage.getItem('movies')) : [];
let movieObj;
let response;
let movies;
let currentMovieIndex;
let currentPage;

logoBlock.addEventListener('click', () => {
	window.location.href = window.location.href.split('#')[0];
});

const request = new XMLHttpRequest();

const loadRequest = (url) => {
	request.open('GET', url, true);
	request.responseType = 'json';
	request.send();
};
loadRequest(requestMoviesURL);

request.onload = function () {
	response = this.response;
	movies = response.results;

	movies.forEach(movie => {
		const poster = document.createElement('div');

		poster.innerHTML = `<div><img src="${posterUrl}${movie.poster_path}" alt="${movie.title}" title="${movie.title}"></div>`;
		poster.classList.add('poster');
		pageContent.appendChild(poster);
	});

	let allPosters = document.querySelectorAll('.poster');

	allPosters.forEach((item, index) => {
		item.addEventListener('click', function(){
			(index === response.results.length-1)? currentMovieIndex = 0 : currentMovieIndex = index+1;

			pageContent.parentElement.classList.add('hide');
			modalBlock.classList.remove('hide');
			modalBlock.style.background = `url('${posterUrl}${movies[index].backdrop_path}') no-repeat top center / cover #cfd8dc`;
			createModal(movies[index].id, movies[index].poster_path, movies[index].title, movies[index].vote_average, movies[index].release_date, movies[index].overview);
		});
	});

	console.log(response);

	addPagination();
};

const createModal = (id, poster, title, score, date, overview) => {
	movieObj = new Movie(id, title, poster, overview);
	modalBlock.innerHTML = `
	<div class="modal-container">
		<div class="modal-nav">
			<button id="back-to-list" onclick="returnToList()">
					<i class="fa-solid fa-chevron-left"></i>
				<span>Back to list</span>
			</button>
			<button id="next-movie" onclick="goNextMovie(${currentMovieIndex})">
				<span>Next movie</span>
				<i class="fa-solid fa-chevron-right"></i>
			</button>
		</div>
		<div class="modal-movie">
			<div class="modal-movie_poster">
				<img src="${posterUrl}${poster}" alt="${title}">
			</div>
			<div class="modal-movie_info">
				<div class="modal-movie_favorite"></div>
				<div class="modal-movie_title">
					${title} <span>(${new Date(date).toLocaleDateString('en-us', {year:"numeric"})})</span>
				</div>
				<div class="modal-movie_rate">
					<div class="rate_score">Score: <span>${score}</span></div>
					<div class="rate_date">Release Date: <span>${new Date(date).toLocaleDateString('en-us', {month:"long", day:"numeric", year:"numeric"})}</span></div>
				</div>
				<div class="modal-movie_overview">${overview}</div>
			</div>
		</div>
	</div>
	`;

	if(currentPage === response.total_pages && currentMovieIndex === 0) {
		document.getElementById('next-movie').classList.add('hide');
	}

	if (favoriteFilmList.some(compare)) {
		favoriteBtn.innerHTML = 'Unfavorite';
	} else {
		favoriteBtn.innerHTML = 'Add to favorite';
	}
	favoriteBtn.setAttribute('id','favorite-list');
	favoriteBtn.classList.add('button');
	document.querySelector('.modal-movie_favorite').appendChild(favoriteBtn);
	window.location.hash = title.toLowerCase();
	document.title = title;
};

const returnToList = () => {
	modalBlock.innerHTML = '';
	modalBlock.dataset.id = '';
	modalBlock.classList.add('hide');
	modalBlock.removeAttribute('style');
	pageContent.parentElement.classList.remove('hide');
	document.title = documentTitle;
	window.location.hash = '';
};

const goNextMovie = (index) => {
	let waitTime;
	(index === response.results.length-1)? currentMovieIndex = 0 : currentMovieIndex++;

	if (index === 0 && currentPage !== response.total_pages) {
		pageContent.innerHTML = '';
		loadRequest(requestMoviesURL+urlPostfix+(currentPage+1));
		document.getElementById('next-movie').disabled = true;
		waitTime = 500;
	} else {
		waitTime = 0;
	}

	setTimeout(() => {
		modalBlock.innerHTML = '';
		modalBlock.style.background = `url('${posterUrl}${movies[index].backdrop_path}') no-repeat top center / cover #cfd8dc`;
		createModal(movies[index].id, movies[index].poster_path, movies[index].title, movies[index].vote_average, movies[index].release_date, movies[index].overview);
	}, waitTime);
};

function Movie(id, title, poster_path, overview) {
	this.id = id;
	this.title = title;
	this.poster_path = poster_path;
	this.overview = overview;
}

const compare = (element) => element.id === movieObj.id;

favoriteBtn.addEventListener('click', () => {
	if (favoriteFilmList.some(compare)) {
		favoriteFilmList = favoriteFilmList.filter((item) => {
			return item.id !== movieObj.id;
		});

		localStorage.setItem('movies', JSON.stringify(favoriteFilmList));
		favoriteBtn.innerHTML = 'Add to favorite';
		favoriteBtn.classList.remove('favorited');
	} else {
		favoriteFilmList.unshift(movieObj);
		localStorage.setItem('movies', JSON.stringify(favoriteFilmList));
		favoriteBtn.innerHTML = 'Unfavorite';
		favoriteBtn.classList.add('favorited');
	}
});

favoriteListBtn.addEventListener('click', (e) => {
	window.location.hash = 'my favorite';
	favoriteListBtn.classList.add('active');
	modalBlock.innerHTML = '';
	modalBlock.dataset.id = '';
	modalBlock.classList.add('hide');
	modalBlock.removeAttribute('style');
	pageContent.parentElement.classList.remove('hide');
	pageTitle.innerHTML = 'My favorite';
	pageContent.innerHTML = '';
	document.querySelector('.page-pagination').innerHTML = '';
	pageContent.classList.remove('posters');
	pageContent.classList.add('favorites');
	favoriteFilmList.forEach(item => {
		const movie = document.createElement('div');

		movie.innerHTML = `
		<div class="favorite-movie">
			<div class="favorite-movie_poster">
				<img src="${posterUrl}${item.poster_path}" alt="${item.title}" title="${item.title}">
			</div>
			<div class="favorite-movie_info">
				<div class="favorite-movie_button">
					<button id="unfavorite" class="button" data-id="${item.id}">Unfavorite</button>
				</div>
				<div class="favorite-movie_title">${item.title}</div>
				<div class="favorite-movie_overview">${item.overview}</div>
			</div>
		</div>
		`;
		movie.classList.add('favorite');
		pageContent.appendChild(movie);
	});

	removeUnfavorite();
});

const addPagination = () => {
	let insert = '';
	currentPage = response.page;
	pagination.classList.add('page-pagination');
	pageContent.after(pagination);

	let paginObj = {
		get first() {
			return currentPage === 1 ? '' : 1;
		},
		get prev() {
			return this.current-1
		},
		get spaceBefore() {
			return currentPage < 4 ? '' : true;
		},
		current: currentPage,
		get spaceAfter() {
			return currentPage <= response.total_pages-4 ? true : '';
		},
		get next() {
			return currentPage != response.total_pages ? this.current+1 : ''; 
		},
		get last() {
			return currentPage != response.total_pages ? response.total_pages : '';
		}
	}

	for (let prop in paginObj) {
		switch (true) {
			case (!paginObj[prop]):
				insert += ``;
				break;
			case (paginObj[prop] === true):
				insert += `<span>...</span>`;
				break;
			case (paginObj[prop] < 4 && prop === "current"):
				insert += `
				<button class="button" data-id="1">1</button>
				<button class="button" data-id="2">2</button>
				<button class="button" data-id="3">3</button>
				<button class="button" data-id="4">4</button>
				<button class="button" data-id="5">5</button>
				`;
				break;
			case (paginObj[prop] > response.total_pages-4 && prop === "current"):
				insert += `
				<button class="button" data-id="${response.total_pages-4}">${response.total_pages-4}</button>
				<button class="button" data-id="${response.total_pages-3}">${response.total_pages-3}</button>
				<button class="button" data-id="${response.total_pages-2}">${response.total_pages-2}</button>
				<button class="button" data-id="${response.total_pages-1}">${response.total_pages-1}</button>
				<button class="button" data-id="${response.total_pages}">${response.total_pages}</button>
				`;
				break;
			case (paginObj[prop] >= 4 && prop === "current"):
				insert += `
				<button class="button" data-id="${paginObj[prop]-2}">${paginObj[prop]-2}</button>
				<button class="button" data-id="${paginObj[prop]-1}">${paginObj[prop]-1}</button>
				<button class="current" data-id="${paginObj[prop]}">${paginObj[prop]}</button>
				<button class="button" data-id="${paginObj[prop]+1}">${paginObj[prop]+1}</button>
				<button class="button" data-id="${paginObj[prop]+2}">${paginObj[prop]+2}</button>
				`;
				break;
			default:
				insert += `
				<button class="button" data-id="${paginObj[prop]}">${prop}</button>
				`;
				break;
		}
	}

	pagination.innerHTML = insert;

	let currentBtn = pagination.querySelector(`button[data-id="${currentPage}"]`);
	currentBtn.classList.remove('button');
	currentBtn.classList.add('current');
	

	pagination.addEventListener('click', (e) => {
		if(e.target.classList.contains('button')){
			pageContent.innerHTML = '';
			loadRequest(requestMoviesURL+urlPostfix+e.target.dataset.id);
		}
	});


};

const removeUnfavorite = () => {
	const favorites = document.querySelector('.favorites');

	favorites.addEventListener('click', (e) => {
		const favoriteContainer = e.target.closest('div.favorite');
		const movieId = Array.prototype.indexOf.call(favorites.children, favoriteContainer);

		if (e.target.classList.contains('button')) {
			favoriteFilmList.splice(movieId, 1);
			localStorage.setItem('movies', JSON.stringify(favoriteFilmList));
			e.target.closest('.favorite').remove();
		}
	});
};
