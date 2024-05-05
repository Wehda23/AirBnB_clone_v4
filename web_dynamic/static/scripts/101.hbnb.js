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
        updateLocations();
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
    const cities = {};
	const states = {};

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
            fetchReviews(place.id);
        });
    })
    .catch(error => console.error('Error fetching places:', error));

    // Make a new POST request to places_search with the list of Amenities, Cities, and States checked
    var selectedAmenities = [];
    $('.amenities input[type="checkbox"]:checked').each(function() {
        selectedAmenities.push($(this).data('id'));
    });

    var selectedCities = [];
    $('.locations ul > li input[type="checkbox"]:checked').each(function() {
        if ($(this).data('name')) {
            selectedCities.push($(this).data('id'));
        }
    });

    var selectedStates = [];
    $('.locations ul > li input[type="checkbox"]:checked').each(function() {
        if ($(this).data('id')) {
            selectedStates.push($(this).data('id'));
        }
    });
}


// Function to update h4 tag with the list of States or Cities checked
function updateLocations() {
    var checkedStates = [];
    var checkedCities = [];

    // Loop through all checkboxes
    $('input[type="checkbox"]').each(function() {
        if ($(this).is(':checked')) {
            if ($(this).data('name')) {
                // If it's a city checkbox
                checkedCities.push($(this).data('name'));
            } else if ($(this).data('id')) {
                // If it's a state checkbox
                checkedStates.push($(this).data('name'));
            }
        }
    });

    // Update h4 tag inside the div Locations with the list of States or Cities checked
    var locationsText = '';
    if (checkedStates.length > 0) {
        locationsText += 'States: ' + checkedStates.join(', ') + '<br>';
    }
    if (checkedCities.length > 0) {
        locationsText += 'Cities: ' + checkedCities.join(', ');
    }
    $('.filters .locations h4').html(locationsText);
}


function fetchReviews(placeId) {
    fetch(`http://0.0.0.0:5001/api/v1/places/${placeId}/reviews`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            $(`.reviews[data-place="${placeId}"] h2`)
                .text("test")
                .html(`${data.length} Reviews <span id="toggle_review">show</span>`);
            $(`.reviews[data-place="${placeId}"] h2 #toggle_review`).on(
                "click",
                { placeId },
                function (e) {
                    const rev = $(`.reviews[data-place="${e.data.placeId}"] ul`);
                    if (rev.css("display") === "none") {
                        rev.css("display", "block");
                        data.forEach((r) => {
                            fetch(`http://0.0.0.0:5001/api/v1/users/${r.user_id}`)
                                .then(response => {
                                    if (!response.ok) {
                                        throw new Error('Network response was not ok');
                                    }
                                    return response.json();
                                })
                                .then(u => {
                                    $(".reviews ul").append(`
                                        <li>
                                            <h3>From ${u.first_name + " " + u.last_name} the ${r.created_at}</h3>
                                            <p>${r.text}</p>
                                        </li>`
                                    );
                                })
                                .catch(error => console.error('Error fetching user:', error));
                        });
                    } else {
                        rev.css("display", "none");
                    }
                }
            );
        })
        .catch(error => console.error('Error fetching reviews:', error));
}
