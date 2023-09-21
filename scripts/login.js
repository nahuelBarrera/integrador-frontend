function logIn() {
    const data = {
        username: document.getElementById("username-log").value,
        password: document.getElementById("password-log").value,
    };
    fetch("http://127.0.0.1:5000/users/login", {
        method: 'POST',
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
        })
        .catch(error => {
            alert('An error happened');
        });
}

function signUp() {
    const data = {
        username: document.getElementById("username-sign").value,
        password: document.getElementById("password-sign").value,
        email: document.getElementById("email").value,
    };
    console.log(data)
    fetch("http://127.0.0.1:5000/users", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include'
    })
        .then(response => {
            if (response.status === 200) {
                return response.json().then(data => {
                    alert('You have successfully signed up');
                    window.location.href = "profile.html";
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

function open_modal() {
    element = document.getElementsByClassName('modal')[0]
    element.classList.add('open-modal');
}

function close_modal() {
  element = document.getElementsByClassName('modal')[0]
    element.classList.remove('open-modal');
}

document.getElementById("login-form").addEventListener("submit", (event) => {
    event.preventDefault();
    logIn();
});

document.getElementById("signin-form").addEventListener("submit", (event) => {
    event.preventDefault();
    signUp();
});

document.getElementById('cancel-btn').addEventListener('click', close_modal);