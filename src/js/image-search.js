import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Masonry from 'masonry-layout';
import imagesLoaded from 'imagesloaded';
import { throttle } from 'throttle-debounce';

const API_KEY = '38106260-22c65560723f63c5e0affa5f7';

const formElement = document.querySelector('.search-form');
const inputElement = document.querySelector('.form__input');
const galleryElement = document.querySelector('.gallery');
const message = document.querySelector('.message');
const loader = document.querySelector('.loader');

const lightbox = new SimpleLightbox('.photo-card a');

let searchQuery;
let page = 1;
let limit = 40;
let totalPages;
let totalHits;

async function getImages() {
  try {
    const searchParams = new URLSearchParams({
      key: API_KEY,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      page: page,
      per_page: limit,
    });
    const url = `https://pixabay.com/api/?${searchParams}&q=${encodeURIComponent(
      searchQuery
    )}`;
    const response = await axios.get(url);

    totalHits = response.data.totalHits;
    totalPages = Math.ceil(totalHits / limit);

    return response.data.hits;
  } catch (error) {
    console.error('An error occurred while fetching images:', error);
    throw error;
  }
}

function checkRemainingPages() {
  if (page === totalPages) {
    return false;
  }
  return true;
}

async function addImages() {
  try {
    const images = await getImages();
    renderImages(images);
    lightbox.refresh();

    loader.classList.add('hidden');
  } catch (error) {
    console.error('An error occurred while adding images:', error);
  }
}

function smoothScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  let scrollAmount;

  if (window.innerWidth < 768) {
    scrollAmount = cardHeight * 1;
  } else {
    scrollAmount = cardHeight * 1.5;
  }

  window.scrollBy({
    top: scrollAmount,
    behavior: 'smooth',
  });
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
  message.classList.add('hidden');

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });

  page = 1;
  searchQuery = inputElement.value;
  await addImages();
  showNotification(totalHits);
  inputElement.value = '';
}

function renderImages(images) {
  images.forEach(
    ({
      webformatURL,
      largeImageURL,
      tags,
      likes,
      views,
      comments,
      downloads,
      webformatWidth,
      webformatHeight,
    }) => {
      const cardMarkup = `
      <div class="photo-card is-loading">
              <a href="${largeImageURL}">
              
                  <img class="gallery__img" src="${webformatURL}" alt="${tags}" width="${webformatWidth}" height="${webformatHeight}" loading="lazy" />
              </a>
              <div class="info">
                  <p class="info-item">
                  <i class="fa-regular fa-heart"></i>
                      <span>${likes}</span>
                  </p>
                  <p class="info-item">
                  <i class="fa-regular fa-eye"></i>
                      <span>${views}</span>
                  </p>
                  <p class="info-item">
                  <i class="fa-regular fa-comment"></i>
                      <span>${comments}</span>
                  </p>
                  <p class="info-item">
                  <i class="fa-regular fa-circle-down"></i>
                      <span>${downloads}</span>
                  </p>
              </div>
              </div>`;

      galleryElement.insertAdjacentHTML('beforeend', cardMarkup);
      imagesLoaded('.gallery', () => {
        const card = document.querySelector('.is-loading');
        card.classList.remove('is-loading');
        masonry.layout();
      });
    }
  );

  const masonry = new Masonry('.gallery', {
    itemSelector: '.photo-card',
    gutter: 15,
  });
}

async function loadMoreImages() {
  const scrollPosition = window.scrollY;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;

  if (scrollPosition + windowHeight >= documentHeight - 20) {
    if (checkRemainingPages()) {
      loader.classList.remove('hidden');
      page += 1;
      await addImages();
      smoothScroll();
    } else {
      message.classList.remove('hidden');
    }
  }
  return;
}

document.addEventListener('scroll', throttle(300, loadMoreImages));
