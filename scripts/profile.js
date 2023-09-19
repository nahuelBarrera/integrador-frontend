function getProfile() {
    const url = "http://127.0.0.1:5000/users/profile";
    fetch(url, {
        method: 'GET',
        credentials: 'include'
    })
        .then(response => {
            if (response.status === 200) {
                return response.json().then(data => {
                    console.log(data)
                    document.getElementById("username").innerText = data.username;
                    document.getElementById("email").innerText = data.email;
                    document.getElementById("first_name").innerText = data.first_name;
                    document.getElementById("last_name").innerText = data.last_name;
                });
            } else {
                return response.json().then(data => {
                    alert(data.error);
                });
            }
        })
        .catch(error => {
            alert("An error happened");
        });
}

function logOut() {
    const url = "http://127.0.0.1:5000/users/logout";
    fetch(url, {
        method: 'GET',
        credentials: 'include'
    })
        .then(response => {
            if (response.status === 200) {
                return response.json().then(data => {
                    alert(data.message)
                    window.location.href = "login.html";
                });
            } else {
                return response.json().then(data => {
                    alert(data.error)
                });
            }
        })
        .catch(error => {
            alert("An error happened");
        });
}

function animate_menu() {
    const elem = document.getElementsByClassName('navbar')[0];
    const icon = document.getElementsByClassName('menu-btn')[0];
    if (elem.id == 'open') {
        elem.id = '';
        icon.id = ''; 
    }
    else {
        elem.id = 'open';
        icon.id = 'open-menu-btn';         
    }
}

function edit() {
    const attr = this.getAttribute('class').split(' ')[0];
    console.log(attr);
    const elem = document.querySelector('.'+attr);
    console.log(elem);
    html = `<input class="input-text" type="text" id="${attr}" placeholder="${attr}">`;
    elem.insertAdjacentHTML("afterbegin", html);
}

window.addEventListener('load', () => {
    getProfile();
});

document.getElementById("logout-btn").addEventListener("click", logOut);

const edit_btn = document.getElementsByClassName("edit")
let array = Array.from(edit_btn);
array.forEach(element => {
    element.addEventListener("click", edit);
});
