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
                    document.getElementById('username').innerText = data.username;
                    document.getElementById('email').innerText = data.email;
                    document.getElementById('first-name').innerText = data.first_name;
                    document.getElementById('last-name').innerText = data.last_name;
                    const html = `<h2 id='pass-text'>${'&#8226;'.repeat(data.password.length)}</h2>`;
                    document.getElementById('password').innerHTML = html;
                });
            } else {
                return response.json().then(data => {
                    alert(data.error);
                });
            }
        });
        // .catch(error => {
        //     alert("An error happened");
        // });
}

function update() {
    const url = "http://127.0.0.1:5000/users";
    const fields = document.getElementsByClassName('input-text');
    let data = {};
    for (let i=0; i < fields.length; i++){
        switch (fields[i].id.split('-')[0]) {
            case 'username': data.username = fields[i].value; break;
            case 'email': data.email = fields[i].value; break;
            case 'first-name': data.first_name = fields[i].value; break;
            case 'last-name': data.last_name = fields[i].value; break;
            case 'password': data.password = fields[i].value; break;
        }
    }
    console.log(data)
    fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include'
    })
    .then(response => {
        if (response.status === 200) {
            return response.json().then(data => {
                alert(data.message);
                window.location.href = "profile.html";
            });
        } else {
            return response.json().then(data => {
                alert(data.error)
            });
        }
    });
        // .catch(error => {
        //     alert("An error happened");
        // });
}

function checkPassword(){
    const fields = document.getElementsByClassName('input-pass');
    const curr_pw = fields[0].value;
    fetch(`http://127.0.0.1:5000/users/pass/${curr_pw}`, {
        method: 'GET',
        credentials: 'include',
    })
    .then(response => {
        if (response.status == 200) {
            close_modal();
            document.getElementById('pass-text').hidden = true;
            const elem = document.getElementById('password');
            const value = fields[1].value;
            const html = `<input class="input-text" type="password" form="update" id="password-input" value="${value}">`;
            elem.insertAdjacentHTML('afterbegin',html);
            document.getElementById('update-btn').disabled = false;
        }
        else {
            return response.json().then(data => {
                alert(data.error)
            });
        }
    })
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
    let elem = document.getElementById(attr);
    const exists = document.getElementById(attr+'-input');
    if (exists) {
        const value = exists.placeholder;
        exists.remove();
        elem.innerText = value;
    }
    else if (elem) {
        const value = elem.innerText;
        const html = `<input class="input-text" type="text" form="update" id="${attr}-input" placeholder="${value}">`;
        elem.innerHTML = html;
    }
    elem = document.getElementById('update-btn');
    const edit = document.getElementsByClassName('input-text');
    console.log(edit)
    if (edit.length > 0) {
        elem.disabled = false;
    }
    else {
        elem.disabled = true;
    }
    
}

function open_modal() {
    console.log(edit.length);
    const exists = document.getElementById('password-input');
    if (exists) {
        exists.remove();
        document.getElementById('pass-text').hidden = false;
        const edit = document.getElementsByClassName('input-text');
        const elem = document.getElementById('update-btn');
        if (edit.length > 0) {
            elem.disabled = false;
        }
        else {
            elem.disabled = true;
        }
    }
    else {
        const element = document.getElementsByClassName('modal')[0]
        element.classList.add('open-modal');
    }
    
}

function close_modal() {
  element = document.getElementsByClassName('modal')[0]
    element.classList.remove('open-modal');
}

window.addEventListener('load', () => {
    getProfile();
});

document.getElementById("logout-btn").addEventListener("click", logOut);
document.getElementById("update-btn").addEventListener("click", update);
document.getElementById("pass-btn").addEventListener("click", open_modal);
document.getElementById("validate-btn").addEventListener("click", checkPassword);

const edit_btn = document.getElementsByClassName("edit")
let array = Array.from(edit_btn);
array.forEach(element => {
    element.addEventListener("click", edit);
});
