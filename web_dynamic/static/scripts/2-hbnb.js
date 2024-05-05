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
})
