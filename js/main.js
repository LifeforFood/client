$(document).ready(function () {
  $('#signout').hide();
  $('#login').show();
  $('#mainBody').hide()
  $('#register').hide()
  checkLogin()

  $('#triggerSignin').submit(function (e) {
    e.preventDefault();
    signinM()
  })

  $('#triggerSignup').submit(function (e) {
    e.preventDefault();
    const newUsername = $('#usernameR').val();
    const newEmail = $('#emailR').val();
    const newPassword = $('#passwordR').val();
    signupM( newUsername, newEmail, newPassword )
  })
})


const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2000
})


function goToRegister () {
  $('#login').hide();
  $('#mainBody').hide();
  $('#register').show();
}
function backLogin () {
  $('#login').show();
  $('#mainBody').hide();
  $('#register').hide()
}

function signupM ( username, email, password ) {
  $.ajax({
    method: 'post',
    url: 'http://localhost:3000/signup',
    data: { username, email, password }
  })
    .then(data => {
      $('#usernameR').val('');
      $('#emailR').val('');
      $('#passwordR').val('');
      localStorage.setItem('token', data.token)
      Swal.fire({
        type: 'success',
        title: 'Register success',
        text: data.msg
      })
      $('#register').hide();
      $('#login').hide();
      $('#mainBody').show();
      $('#signout').show()
    })
    .catch(err => {
      Swal.fire({
        position: 'bottom-end',
        type: 'warning',
        title: 'OOpss',
        text: err.responseJSON.msg
      })
    })
}


function signinM () {
  const email = $('#email').val();
  const password = $('#password').val();
  $.ajax({
    method: 'post',
    url: 'http://localhost:3000/signin',
    data: { email, password }
  })
    .then(data => {
      //signin token sama usernya
      Swal.fire({
        position: 'top-end',
        type: 'success',
        title: 'success login',
        timer: 1200
      })
      localStorage.setItem('token', data.token)
      fetchData()
      $('#login').hide()
      $('#signout').show()
      $('#mainBody').show()
      $('#email').val('')
      $('#password').val('')
    })
    .catch(err => {
      Swal.fire({
        title: 'Wooops Something Wrong Bro!',
        animation: false,
        customClass: {
          popup: 'animated tada'
        },
        type: 'info',
        text: err.responseJSON.msg
      })
    })
}

function checkLogin () {
  if(localStorage.getItem('token')) {
    $('#signout').show()
    $('#login').hide()
    $('#mainBody').show()
    $('#register').hide()
    fetchData()
  } else {
    $('#signout').hide()
    $('#login').show()
    $('#mainBody').hide()
  }
}

function onSignIn(googleUser) {
  var id_token = googleUser.getAuthResponse().id_token;
  $.ajax({
    method: 'post',
    url: 'http://localhost:3000/signinG',
    data: {
      googleToken: id_token
    }
  })  
    .then(data => {
      fetchData()
      localStorage.setItem('token', data.token)
      $('#login').hide()
      $('#signout').show()
      $('#mainBody').show()
    })
    .catch(err => {
      Swal.fire({
        title: 'Wooops Something Wrong Bro!',
        animation: false,
        customClass: {
          popup: 'animated tada'
        }
      })
    })
}

function signOut() {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    localStorage.removeItem('token')
    $('#signout').hide();
    $('#login').show();
    $('#mainBody').hide()
    console.log('User signed out.');
  });
}

function fetchData(){
  $.ajax({
    method : 'GET',
    url : `http://localhost:3000/zomato/restaurants/74/search?filter=pondok indah`,
    headers: {
      token: localStorage.getItem('token')
    }
  })
  .done(data=>{
    $('#cards').empty()
    data.restaurants.forEach(restaurant=>{

      $('#cards').append(`
        <div class="col-md-4">
          <div class="card mb-4 shadow-sm d-flex align">
            <img class="bd-placeholder-img card-img-top" style="object-fit: cover;" src="${restaurant.restaurant.featured_image}" width="100%" height="225" >
            <div class="card-body">
              <p class="card-text font-weight-bold" style="height: 50px" >${restaurant.restaurant.name}</p>
              <p class="card-text text-muted" style="height: 100px" >${restaurant.restaurant.location.address}</p>
              <div class="d-flex justify-content-between align-items-center">
                <div class="btn-group">
                  <button onclick="showDetail('${restaurant.restaurant.id}')" type="button" class="btn btn-sm btn-outline-secondary">Description</button>
                  <button onclick="initMap(${restaurant.restaurant.location.latitude}, ${restaurant.restaurant.location.longitude})" type="button" class="btn btn-sm btn-outline-secondary">Location</button>
                </div>
                <small class="text-muted">${restaurant.restaurant.user_rating.aggregate_rating}/5 Star</small>
              </div>
            </div>
          </div>
        </div>
      `)
    })
  })
  .fail(err=>{
    console.log(err)
  })
}

$('#formSearch').submit(function(e){
  e.preventDefault()
  $.ajax({
    method : 'GET',
    url : `http://localhost:3000/zomato/restaurants/74/search?filter=${$('#searchBox').val()}`,
    headers: {
      token: localStorage.getItem('token')
    }
  })
  .done(data=>{
    $('#cards').empty()
    data.restaurants.forEach(restaurant=>{
      $('#cards').append(`
      <div class="col-md-4">
        <div class="card mb-4 shadow-sm d-flex align">
          <img class="bd-placeholder-img card-img-top" style="object-fit: cover;" src="${restaurant.restaurant.featured_image}" width="100%" height="225" >
          <div class="card-body">
            <p class="card-text font-weight-bold" style="height: 50px" >${restaurant.restaurant.name}</p>
            <p class="card-text text-muted" style="height: 100px" >${restaurant.restaurant.location.address}</p>
            <div class="d-flex justify-content-between align-items-center">
              <div class="btn-group">
                <button type="button" class="btn btn-sm btn-outline-secondary">Description</button>
                <button onclick="initMap(${restaurant.restaurant.location.latitude}, ${restaurant.restaurant.location.longitude})" type="button" class="btn btn-sm btn-outline-secondary">Location</button>
              </div>
              <small class="text-muted">${restaurant.restaurant.user_rating.aggregate_rating}/5 Star</small>
            </div>
          </div>
        </div>
      </div>
      `)
    })
  })
  .fail(err=>{
    console.log(err)
  })
})


