window.onload = function () {
  Particles.init({
    selector: '.background-particle',
    color: '#ffffff',
    connectParticles: false,
    retina_detect: true,
  })
  loadingFunction()
  removeLoader()
}
function loadingFunction() {
  let redirect = window.location.href.split('#')
  if (redirect[1] == 'register') {
    document.getElementById('registerButton').click()
  } else {
    document.getElementById('loginButton').click()
  }
}
function changeToLogin(item) {
  document.getElementById('login-container').style.display = 'flex'
  document.getElementById('signup-container').style.display = 'none'
  item.style.backgroundColor = '#fff'
  item.style.color = '#000'
  document.getElementById('registerButton').style.color = '#fff'
  document.getElementById('registerButton').style.backgroundColor =
    'rgba(0, 0, 0, 0.7)'
}
function changeToRegister(item) {
  document.getElementById('login-container').style.display = 'none'
  document.getElementById('signup-container').style.display = 'flex'
  item.style.backgroundColor = '#fff'
  item.style.color = '#000'
  document.getElementById('loginButton').style.color = '#fff'
  document.getElementById('loginButton').style.backgroundColor =
    'rgba(0, 0, 0, 0.7)'
}

function removeLoader() {
  document.getElementById('loader').style.display = 'none'
}
