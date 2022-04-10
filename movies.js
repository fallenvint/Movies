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
let paginObj;

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
			currentMovieIndex = index;
			pageContent.parentElement.classList.add('hide');
			modalBlock.classList.remove('hide');
			modalBlock.style.backgroundImage = `url('${posterUrl}${movies[index].backdrop_path}')`;
			createModal(movies[index].id, movies[index].poster_path, movies[index].title, movies[index].vote_average, movies[index].release_date, movies[index].overview);
			window.location.hash = movies[index].title;
		});
	});

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

	if(currentMovieIndex === 19){
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
	modalBlock.innerHTML = '';
	currentMovieIndex++;
	modalBlock.style.backgroundImage = `url('${posterUrl}${movies[index+1].backdrop_path}')`;
	createModal(movies[index+1].id, movies[index+1].poster_path, movies[index+1].title, movies[index+1].vote_average, movies[index+1].release_date, movies[index+1].overview);
	window.location.hash = movies[index+1].title;
};

function Movie(id, title, poster_path, overview) {
	this.id = id;
	this.title = title;
	this.poster_path = poster_path;
	this.overview = overview;
}

const compare = (element, object) => element.id === movieObj.id;

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
	window.location.hash = 'My favorite';
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
	currentPage = response.page;
	pagination.classList.add('page-pagination');
	pageContent.after(pagination);

	paginObj = {
		current: currentPage,
		next: currentPage+1,
		prev: currentPage-1,
		first: 1,
		last: response.total_pages
	}

	pagination.innerHTML = `
		<button id="first-page" class="button" data-id="${paginObj.first}">First</button>
		<button id="prev-page" class="button" data-id="${paginObj.prev}">Previous</button>
		<button id="button-${paginObj.prev}" class="button" data-id="${paginObj.prev}">${paginObj.prev}</button>
		<button id="button-${paginObj.current}" class="button current" data-id="${paginObj.current}">${paginObj.current}</button>
		<button id="button-${paginObj.next}" class="button" data-id="${paginObj.next}">${paginObj.next}</button>
		<button id="next-page" class="button" data-id="${paginObj.next}">Next</button>
		<button id="last-page" class="button" data-id="${paginObj.last}">Last</button>
	`;

	pagination.addEventListener('click', (e) => {
		if(e.target.classList.contains('button')){
			pageContent.innerHTML = '';
			loadRequest(requestMoviesURL+urlPostfix+e.target.dataset.id);
		}
	});

	if(paginObj.current === paginObj.last){
		document.getElementById(`button-${paginObj.next}`).classList.add('hide');
		document.getElementById('next-page').classList.add('hide');
		document.getElementById('last-page').classList.add('hide');
	} else if(paginObj.current === paginObj.first){
		document.getElementById('first-page').classList.add('hide');
		document.getElementById('prev-page').classList.add('hide');
		document.getElementById(`button-${paginObj.prev}`).classList.add('hide');
	}
};

const removeUnfavorite = () => {
	const favorites = document.querySelector('.favorites');

	favorites.addEventListener('click', (e) => {
		const favoriteContainer = e.target.closest('div.favorite');
		const movieId = Array.prototype.indexOf.call(favorites.children, favoriteContainer);

		if (e.target.classList.contains('button')) {
			favoriteFilmList.splice(movieId, 1);
			localStorage.setItem('movies', JSON.stringify(favoriteFilmList));
			e.target.classList.add('hide');
		}
	});
};
