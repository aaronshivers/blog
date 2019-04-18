const navLinks = document.getElementById('navLinks')

document.cookie ? null : navLinks.innerHTML += `<li class="nav-item"><a class="nav-link" href="/users/login">Login</a></li>`
document.cookie ? null : navLinks.innerHTML += `<li class="nav-item"><a class="nav-link" href="/users/signup">Signup</a></li>`
// document.cookie ? navLinks.innerHTML += `<li class="nav-item"><a class="nav-link" href="/users">Users</a></li>` : null
document.cookie ? navLinks.innerHTML += `<li class="nav-item"><a class="nav-link" href="/admin">Admin</a></li>` : null
document.cookie ? navLinks.innerHTML += `<li class="nav-item"><a class="nav-link" href="/users/profile">Profile</a></li>` : null
document.cookie ? navLinks.innerHTML += `<li class="nav-item"><a class="nav-link" href="/users/logout">Logout</a></li>` : null
