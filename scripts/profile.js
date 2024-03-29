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
                document.getElementById('first_name').innerText = data.first_name;
                document.getElementById('last_name').innerText = data.last_name;
                const html = `<h2 id='pass-text'>${'&#8226;'.repeat(data.password.length)}</h2>`;
                document.getElementById('password').innerHTML = html;
                fetch('http://127.0.0.1:5000/users/download', {
                    method: 'GET',
                    credentials: 'include'
                })
                .then(response => {
                    if (response) {
                        return response.blob().then(data => {
                            const img = URL.createObjectURL(data);
                            document.getElementById('profile-photo').style = `background-image: url(${img})`;
                        })
                    }
                    else {
                        console.log('NO SE PUDO DESCARGAR LA FOTO')
                    }
                })
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
    console.log(fields)
    let data = {};
    for (let i = 0; i < fields.length; i++) {
        switch (fields[i].id.split('-')[0]) {
            case 'username': data.username = fields[i].value; break;
            case 'email': data.email = fields[i].value; break;
            case 'first_name': data.first_name = fields[i].value; break;
            case 'last_name': data.last_name = fields[i].value; break;
            case 'password': data.password = fields[i].value; break;
        }
    }
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
                    document.getElementById('account').click();
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

function uploadFile() {
    const [file] = document.querySelector('input[type=file]').files;
    const formData = new FormData();
    console.log(file)
    formData.set('file', file, 'profile_picture.png');
    console.log(formData.get('file'));
    fetch("http://127.0.0.1:5000/users/upload", {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
        },
        body: formData,
        credentials: 'include'
    })
        .then(response => {
            if (response.status === 200) {
                return response.json().then(data => {
                    document.getElementById('account').click();
                    close_modal();
                });
            } else {
                return response.json().then(data => {
                    alert(data.error)
                });
            }
        });
}

function checkPassword() {
    const curr_pw = document.getElementById('cur-pass').value;
    fetch(`http://127.0.0.1:5000/users/pass/${curr_pw}`, {
        method: 'GET',
        credentials: 'include',
    })
        .then(response => {
            if (response.status == 200) {
                return response.json().then(data => {
                    alert(data.message);
                    close_modal();
                    document.getElementById('pass-text').hidden = true;
                    const elem = document.getElementById('password');
                    const html = `<input class="input-text" type="password" form="update-form" id="password-input" placeholder="new password">`;
                    elem.insertAdjacentHTML('afterbegin', html);
                    document.getElementById('update-btn').disabled = false;
                });
            }
            else {
                return response.json().then(data => {
                    alert(data.error)
                });
            }
        })
}

function logOut() {
    if (confirm('Are you sure you want to log out?')) {
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
    const exists = document.getElementById(attr + '-input');
    if (exists) {
        const value = exists.placeholder;
        exists.remove();
        elem.innerText = value;
    }
    else if (elem) {
        const value = elem.innerText;
        const html = `<input class="input-text" type="text" form="update-form" id="${attr}-input" placeholder="${value}">`;
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
        let content = document.getElementById('form-container');
        content.innerHTML = `<span class="form-content">
                                <h3>Password validation</h3>
                                <h5>Please insert your current password:</h5>
                                <form method='GET' id="pass-form" name="pass">
                                <p><input class="input-pass" type="password" id="cur-pass" placeholder="current password" required></p>
                                <span>
                                    <p><input type="submit" form="pass-form" name="pass-validate" id="validate-btn" value="Validate"></p>
                                    <p><input type="reset" form="pass-form" name="pass-cancel" id="cancel-btn" value="Cancel"></p>
                                </span>
                                </form>
                            </span>`
        document.getElementById("pass-form").addEventListener("submit", (event) => {
            event.preventDefault();
            checkPassword();
        });
        document.getElementById('cancel-btn').addEventListener('click', close_modal);
        const element = document.getElementById('modal');
        element.id = 'open-modal';
    }

}

function selectImage() {
    let content = document.getElementById('form-container');
    content.innerHTML = `<span class="form-content">
                            <img id="image-preview" src="" alt="">
                            <h3>Set Profile Photo</h3>
                            <h5>Please upload a picture file:</h5>
                            <form action="http://127.0.0.1:5000/users/upload" method='post' id="photo-form" name="photo" enctype="multipart/form-data">
                            <p><input class="input-text" type="file" onchange="previewImage()" id="photo-input" placeholder="Select a file to upload" name="file" required></p>
                            <span>
                                <p><input type="submit" form="photo-form" name="confirm-upload" id="validate-btn" value="Confirm"></p>
                                <p><input type="reset" form="photo-form" name="cancel-upload" id="cancel-btn" value="Cancel"></p>
                            </span>
                            </form>
                        </span>`
    document.getElementById("photo-form").addEventListener("submit", (event) => {
        event.preventDefault();
        uploadFile();
    });
    document.getElementById('cancel-btn').addEventListener('click', close_modal);
    const element = document.getElementById('modal');
    element.id = 'open-modal';
}

function previewImage() {
    const content = document.querySelector("#image-preview");
    const [file] = document.querySelector("input[type=file]").files;
    const blobUrl = URL.createObjectURL(file);
    content.src = blobUrl;
}

// function open_modal() {
//     console.log(edit.length);
//     const exists = document.getElementById('password-input');
//     if (exists) {
//         exists.remove();
//         document.getElementById('pass-text').hidden = false;
//         const edit = document.getElementsByClassName('input-text');
//         const elem = document.getElementById('update-btn');
//         if (edit.length > 0) {
//             elem.disabled = false;
//         }
//         else {
//             elem.disabled = true;
//         }
//     }
//     else {
//         const element = document.getElementById('modal');
//         element.id = 'open-modal';
//     }
// }

function open_prompt() {
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
        let pass = prompt('Please enter your current password to validation:');
        if (pass == null || pass == '') {
            alert('Password input cannot be empty');
        }
        else {
            fetch(`http://127.0.0.1:5000/users/pass/${pass}`, {
                method: 'GET',
                credentials: 'include',
            })
                .then(response => {
                    if (response.status == 200) {
                        return response.json().then(data => {
                            alert(data.message);
                            document.getElementById('pass-text').hidden = true;
                            const elem = document.getElementById('password');
                            const html = `<input class="input-text" type="password" form="update-form" id="password-input" placeholder="new password">`;
                            elem.insertAdjacentHTML('afterbegin', html);
                            document.getElementById('update-btn').disabled = false;
                        });
                    }
                    else {
                        return response.json().then(data => {
                            alert(data.error)
                        });
                    }
                })
        }

    }
}

