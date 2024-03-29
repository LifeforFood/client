$(document).ready(function () {
  $('#signout').hide();
  $('#login').show();
  $('#mainBody').hide()
  $('#register').hide()
  $('#detailDesc').empty().hide();
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

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-success',
    cancelButton: 'btn btn-danger'
  },
  buttonsStyling: false
})


function goToRegister () {
  $('#login').hide();
  $('#mainBody').hide();
  $('#register').show();
  $('#detailPage').hide();
  $('#detailDesc').empty();
}

function backLogin () {
  $('#login').show();
  $('#mainBody').hide();
  $('#register').hide();
  $('#detailDesc').empty();
  $('#detailPage').hide();
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
      $('#detailPage').hide();
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
    $('#favorites').empty()
    fetchFavorite()
      .then(data => {
        $('#favorites').append(`
          <div class="btn-group">
            <button type="button" class="btn btn-info dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              ${data.length} Fav
            </button>
            <div class="dropdown-menu">

            </div>
          </div>
        `)
        data.forEach(el => {
          console.log(el)
          $('.dropdown-menu').append(`
            <a class="dropdown-item" href="#" onclick='showMyFav("${el.zomatoId}")'>${el.name}</a>
          `)
        })
      })
      .catch(err => {
        Toast.fire({
          type: 'warning',
          title: err
        })
      })
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
      $('#detailPage').hide();
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

function goHome () {
  $('#mainBody').show();
  $('#detailPage').hide();
  $('#detailDesc').empty().hide();
}

function signOut() {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    localStorage.removeItem('token')
    $('#signout').hide();
    $('#login').show();
    $('#mainBody').hide()
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

    Toast.fire({
      type: 'success',
      title: 'Fetching Restaurant'
    })
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
                  <button onclick='addToFav("${restaurant.restaurant.id}","${restaurant.restaurant.name}")' class='btn btn-outline-danger btn-sm'>Add Fav</button>
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
    Toast.fire({
      type: 'warning',
      title: err.responseJSON
    })
  })
}

function addToFav (id, name) {
  $('#detailDesc').empty();
  $.ajax({
    method: 'post',
    url: 'http://localhost:3000/fav',
    headers: {
      token: localStorage.getItem('token')
    },
    data: {
      zomatoId: id,
      name
    }
  })
    .then(data => {
      Toast.fire({
        type: 'success',
        title: data.msg
      })
      return fetchFavorite ()
    })
    .then(data => {
      $('#favorites').empty()
      $('.dropdown-menu').empty()
      $('#favorites').append(`
        <div class="btn-group">
          <button type="button" class="btn btn-info dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            ${data.length} Fav
          </button>
          <div class="dropdown-menu">

          </div>
        </div>
      `)
      data.forEach(el => {
        $('.dropdown-menu').append(`
          <a class="dropdown-item" href="#" onclick='showMyFav("${el.zomatoId}")'>${el.name}</a>
        `)
      })
    })
    .catch(err => {
      Toast.fire({
        type: 'warning',
        title: err.responseJSON.msg
      })
    })
}


function fetchFavorite () {
  return new Promise ((resolve, reject) => {
    $.ajax({
      method: 'get',
      url: 'http://localhost:3000/fav',
      headers: {
        token: localStorage.getItem('token')
      }
    })
      .then(data => {
        resolve(data)
      })
      .catch(err => {
        reject(err.responseJSON.msg)
      })
  })
}
var idData =''
var tempFav = []
function showMyFav (id) {
  $('#detailDesc').empty();

  idData = id
  $('#detailPage').show();
  $('#detailFavorite').empty()
  $('#imageRandomForFavorite').empty();
  $('#mainBody').hide();
  $('#detailFavorite').empty()
  $.ajax({
    method: 'get',
    url: `http://localhost:3000/zomato/${ id }`,
    headers: {
      token: localStorage.getItem('token')
    }
  })
    .then(restaurant => {
      const data = restaurant
      $('#detailFavorite').append(`
      <div class="d-flex flex-column">
        <div class="rounded bg-light border" style="margin-top: 50px;">
          <img src="${data.featured_image}" style="width: 100%; object-fit: cover; height: 30vh;" class="rounded-top">
          <div class="d-flex justify-content-between align-items-center" style="margin:10px">
            <div class="d-flex justify-content-center flex-column m-4">
              <small class="text-muted">${data.cuisines}</small>
              <h4>${data.name}</h4>
          </div>
          <div class="d-flex flex-row align-items-center m-2" id='removeFav'>
            <button class='btn btn-outline-danger btn-sm' onclick='removeFavo("${id}")'>Remove Fav</button>
            <div class="d-flex flex-column align-items-center m-2">
              <button class="btn btn-success">
                ${data.user_rating.aggregate_rating}/5.0
              </button>
              <small>${data.user_rating.votes} votes</small>
            </div>
          </div>  
        </div>
      </div>
      <div style="width: 100%;">
        <div class="rounded bg-light border" style="margin-top: 30px;">
          <div class="container">
            <div class="row">

              <div class="col-sm m-3" id="contactFav">
                <div><strong>Phone Number </strong></div>
                <div class="text-success"><strong> ${data.phone_numbers} </strong></div>
                <div style="margin-top: 15px;"><strong> Average Cost For Two </strong></div>
                <div>Rp. ${data.average_cost_for_two}</div>
              </div>
              <div class="col-sm m-3" id='addressFav'>
                <div><strong>Address</strong></div>
                <small>${data.location.address}</small>
              </div>
              <div class="col-sm m-3">
                <div class="d-flex flex-column">
                  <div>
                    <h5>Highlights</h5>
                    <div class='row' id='highlightLoop'>


                    </div>
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
      `)
      $('#highlightLoop').empty()
      data.highlights.forEach((el, i) => {
        $('#highlightLoop').append(`
        <div class='rowside'>${el}, </div>
        `)
      })


      fetchingRandomRestaurant()
      setTimeout(() => {
        tempFav.forEach(el =>{
          $('#imageRandomForFavorite').append(`
          <div class="card m-1" style="width: 11rem;">
            <img src="${el.featured_image}" class="card-img-top" style='height:200px'>
            <div class="card-body">
              <h6 class="card-title">${el.name}</h6>
            </div>
          </div>
          `)     
        })
      }, 5000);
    })
    .catch(err => {
      Toast.fire({
        type: 'error',
        title: err.responseJSON.msg
      })
    })
}

