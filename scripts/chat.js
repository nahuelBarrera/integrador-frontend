function sendMessage(){
    const chat = document.getElementById('msg-list');
    const msg = document.getElementById('message-input').value;
    const today = new Date();
    const time = today.getHours() + ":" + today.getMinutes();
    const html = 
                `<li class="msg-bubble">
                    <h4 class="user"><strong>You</strong></h4>
                    <p class="content">${msg}</p>
                    <p class="time">${time}</p>
                </li>`;
    chat.insertAdjacentHTML('afterbegin', html);
    let data = {
        content: msg,
        //user_id and channel_id are both them added on the backend by fetching them from sessions
        //creation_date is autogerated on database by CURRRENT_TIMESTAMP() 
    }
    // fetch("http://127.0.0.1:5000/messages", {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(data),
    //     credentials: 'include'
    // })
    // .then(response => {
    //     if (response.status === 201) {
    //         return response.json().then(data => {
    //             alert(data.message)
    //         });
    //     } else {
    //         return response.json().then(data => {
    //             alert(data.error);
    //         });
    //     }
    // });
    // .catch(error => {
    //     alert("An error happened");
    // });
}

function getChat() {
    fetch("http://127.0.0.1:5000/messages", {
        method: 'GET',
        credentials: 'include'
        //CREATE A BODY JSON REQUEST WITH CHANNEL_ID
    })
    .then(response => {
        if (response.status === 200) {
            return response.json().then(data => {
                console.log(data)
                const chat = document.getElementById('msg-list');
                data.forEach(element => {
                    const html = `
                        <li class="msg-bubble">
                            <h4 class="user"><strong>${element.username}</strong></h4>
                            <p class="content">${element.content}</p>
                            <p class="time">${element.creation_date.substring(17, 22)}</p>
                        </li>`
                    chat.insertAdjacentHTML('afterbegin', html);
                });
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
    getChat();
});

document.getElementById('send').addEventListener('click', sendMessage);
document.getElementById('message-input').addEventListener('keypress', (e) => {
    if (e.key == 'Enter') {
        e.preventDefault();
        document.getElementById("send").click();
        document.getElementById('message-input').value = ''
    }
});