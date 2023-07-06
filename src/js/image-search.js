import axios from 'axios';

const API_KEY = '38106260-22c65560723f63c5e0affa5f7';

const formElement = document.querySelector('.search-form');
const inputElement = document.querySelector('.form__input');
const buttonElement = document.querySelector('.form__button');
const galleryElement = document.querySelector('.gallery');

async function getImages() {
  const searchParams = new URLSearchParams({
    key: API_KEY,
    q: inputElement.value,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
  });
  const url = `https://pixabay.com/api/?${searchParams}`;
  const response = await axios.get(url);
  const images = response.data;
  console.log(images);
}

formElement.addEventListener('submit', onSubmit);

function onSubmit(event) {
  event.preventDefault();
  getImages();
}
