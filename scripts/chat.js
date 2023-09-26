function sendMessage(){
    const chat = document.getElementById('msg-list');
    const input = document.getElementById('message-input');
    let data = {
        content: input.value,
        //user_id and channel_id are both them added on the backend by fetching them from sessions
        //creation_date is autogerated on database by CURRRENT_TIMESTAMP() 
    }
    fetch("http://127.0.0.1:5000/messages", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include'
    })
    .then(response => {
        if (response.status === 201) {
            return response.json().then(data => {
                console.log(data)
                fetch(`http://127.0.0.1:5000/messages/${data.message_id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include'
                })
                .then(resp => {
                    if(resp.status === 200) {
                        return resp.json().then(dat => {
                            const html = 
                                        `<li class="msg-bubble owner-bubble" id="bubble-${dat.message_id}">
                                            <span>
                                                <h4 class="user"><strong>${dat.username}</strong></h4>
                                                <span>
                                                    <a type="button" class="edit-msg" id="edit-${dat.message_id}" title="Edit"></a>
                                                    <a type="button" class="delete-msg" id="delete-${dat.message_id}" title="Delete"></a>
                                                </span> 
                                            </span>
                                            <p class="content">${dat.content}</p>
                                            <span>
                                                <p class="time">${dat.creation_date.substring(17, 22)}</p>
                                            </span>
                                        </li>`;
                            chat.insertAdjacentHTML('afterbegin', html);
                            document.getElementById(`edit-${data.message_id}`).addEventListener('click', (e) => {
                                const id = e.target.id.substring(5);
                                editMessage(id);
                            });
                            document.getElementById(`delete-${data.message_id}`).addEventListener('click', (e) => {
                                const id = e.target.id.substring(7);
                                deleteMessage(id);
                            });
                            input.value = '';
                        });
                    }
                    else {
                        return response.json().then(data => {
                            alert(data.error);
                        });

                    }
                });

            });  
        }
        else {
            return response.json().then(data => {
                alert(data.error);
        });
        }
    })
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
                console.log(data);
                const chat = document.getElementById('msg-list');
                let options_html = '';
                let bubble_id = '';
                let cls = '';
                data.forEach(msg => {
                    if (msg.owner) {
                        const html = `<li class="msg-bubble owner-bubble" id="bubble-${msg.message_id}">
                                        <span>
                                            <h4 class="user"><strong>${msg.username}</strong></h4>
                                            <span>
                                            <a type="button" class="edit-msg" id=edit-${msg.message_id} title="Edit"></a>
                                            <a type="button" class="delete-msg" id=delete-${msg.message_id} title="Delete"></a>
                                            </span>
                                        </span>
                                        <p class="content">${msg.content}</p>
                                        <span>
                                            ${msg.edited ? "<p>(Edited)</p>" : ''}
                                            <p class="time">${msg.creation_date.substring(17, 22)}</p>
                                        </span>
                                    </li>`;
                        chat.insertAdjacentHTML('afterbegin', html);
                        document.getElementById(`edit-${msg.message_id}`).addEventListener('click', (e) => {
                            const id = e.target.id.substring(5);
                            editMessage(id);
                        });
                        document.getElementById(`delete-${msg.message_id}`).addEventListener('click', (e) => {
                            const id = e.target.id.substring(7);
                            deleteMessage(id);
                        });
                    }
                    else {
                        const html = `<li class="msg-bubble">
                                        <span>
                                            <h4 class="user"><strong>${msg.username}</strong></h4>
                                        </span>
                                        <p class="content">${msg.content}</p>
                                        <span>
                                            ${msg.edited ? "<p>(Edited)</p>" : ''}
                                            <p class="time">${msg.creation_date.substring(17, 22)}</p>
                                        </span>
                                    </li>`;
                        chat.insertAdjacentHTML('afterbegin', html);
                    }
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

function updateMessage(){
    const input = document.getElementById('message-input');
    const id = document.getElementById('cancel-update').classList[0];
    const bubble = document.getElementById(`bubble-${id}`);
    const data = {
        content: input.value
    };
    fetch(`http://127.0.0.1:5000/messages/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include'
    }).then(response => {
        if (response.status === 200) {
            return response.json().then(data => {
                bubble.querySelector('.content').innerText = input.value;
                bubble.querySelector('.time').insertAdjacentHTML('beforebegin', '<p>(Edited)</p>');
                document.getElementById('cancel-update').remove();
                const send_btn = document.getElementById('update');
                send_btn.id = 'send';
                input.value = '';
                send_btn.removeEventListener('click', updateMessage);
                send_btn.addEventListener('click', sendMessage);
            });
        }
        else {
            return response.json().then(data => {
            alert(data.error);
            });
        }
    });
}

function editMessage(id) {
    const input = document.getElementById('message-input');
    const parent = document.getElementById(`bubble-${id}`);
    const content = parent.querySelector('.content')
    input.value = content.innerText;
    const send_btn = document.getElementById('send');
    send_btn.id = 'update';
    const html = `
        <input type="reset" class="${id}" id="cancel-update" name="cancel" value="">
                `
    input.insertAdjacentHTML('afterend', html);
    send_btn.removeEventListener('click', sendMessage);
    send_btn.addEventListener('click', updateMessage);
    document.getElementById('cancel-update').addEventListener('click', () => {
        input.value = '';
        send_btn.id = 'send';
        document.getElementById('cancel-update').remove();
        send_btn.removeEventListener('click', updateMessage);
        send_btn.addEventListener('click', sendMessage);
    });
}

function deleteMessage(id) {
    fetch(`http://127.0.0.1:5000/messages/${id}`, {
        method: 'DELETE',
        credentials: 'include'
    })
    .then(response => {
        if (response.status === 204) {
            document.getElementById(`bubble-${id}`).remove()
        }
        else {
            return response.json().then(data => {
                alert(data.error);
                });
        }
    });
}

function animate_menu() {
    elem = document.querySelector('.main');
    icon = document.querySelector('.menu-btn');
    if (elem.id == 'open') {
        elem.id = '';
        icon.id = ''; 
    }
    else {
        elem.id = 'open';
        icon.id = 'open-menu-btn';         
    }
};

function animate_servers() {
    elem = document.getElementsByClassName('navbar')[1];
    icon = elem.querySelector('.colapse-btn');
    if (elem.id == 'open') {
        elem.id = '';
        icon.id = ''; 
    }
    else {
        elem.id = 'open';
        icon.id = 'open-colapse-btn';         
    }
};

function animate_channels() {
    elem = document.getElementsByClassName('navbar')[2];
    icon = elem.querySelector('.colapse-btn');
    if (elem.id == 'open') {
        elem.id = '';
        icon.id = ''; 
    }
    else {
        elem.id = 'open';
        icon.id = 'open-colapse-btn';         
    }
};

window.addEventListener('load', () => {
    getChat();
    document.getElementById('send').addEventListener('click', sendMessage);
    // document.getElementById('message-input').addEventListener('keypress', (e) => {
    //     if (e.key == 'Enter') {
    //         e.preventDefault();
    //         document.getElementById("send").click();
    //         document.getElementById('message-input').value = ''
    //     }
    // });
});