function removeFavo (id) {
  swalWithBootstrapButtons.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    type: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'No, cancel!',
    reverseButtons: true
  }).then((result) => {
    if (result.value) {
      $.ajax({
        method: 'delete',
        url: `http://localhost:3000/fav/${id}`,
        headers: {
          token: localStorage.getItem('token')
        }
      })
        .then(data => {
          swalWithBootstrapButtons.fire(
            'Deleted!',
            data.msg,
            'success'
          )
          return fetchFavorite()
        })
        .then(data => {
          $('#favorites').empty()
          $('.dropdown-menu').empty()
          $('#favorites').append(`
            <div class="btn-group">
              <button type="button" class="btn btn-info dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                ${data.length} Fav
              </button>
              <div class="dropdown-menu">

              </div>
            </div>
          `)
          data.forEach(el => {
            $('.dropdown-menu').append(`
              <a class="dropdown-item" href="#" onclick='showMyFav("${el.zomatoId}","${el._id}")'>${el.name}</a>
            `)
          })
        })
        .catch(err => {
          Toast.fire({
            type: 'info',
            title: 'oops',
            text: err.responseJSON.msg
          })
        })
    } else if (
      /* Read more about handling dismissals below */
      result.dismiss === Swal.DismissReason.cancel
    ) {
      swalWithBootstrapButtons.fire(
        'Cancelled',
        'Your imaginary Todo is safe :)',
        'error'
      )
    }
  })
}


function fetchingRandomRestaurant () {
  let temp = []
    for(let i=0; i<6; i++){
      $.ajax({
        method: 'get',
        url: 'http://localhost:3000/zomato/random',
        headers: {
          token: localStorage.getItem('token')
        }
      })
        .then(res => {
          console.log(res)
          const data = res.restaurant
          temp.push({ featured_image: data.featured_image, name: data.name })
        })
        .catch(err => {
          Toast.fire({
            type: 'error',
            title: 'something wrong'
          })
        })
    }
  tempFav = temp
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
                <button onclick='addToFav("${restaurant.restaurant.id}")' class='btn btn-outline-danger btn-sm'>Add Fav</button>
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
    Toast.fire({
      type: 'error',
      title: err.responseJSON
    })
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
    const lat = Number(data.location.latitude)
    const lng = Number(data.location.longitude)

    $('#detailDesc').append(`
    <div class="d-flex flex-column">
        <div class="rounded bg-light border" style="margin-top: 50px;">
          <img src="${data.featured_image}" style="width: 100%; object-fit: cover; height: 30vh;" class="rounded-top">
          <div class="d-flex justify-content-between align-items-center" style="margin:10px">
            <div class="d-flex justify-content-center flex-column m-4">
              <small class="text-muted">${data.cuisines}</small>
              <h4>${data.name}</h4>
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

              <div class="col-sm m-3" id="contactFav">
                <div><strong>Phone Number </strong></div>
                <div class="text-success"><strong> ${data.phone_numbers} </strong></div>
                <div style="margin-top: 15px;"><strong> Average Cost For Two </strong></div>
                <div>Rp. ${data.average_cost_for_two}</div>
              </div>
              <div class="col-sm m-3" id='addressFav'>
                <div><strong>Address</strong></div>
                <small>${data.location.address}</small>
              </div>
              <div class="col-sm m-3">
                <div class="d-flex flex-column">
                  <div>
                    <h5>Highlights</h5>
                    <div class='row' id='highlightLoop'>


                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="rounded bg-light border" style="margin-top: 30px; margin-bottom: 30px;">
        <div id="map" class="m-4">
        </div>
      </div>
    </div>
    
    `)
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat , lng },
      zoom: 16
    });
    marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, lng),
            map: map
    })
    $('#highlightLoop').empty()
    data.highlights.forEach((el, i) => {
      $('#highlightLoop').append(`
      <div class='rowside'>${el}, </div>
      `)
    })

    fetchingRandomRestaurant()
    setTimeout(() => {
      tempFav.forEach(el =>{
        console.log("SINI------------")
        console.log(el)
        $('#imageRandomForFavorite').append(`
        <div class="card m-1" style="width: 11rem;">
          <img src="${el.featured_image}" class="card-img-top" style='height:200px'>
          <div class="card-body">
            <h6 class="card-title">${el.name}</h6>
          </div>
        </div>
        `)     
      })
    }, 5000);

  })
  .catch(err => {
    Toast.fire({
      type: 'error',
      title: err.responseJSON.msg
    })
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