function showProfileContainer() {
    const html = `<div id="profile-container">
                        <article class="main-profile">
                        <div id="profile-bg">
                            <span>
                                <a href="#" id="profile-photo"></a>
                            </span>
                            <button id="edit-btn">Edit photo</button>
                            <div id="info-content" class="table">
                                <form method="PUT" id="update-form">
                                    <table>
                                        <tr>
                                            <td><span class=""> <strong>Username:</strong></span></td>
                                            <td><span id="username"></span></td>
                                            <td><a type="button" class="username edit " title="Edit"></a></td>
                                        </tr>
                                        <tr>
                                            <td><span class=""> <strong>Email:</strong></span></td>
                                            <td><span id="email"></span></td>
                                            <td><a type="button" class="email edit " title="Edit"></a></td>
                                        </tr>
                                        <tr>
                                            <td><span class=""> <strong>First Name:</strong></span></td>
                                            <td><span id="first_name"></span></td>
                                            <td><a type="button" class="first_name edit " title="Edit"></a></td>
                                        </tr>
                                        <tr>
                                            <td><span class=""> <strong>Last Name:</strong></span></td>
                                            <td><span id="last_name"></span></td>
                                            <td><a type="button" class="last_name edit" title="Edit"></a></td>
                                        </tr>
                                        <tr>
                                            <td><span class=""> <strong>Password:</strong></span></td>
                                            <td><span id="password"></span></td>
                                            <td><a type="button" class="password-reset" id='pass-btn' title="Edit"></a></td>
                                        </tr>
                                    </table>
                                </form>
                            </div>
                            <div class="container-btn">
                                <input type="submit" form='update-form' id="update-btn" value="Update" disabled></input>
                                <button id="logout-btn"><strong>Logout</strong></button>
                            </div>
                        </div>
                    </article>
                </div>`
    document.querySelector('.app').innerHTML = html;
}

function close_modal() {
    element = document.getElementById('open-modal');
    element.id = 'modal';
}

// window.addEventListener('load', () => {
//     getProfile();
// });

document.getElementById('account').addEventListener('click', () => {
    showProfileContainer();
    getProfile();
    document.getElementById('edit-btn').addEventListener('click', selectImage)
    document.getElementById("logout-btn").addEventListener("click", logOut);
    document.getElementById("pass-btn").addEventListener("click", open_modal);
    // document.getElementById("pass-btn").addEventListener("click", open_prompt);
    document.getElementById("update-form").addEventListener("submit", (event) => {
        event.preventDefault();
        update();
    });
    const edit_btn = document.getElementsByClassName("edit");
    let array = Array.from(edit_btn);
    array.forEach(element => {
        element.addEventListener("click", edit);
    });
})


// TODO: Avoid attempts to create a duplicated user at sign up form
