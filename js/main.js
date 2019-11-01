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
    url: 'http://localhost:3000/zomato/restaurants',
    method: 'GET',
    headers: {
      token: localStorage.getItem('token')
    }
  })
    .done(restaurants=>{
      Toast.fire({
        type: 'success',
        title: 'Fetching Restaurant'
      })
      restaurants.forEach(restaurant=>{
        console.log(restaurant);
        $('#cards').append(`
          <div class="col-md-4">
            <div class="card mb-4 shadow-sm d-flex align">
              <img class="bd-placeholder-img card-img-top" style="object-fit: contain;" src="${restaurant.restaurant.featured_image}" width="100%" height="225" >
              <div class="card-body">
                <p class="card-text" style="height: 100px" >${restaurant.restaurant.name}</p>
                <div class="d-flex justify-content-between align-items-center">
                  <div class="btn-group">
                    <button type="button" class="btn btn-sm btn-outline-secondary">Description</button>
                    <button type="button" class="btn btn-sm btn-outline-secondary">Location</button>
                    <button class='btn btn-outline-danger btn-sm' onclick='add>Fav</button>
                  </div>
                  <small class="text-muted">4/5 Star</small>
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
