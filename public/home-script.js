const container = document.getElementById('container')
const loginLink = document.getElementsByClassName('loginLink')

document.cookie ? null : container.innerHTML += `<a class="btn btn-outline-primary btn-block mt-3" href="/login">Login</a>`
document.cookie ? null : container.innerHTML += `<a class="btn btn-outline-primary btn-block mt-3" href="/signup">Signup</a>`
document.cookie ? container.innerHTML += `<a class="btn btn-outline-primary btn-block mt-3" href="/profile">Profile</a>` : null
document.cookie ? container.innerHTML += `<a class="btn btn-outline-primary btn-block mt-3" href="/logout">Logout</a>` : null
