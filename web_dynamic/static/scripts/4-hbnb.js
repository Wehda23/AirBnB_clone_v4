/* This is an event listener when the page is loaded */
$(document).ready(function () {
    const amenities = [];
    $('input[type="checkbox"]').click(function (){
        const amenityId = $(this).attr('data-id');
        const amenityName = $(this).attr('data-name');
        if ($(this).prop('checked') === true) {
            amenities[amenityId] = amenityName;
          } else if ($(this).prop('checked') === false) {
            delete amenities[amenityId];
          }
          const amenityList = Object.values(amenities).join(', ');
          if (amenityList.length > 30) {
            $('.amenities h4').text(amenityList.substring(0, 29) + '...');
          } else {
            $('.amenities h4').text(amenityList);
          }
          if ($.isEmptyObject(amenities)) {
            $('.amenities h4').html('&nbsp;');
          }
    })
    /* Fetch status */
    fetch('http://0.0.0.0:5001/api/v1/status/')
    .then(response => response.json())
    .then(data => {
        const status = data.status;
        const apiStatusDiv = document.getElementById('api_status');
        if (status === 'OK') {
            apiStatusDiv.classList.add('available');
        } else {
            apiStatusDiv.classList.remove('available');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
    // Grab places
    post_places_search();

    /* Add event listener to button onclick */
    $("button").click(post_places_search);
})


function post_places_search() {
    /* Fetch places */
    fetch('http://0.0.0.0:5001/api/v1/places_search/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    })
    .then(response => response.json())
    .then(data => {
        const placesSection = document.querySelector('.places');
        placesSection.innerHTML = "";
        data.forEach(place => {
            const article = document.createElement('article');
            article.innerHTML = `
                <div class="title_box">
                    <h2>${place.name}</h2>
                    <div class="price_by_night">$${place.price_by_night}</div>
                </div>
                <div class="information">
                    <div class="max_guest">${place.max_guest} Guest${place.max_guest != 1 ? 's' : ''}</div>
                    <div class="number_rooms">${place.number_rooms} Bedroom${place.number_rooms != 1 ? 's' : ''}</div>
                    <div class="number_bathrooms">${place.number_bathrooms} Bathroom${place.number_bathrooms != 1 ? 's' : ''}</div>
                </div>
                <div class="user">
                    <b>Owner:</b> ${place.user.first_name} ${place.user.last_name}
                </div>
                <div class="description">
                    ${place.description}
                </div>
            `;
            placesSection.appendChild(article);
        });
    })
    .catch(error => console.error('Error fetching places:', error));
}