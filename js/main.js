$(document).ready(function () {
  $('#signout').hide();
  $('#login').show();
  $('#mainBody').hide()
  checkLogin()

  $('#triggerSignin').submit(function (e) {
    e.preventDefault();
    signinM()
  })
})


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

function checkLogin () {
  if(localStorage.getItem('token')) {
    $('#signout').show()
    $('#login').hide()
    $('#mainBody').show()
    fetchData()
  } else {
    $('#signout').hide()
    $('#login').show()
    $('#mainBody').hide()
    fetchData()
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
      localStorage.setItem('token', data.token)
      Swal.fire({
        position: 'top-start',
        type: 'success',
        title: 'You\'re logged in',
        showConfirmButton: false,
        timer: 100
      })
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
    url: 'http://localhost:3000/zomato/restaurants/74',
    method: 'GET'
  })
    .done(restaurants=>{
      restaurants.collections.forEach(restaurant=>{
        const collection = restaurant.collection
        console.log(collection);
        $('#cards').append(`
          <div class="col-md-4">
            <div class="card mb-4 shadow-sm d-flex align">
              <img class="bd-placeholder-img card-img-top" style="object-fit: contain;" src="${collection.image_url}" width="100%" height="225" >
              <div class="card-body">
                <p class="card-text" style="height: 100px" >${collection.description}</p>
                <div class="d-flex justify-content-between align-items-center">
                  <div class="btn-group">
                    <button type="button" class="btn btn-sm btn-outline-secondary">Description</button>
                    <button type="button" class="btn btn-sm btn-outline-secondary">Location</button>
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