//SHOW DETAIL

function showDetail(id){
  $('#mainBody').hide()
  $.ajax({
    method : 'GET',
    url : `http://localhost:3000/zomato/${id}`,
    headers: {
      token: localStorage.getItem('token')
    }
  })
  .done(data=>{
    $('#detail').append(`
  
    <div class="container-fluid">
      <div class="row">
        <div class="col-sm-1">
        </div>
        <div class="col-sm-7">
          <div class="d-flex flex-column">
            <div class="rounded bg-light border" style="margin-top: 50px;">
              <img src="${data.featured_image}" style="width: 100%; object-fit: cover; height: 30vh;" class="rounded-top">
              <div class="d-flex justify-content-between align-items-center" style="margin:10px">
                <div class="d-flex justify-content-center flex-column m-4">
                  <small class="text-muted">${data.cuisines}</small>
                  <h4>3 ${data.name}</h4>
                </div>
                <div class="d-flex flex-column align-items-center m-2">
                  <button class="btn btn-success">
                    ${data.user_rating.aggregate_rating}/5.0
                  </button>
                  <small>${data.user_rating.votes} votes</small>
                </div>
              </div>
            </div>
    
            <div style="width: 100%;">
              <div class="rounded bg-light border" style="margin-top: 30px;">
                <div class="container">
                  <div class="row">
    
                    <div class="col-sm m-3">
                      <div><strong>Phone Number </strong></div>
                      <div class="text-success"><strong> ${data.phone_numbers} </strong></div>
                      <div style="margin-top: 15px;"><strong> Average Cost for Two </strong></div>
                      <div>Rp. ${data.average_cost_for_two}</div>
                    </div>
    
                    <div class="col-sm m-3">
                      <div><strong>Address</strong></div>
                      <small>${data.location.address}</small>
                    </div>
    
                    <div class="col-sm m-3">
                      <div class="d-flex flex-column">
                        <div>
                          <h5> More info</h5>
                          <ul style="list-style-type: none;">
                            <li>Dinner</li>
                            <li>Cash</li>
                            <li>Wifi</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="rounded bg-light border" style="margin-top: 30px; margin-bottom: 30px;">
              <div class="m-4">
                <img src="https://b.zmtcdn.com/data/reviews_photos/985/21929b0b8763406fab51cb537601d985_1571796339.jpg" alt="" style="width: 100%;">
              </div>
            </div>
          </div>
        </div>
    
    
        <div class="col-sm-4" style="margin-top: 50px;">
          <div class="d-flex flex-wrap">
            <div class="card m-1" style="width: 11rem;">
              <img src="https://images.unsplash.com/photo-1571942389648-078c07e6a28f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2689&q=80" class="card-img-top">
              <div class="card-body">
                <h6 class="card-title">Card title</h6>
              </div>
            </div>
            <div class="card m-1" style="width: 11rem;">
              <img src="https://images.unsplash.com/photo-1571942389648-078c07e6a28f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2689&q=80" class="card-img-top">
              <div class="card-body">
                <h6 class="card-title">Card title</h6>
              </div>
            </div>
            <div class="card m-1" style="width: 11rem;">
              <img src="https://images.unsplash.com/photo-1571942389648-078c07e6a28f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2689&q=80" class="card-img-top">
              <div class="card-body">
                <h6 class="card-title">Card title</h6>
              </div>
            </div>
            <div class="card m-1" style="width: 11rem;">
              <img src="https://images.unsplash.com/photo-1571942389648-078c07e6a28f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2689&q=80" class="card-img-top">
              <div class="card-body">
                <h6 class="card-title">Card title</h6>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    `)
  })
 
  
}

// MAP FUNCTION

var map;
function initMap(lat, lng) {
  let jarak
  let waktu
  $(`#myMap`).empty()
  $.ajax({
    method : 'POST',
    url : 'http://localhost:3000/directions',
    headers: {
      token: localStorage.getItem('token')
    },
    data :{
      lat : lat,
      lng : lng
    }
  })
  .done(data=>{
    jarak = data.routes[0].legs[0].distance.text
    waktu = data.routes[0].legs[0].duration.text
    $(`#myMap`).append(`
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <!-- Modal Header -->
            <div class="modal-header">
                <h4 class="modal-title">Location</h4>
                <button type="button" class="close" data-dismiss="modal">&times;</button>
            </div>
            <!-- Modal body -->
            <div class="modal-body">
              <div id="map"></div>
            </div>
            <!-- Modal footer -->
            <div class="modal-footer">
                <p> Estimasi jarak perjalanan ${jarak} </p>
                <p> Estimasi lama perjalanan ${waktu} </p>
                <button type="button" class="btn btn-sm btn-danger" data-dismiss="modal">Close</button>
            </div>
        </div>
      </div>
    `)
    $(`#myMap`).modal("show")
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat, lng},
      zoom: 16
    });
    marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, lng),
            map: map
        })
    })
  .fail(err=>{
    console.log(err)
  })
 

  

}