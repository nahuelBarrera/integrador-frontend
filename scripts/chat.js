function sendMessage(){
    const chat = document.getElementById('msg-list');
    const msg = document.getElementById('message-input').value;
    // const today = new Date();
    // const time = today.getHours() + ":" + today.getMinutes();
    // const html = 
    //             `<li class="msg-bubble">
    //                 <span>
    //                     <h4 class="user"><strong>You</strong></h4>
    //                     <span>
    //                         <a type="button" class="edit-msg" id=edit-${} title="Edit"></a>
    //                         <a type="button" class="delete-msg" id= title="Delete"></a>
    //                     </span> 
    //                 </span>
    //                 <p class="content">${msg}</p>
    //                 <p class="time">${time}</p>
    //             </li>`;
    // chat.insertAdjacentHTML('afterbegin', html);
    // document.getElementById('edit-msg').addEventListener('click', editMessage(elem));
    let data = {
        content: msg,
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
                const html = 
                            `<li class="msg-bubble" id="bubble-${data.message_id}">
                                <span>
                                    <h4 class="user"><strong>${data.username}</strong></h4>
                                    <span>
                                        <a type="button" class="edit-msg" id=edit-${data.message_id} title="Edit"></a>
                                        <a type="button" class="delete-msg" id=delete-${data.message_id} title="Delete"></a>
                                    </span> 
                                </span>
                                <p class="content">${data.content}</p>
                                <span>
                                    <p class="time">${data.creation_date.substring(17, 22)}</p>
                                </span>
                            </li>`;
                chat.insertAdjacentHTML('afterbegin', html);
                document.getElementById(`edit-${data.message_id}`).addEventListener('click', editMessage(elem));
                // document.getElementById(`delete-${data.message_id}`).addEventListener('click', deleteMessage(elem));
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
                data.forEach(msg => {
                    if (msg.owner) {
                        options_html = `<span>
                                            <a type="button" class="edit-msg" id=edit-${msg.message_id} title="Edit"></a>
                                            <a type="button" class="delete-msg" id=delete-${msg.message_id} title="Delete"></a>
                                        </span>`;
                        bubble_id = `id="bubble-${id}`;
                    }
                    else {
                        options_html = '';
                        bubble_id = '';

                    }
                    const html = `<li class="msg-bubble" ${bubble_id}>
                                    <span>
                                        <h4 class="user"><strong>${msg.username}</strong></h4>
                                        ${options_html}
                                    </span>
                                    <p class="content">${msg.content}</p>
                                    <span>
                                        ${msg.edited ? "<p>(Edited)</p>" : ''}
                                        <p class="time">${msg.creation_date.substring(17, 22)}</p>
                                    </span>
                                </li>`;
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

function updateMessage(elem){
    const msg = document.getElementById('message-input').value;
    const id = elem.id.substring(4);
    const data = {
        content: msg
    };
    fetch(`http://127.0.0.1:5000/messages/${id}`, {
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include'
    }).then(response => {
        if (response.status === 200) {
            return response.json().then(data => {
                elem.querySelector('.content').innerText = msg;
                elem.querySelector('.time').insertAdjacentHTML('beforebegin', '<p>(Edited)</p>');
                document.getElementById('cancel-update').remove();
                document.getElementById('update').id = 'send';
            });
        }
        else{
            return response.json().then(data => {
            alert(data.error);
            });
        }
    });
}

function editMessage(elem) {
    const input = document.getElementById('message-input');
    const target_id = elem.target.id;
    const parent = document.getElementById(`bubble-${target_id}`);
    const content = parent.querySelector('.content')
    input.value = content.innerText;
    const send_btn = document.getElementById('send');
    send_btn.id = 'update';
    const html = `
        <input type="reset" id="cancel-update" name="cancel" value="">
                `
    input.insertAdjacentHTML('afterend', html);
    send_btn.addEventListener('click', () => {
        updateMessage(parent);
    });
    document.getElementById('cancel-update').addEventListener('click', () => {
        input.value = '';
        send_btn.id = 'send';
        document.getElementById('cancel-update').remove();
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
