function login() {
    const data = {
        username: document.getElementById("username").value,
        password: document.getElementById("password").value,
    };
    fetch("http://127.0.0.1:5000/auth/login", {
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
                    window.location.href = "profile.html";
                });
            } else {
                return response.json().then(data => {
                    document.getElementById("message").innerHTML = data.message;
                });
            }
        })
        .catch(error => {
            document.getElementById("message").innerHTML = "Ocurrió un error.";
        });
}

document.getElementById("login").addEventListener("submit", function (event) {
    event.preventDefault();
    login();
});