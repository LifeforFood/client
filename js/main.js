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
}

function random(){
  $.ajax({
    url: 'http://localhost:3000/zomato/random',
    method: 'GET',
    headers: {
      token: localStorage.getItem('token')
    }
  })
    .done(({restaurant})=>{
      $('#random').empty()
      $('#random').append(`
        <div class="card mb-4 shadow-sm d-flex align">
          <img class="bd-placeholder-img card-img-top" style="object-fit: cover;" src="${restaurant.featured_image}" width="100%" height="225" >
          <div class="card-body">
            <p class="card-text font-weight-bold" style="height: 50px" >${restaurant.name}</p>
            <p class="card-text text-muted" style="height: 100px" >${restaurant.location.address}</p>
            <div class="d-flex justify-content-between align-items-center">
              <div class="btn-group">
                <button type="button" class="btn btn-sm btn-outline-secondary">Description</button>
                <button onclick="initMap(${restaurant.location.latitude}, ${restaurant.location.longitude})" type="button" class="btn btn-sm btn-outline-secondary">Location</button>
              </div>
              <div class="d-flex align-items-center" id="botBtn">
                <button class="btn btn-danger m-2" data-toggle="modal" data-target="#exampleModal">Decide</button>
                <small class="text-muted">${restaurant.user_rating.aggregate_rating}/5 Star</small>
              </div>
            </div>
          </div>
          <div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
                  <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div class="modal-body" id="modal-body">
                </div>
                <div class="modal-footer d-flex justify-content-between">
                  <div id="newDecide">
                    <button class="btn btn-warning" onclick="yesNo()">Decide</button>
                  </div>
                  <div id="decision">
                  </div>
                  <div id="randomClose">
                    <button type="button" class="btn btn-danger" data-dismiss="modal">Close</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `)
      console.log(restaurant);
    })
    .fail(err=>{
      console.log(err)
    })
}

function yesNo(){
  console.log(123);
  $.ajax({
    url: 'http://localhost:3000/yesno',
    method: 'GET'
  })
    .done(obj=>{
      $('#modal-body').empty()
      $('#modal-body').append(`
        <img class="bd-placeholder-img card-img-top" style="object-fit: contain;" src="${obj.image}" width="100%" height="225" >        
      `)
      if(obj.answer == 'yes'){
        $('#decision').empty()
        $('#decision').append(`
          <h3>LET'S GO</h3>
        `)
        $('#newDecide').empty()
      }
      else{
        $('#decision').empty()
        $('#decision').append(`
        <h3>NO</h3>
        `)
        $('#newDecide').empty()
        $('#botBtn').prepend(`
          <button class="btn btn-warning m-2" onclick="random()">Random Again</button>
        `)
      }
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