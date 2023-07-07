import axios from 'axios';

const API_KEY = '38106260-22c65560723f63c5e0affa5f7';

const formElement = document.querySelector('.search-form');
const inputElement = document.querySelector('.form__input');
const buttonElement = document.querySelector('.form__button');
const galleryElement = document.querySelector('.gallery');

async function getImages() {
  const searchParams = new URLSearchParams({
    key: API_KEY,
    q: encodeURIComponent(inputElement.value),
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
  });
  const url = `https://pixabay.com/api/?${searchParams}`;
  const response = await axios.get(url);
  console.log(response.data.hits);
  return response.data.hits;
}

formElement.addEventListener('submit', onSubmit);

async function onSubmit(event) {
  event.preventDefault();
  let images = await getImages();
  renderImages(images);
  inputElement.value = '';
}

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
            <img class="gallery__img" src="${webformatURL}" alt="${tags}" loading="lazy" />
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
  galleryElement.innerHTML = markup;
}
