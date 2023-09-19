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
    elem = document.getElementsByClassName('navbar')[0];
    icon = document.getElementsByClassName('menu-btn')[0];
    if (elem.id == 'open') {
        elem.id = '';
        icon.id = ''; 
    }
    else {
        elem.id = 'open';
        icon.id = 'open-menu-btn';         
    }
};

window.addEventListener('load', () => {
    getProfile();
});

document.getElementById("logout-btn").addEventListener("click", logOut);

