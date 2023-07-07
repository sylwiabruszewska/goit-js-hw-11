import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const API_KEY = '38106260-22c65560723f63c5e0affa5f7';

const formElement = document.querySelector('.search-form');
const inputElement = document.querySelector('.form__input');
const galleryElement = document.querySelector('.gallery');
const loadMoreButton = document.querySelector('.load-more');

const lightbox = new SimpleLightbox('.photo-card a');

let searchQuery;
let page = 1;
let limit = 40;
let totalPages = Math.ceil(500 / limit);
let totalHits;

async function getImages() {
  const searchParams = new URLSearchParams({
    key: API_KEY,
    q: encodeURIComponent(searchQuery),
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: page,
    per_page: limit,
  });
  const url = `https://pixabay.com/api/?${searchParams}`;
  const response = await axios.get(url);
  totalHits = response.data.totalHits;
  console.log(response.data.hits);
  return response.data.hits;
}

async function addImages() {
  const images = await getImages();
  renderImages(images);
  lightbox.refresh();
}

function showNotification(totalHits) {
  if (totalHits === 0) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return;
  }
  if (totalHits > 0) {
    Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
  }
}

formElement.addEventListener('submit', onSubmit);

async function onSubmit(event) {
  event.preventDefault();
  galleryElement.innerHTML = '';

  page = 1;
  searchQuery = inputElement.value;
  await addImages();
  showNotification(totalHits);
  inputElement.value = '';

  if (page < totalPages) {
    loadMoreButton.classList.remove('hidden');
  } else {
    loadMoreButton.classList.add('hidden');
  }
}

async function loadMoreImages() {
  page += 1;
  if (page > totalPages) {
    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
    return;
  }
  addImages();
}

loadMoreButton.addEventListener('click', loadMoreImages);

function renderImages(images) {
  const markup = images
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `
        <div class="photo-card">
            <a href="${largeImageURL}">
                <img class="gallery__img" src="${webformatURL}" alt="${tags}" loading="lazy" />
            </a>
            <div class="info">
                <p class="info-item">
                    <b>Likes:</b> ${likes}
                </p>
                <p class="info-item">
                    <b>Views:</b> ${views}
                </p>
                <p class="info-item">
                    <b>Comments:</b> ${comments}
                </p>
                <p class="info-item">
                    <b>Downloads:</b> ${downloads}
                </p>
            </div>
        </div>`
    )
    .join('');
  galleryElement.insertAdjacentHTML('beforeend', markup);
}
