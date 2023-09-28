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
                                            <a type="button" class="edit-msg" id=edit-msg-${msg.message_id} title="Edit"></a>
                                            <a type="button" class="delete-msg" id=delete-msg-${msg.message_id} title="Delete"></a>
                                            </span>
                                        </span>
                                        <p class="content">${msg.content}</p>
                                        <span>
                                            ${msg.edited ? "<p>(Edited)</p>" : ''}
                                            <p class="time">${msg.creation_date.substring(17, 22)}</p>
                                        </span>
                                    </li>`;
                        chat.insertAdjacentHTML('afterbegin', html);
                        document.getElementById(`edit-msg-${msg.message_id}`).addEventListener('click', (e) => {
                            const id = e.target.id.substring(9);
                            editMessage(id);
                        });
                        document.getElementById(`delete-msg-${msg.message_id}`).addEventListener('click', (e) => {
                            const id = e.target.id.substring(11);
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

function createServer() {
    const server = {
        name: document.getElementById('server-name').value,
        description: document.getElementById('server-description').value
    };
    fetch ('http://127.0.0.1:5000/servers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(server),
        credentials: 'include'
    }).then(response => {
        if (response.status === 201) {
            return response.json().then(data => {
                fetch(`http://127.0.0.1:5000/servers/${datq.server_id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include'
                })
                .then(resp => {
                    if(resp.status === 200) {
                        return resp.json().then(element => {
                            html = `<li id="server-${element.server_id}">
                                    <span class="option-btn-container server-list-buttons">
                                        <button class="channels-server" id="channels-server-${element.server_id}">${element.name}</button>
                                        <button class="edit-server" id="edit-server-${element.server_id}"></button>
                                        <button class="delete-server" id="delete-server-${element.server_id}"></button>
                                    </span>
                                </li>`;
                            server_list.insertAdjacentHTML('beforeend', html);
                            server_list.querySelector(`#delete-server-${element.server_id}`).addEventListener('click', (e) => {
                                const id = e.target.id.substring(14);
                                deleteServer(id);
                            });
                            server_list.querySelector(`#edit-server-${element.server_id}`).addEventListener('click', (e) => {
                                const id = e.target.id.substring(12);
                                openServerEditForm(id);
                            });
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
    });
}

function updateServer(id) {
    const data = {
        name: document.getElementById('server-name').value,
        description: document.getElementById('server-description').value
    };
    fetch (`http://127.0.0.1:5000/servers/${id}`, {
        method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            credentials: 'include'
    }).then(response => {
        if (response.status === 200) {
            return response.json().then(() => {
                if(data.name) {
                    document.getElementById(`channels-server-${id}`).innerHTML = data.name;
                }
            });
        }
        else {
            return response.json().then(data => {
            alert(data.error);
            });
        }
    });
}

function showInfoServer(id) {
    fetch (`http://127.0.0.1:5000/servers/${id}`, {
        method: 'GET',
        credentials: 'include'
    }).then(response => {
        if (response.status === 200) {
            return response.json().then(data => {
                let content = document.getElementById('form-container');
                content.innerHTML = `<span class="form-content">
                                        <h3>Server info</h3>
                                        <h5>Name: ${data.name}</h5>
                                        <h5>Owner: ${data.owner}</h5>
                                        <h5>Members: ${data.members}</h5>
                                        <h5>Created: ${data.creation_date}</h5>
                                    </span>`
                const element = document.getElementById('modal');
                element.id = 'open-modal';
            });
        }
        else {
            return response.json().then(data => {
            alert(data.error);
            });
        }
    });
}

function joinServer(id) {
    const data = {
        server_id: id
    };
    fetch (`http://127.0.0.1:5000/servers/joins`, {
        method: 'POST',
        credentials: 'include'
    }).then(response => {
        if (response.status === 201) {
            return response.json().then(data => {
                const server = document.getElementById(`server-${id}`);
                const btn = server.querySelector(`#join-server-${id}`);
                btn.classList.remove('join-server');
                btn.classList.add('left-server');
                btn.id = `left-server-${id}`;
                btn.addEventListener('click', (e) => {
                    const id = e.target.id.substring(12);
                    leftServer(id);
                });
                //TODO: IN THE BACKEND ADD THE USER ID FROM SESSION TO LINK WITH THE SERVER ID
            });
        }
        else {
            return response.json().then(data => {
            alert(data.error);
            });
        }
    });
}

function leftServer(id) {
    fetch (`http://127.0.0.1:5000/servers/joins${id}`, {
        method: 'DELETE',
        credentials: 'include'
    }).then(response => {
        if (response.status === 204) {
            return response.json().then(data => {
                let btn = document.getElementById('user-servers')
                const elem = document.getElementById(`server-${id}`)
                if(btn.disabled) {
                    elem.remove();
                }
                else {
                    btn = elem.querySelector(`#left-server-${id}`);
                    btn.classList.remove('left-server');
                    btn.classList.add('join-server');
                    btn.id = `join-server-${id}`;
                    btn.addEventListener('click', (e) => {
                        const id = e.target.id.substring(12);
                        joinServer(id);
                    });
                }
                //TODO: IN THE BACKEND ADD THE USER ID FROM SESSION TO LINK WITH THE SERVER ID
            });
        }
        else {
            return response.json().then(data => {
            alert(data.error);
            });
        }
    });
}

function deleteServer(id) {
    fetch (`http://127.0.0.1:5000/servers/${id}`, {
        method: 'DELETE',
        credentials: 'include'
    }).then(response => {
        if (response.status === 204) {
            return response.json().then(data => {
                document.getElementById(`server-${id}`).remove();
                //TODO: IN THE BACKEND ADD THE USER ID FROM SESSION TO LINK WITH THE SERVER ID
            });
        }
        else {
            return response.json().then(data => {
            alert(data.error);
            });
        }
    });
}

function getAllServers() {
    fetch (`http://127.0.0.1:5000/servers`, {
        method: 'GET',
        credentials: 'include'
    }).then(response => {
        showAllServersColumn();
        document.getElementById('all-servers').disabled = true;
        if (response.status === 200) {
            return response.json().then(data => {
                const server_list = document.getElementById('server-list');
                server_list.innerHTML = ''
                let html = ''
                data.forEach(element => {
                    if (element.owner) {
                        html = `<li id="server-${element.server_id}">
                                    <span class="option-btn-container server-list-buttons">
                                        <button class="info-server" id="info-server-${element.server_id}">${element.name}</button>
                                        <button class="edit-server" id="edit-server-${element.server_id}"></button>
                                        <button class="delete-server" id="delete-server-${element.server_id}"></button>
                                    </span>
                                </li>`;
                        server_list.insertAdjacentHTML('beforeend', html);
                        server_list.querySelector(`#delete-server-${element.server_id}`).addEventListener('click', (e) => {
                            const id = e.target.id.substring(14);
                            deleteServer(id);
                        });
                        server_list.querySelector(`#edit-server-${element.server_id}`).addEventListener('click', (e) => {
                            const id = e.target.id.substring(12);
                            updateServer(id);
                        });
                    }
                    else {
                        html = `<li id="server-${element.server_id}">
                                    <span class="option-btn-container server-list-buttons">
                                        <button class="info-server" id="info-server-${element.server_id}">${element.name}</button>
                                        <button class="join-server" id="join-server-${element.server_id}"></button>
                                    </span>
                                </li>`;
                        server_list.insertAdjacentHTML('beforeend', html);
                        server_list.querySelector(`#join-server-${element.server_id}`).addEventListener('click', (e) => {
                            const id = e.target.id.substring(12);
                            joinServer(id);
                        });
                    }
                    server_list.querySelector(`#info-server-${element.server_id}`).addEventListener('click', (e) => {
                        const id = e.target.id.substring(14);
                        showInfoServer(id);
                    });
                });
            });
        }
        else {
            return response.json().then(data => {
            alert(data.error);
            });
        }
    });
}

function getMyServers() {
    fetch (`http://127.0.0.1:5000/servers/user`, {
        method: 'GET',
        credentials: 'include'
    }).then(response => {
        if (response.status === 200) {
            showUserServersColumn();
            //DISABLES THIS BUTTON TO AVOID OVERWRITING THE ALREADY FETCHED USER SERVERS LIST
            document.getElementById('user-servers').disabled = true;
            return response.json().then(data => {
                let server_list = document.getElementById('server-menu');
                let html = `<ul id="server-list-${server_id}"></ul>`;
                server_list.insertAdjacentHTML('beforeend', html);
                server_list = document.getElementById('server-list');
                data.forEach(element => {
                    if (element.owner) {
                        html = `<li id="server-${element.server_id}">
                                    <span class="option-btn-container server-list-buttons">
                                        <button class="channels-server" id="channels-server-${element.server_id}">${element.name}</button>
                                        <button class="edit-server" id="edit-server-${element.server_id}"></button>
                                        <button class="delete-server" id="delete-server-${element.server_id}"></button>
                                    </span>
                                </li>`;
                        server_list.insertAdjacentHTML('beforeend', html);
                        server_list.querySelector(`#delete-server-${element.server_id}`).addEventListener('click', (e) => {
                            const id = e.target.id.substring(14);
                            deleteServer(id);
                        });
                        server_list.querySelector(`#edit-server-${element.server_id}`).addEventListener('click', (e) => {
                            const id = e.target.id.substring(12);
                            updateServer(id);
                        });
                    }
                    else {
                        html = `<li id="server-${element.server_id}">
                                    <span class="option-btn-container server-list-buttons">
                                        <button class="channels-server" id="channels-server-${element.server_id}">${element.name}</button>
                                        <button class="left-server" id="left-server-${element.server_id}"></button>
                                    </span>
                                </li>`;
                        server_list.insertAdjacentHTML('beforeend', html);
                        server_list.querySelector(`#left-server-${element.server_id}`).addEventListener('click', (e) => {
                            const id = e.target.id.substring(12);
                            leftServer(id);
                        });
                    }
                    server_list.querySelector(`#channels-server-${element.server_id}`).addEventListener('click', (e) => {
                        const id = e.target.id.substring(16);
                        const buttons = document.getElementsByClassName('channels-server');
                        buttons.forEach(btn => {    //ENABLE ALL DISABLED SERVER BUTTONS TO SHOW THEIR CHANNELS
                            btn.disabled = false;                         
                        });
                        getChannels(id);
                    });
                });
            });
        }
        else {
            return response.json().then(data => {
                alert(data.error);
                const server_list = document.getElementById('server-menu');
                const html = '<p>Please create a new server or join one.</p>';
                server_list.insertAdjacentHTML('beforeend', html);
            });
        }
    });
}

function filterServers() {
    const html = '<input type="text" id="server-name-search-input" placeholder="Type a server name..">';
    document.getElementById('server-list').insertAdjacentHTML('beforebegin', html);
    //TODO: SET THE FILTER FUNCTION
    let typingTimer;
    //on keyup, start the countdown
    myInput.addEventListener('keyup', () => {
        clearTimeout(typingTimer);
        if (myInput.value) {
            typingTimer = setTimeout(doneTyping, doneTypingInterval);
        }
    });
}

function createChannel(id) {
    data = {
        server_id: document.getElementById('channel-name').value,
        name: document.getElementById('channel-name').value,
        description: document.getElementById('channel-description').value,
    };
    fetch ('http://127.0.0.1:5000/channels', {
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
                fetch(`http://127.0.0.1:5000/servers/${datq.channel_id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include'
                })
                .then(resp => {
                    if(resp.status === 200) {
                        return resp.json().then(element => {
                            const channel_list = document.getElementById('channel-list');
                            let html;
                            if(!channel_list){
                                html = '<ul id="channel-list"></ul>';
                                document.getElementById('channel-menu').insertAdjacentHTML('beforeend',html);
                            }
                            html = `<li id="channel-${element.channel_id}">
                                            <span class="option-btn-container channel-list-buttons">
                                                <button class="chat-channel" id="chat-channel-${element.channel_id}">${element.name}</button>
                                                <button class="edit-channel" id="edit-channel-${element.channel_id}"></button>
                                                <button class="delete-channel" id="delete-channel-${element.channel_id}"></button>
                                            </span>
                                        </li>`;
                            channel_list.insertAdjacentHTML('beforeend', html);
                            channel_list.querySelector(`#delete-channel-${element.channel_id}`).addEventListener('click', (e) => {
                                const id = e.target.id.substring(14);
                                deleteChannel(id);
                            });
                            channel_list.querySelector(`#edit-channel-${element.channel_id}`).addEventListener('click', (e) => {
                                const id = e.target.id.substring(12);
                                openChannelEditForm(id);
                            });
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
    });
}

function getChannels(server_id) {
    fetch (`http://127.0.0.1:5000/channels/server/${id}`, {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => {
        showChannelsColumn();
        //DISABLE THE CURRENT SERVER BUTTON TO AVOID OVERWRITING THEIR CHANNELS LIST
        document.getElementById(`channels-server-${server_id}`).disabled = true;
        if (response.status === 200) {
            const channel_list = document.getElementById('channel-menu');
            return response.json().then(data => {
                let html = `<ul id="channel-list-${server_id}"></ul>`;
                channel_list.insertAdjacentHTML('beforeend', html);
                data.forEach(element => {
                    if (element.owner) {
                        html = `<li id="channel-${element.channel_id}">
                                    <span class="option-btn-container channel-list-buttons">
                                        <button class="chat-channel" id="chat-channel-${element.channel_id}">${element.name}</button>
                                        <button class="edit-channel" id="edit-channel-${element.channel_id}"></button>
                                        <button class="delete-channel" id="delete-channel-${element.channel_id}"></button>
                                    </span>
                                </li>`;
                        channel_list.insertAdjacentHTML('beforeend', html);
                        channel_list.querySelector(`#delete-channel-${element.channel_id}`).addEventListener('click', (e) => {
                            const id = e.target.id.substring(15);
                            deleteChannel(id);
                        });
                        channel_list.querySelector(`#edit-channel-${element.channel_id}`).addEventListener('click', (e) => {
                            const id = e.target.id.substring(13);
                            openChannelEditForm(id);
                        });
                    }
                    else {
                        html = `<li id="server-${element.channel_id}">
                                    <span class="option-btn-container channel-list-buttons">
                                    <button class="chat-channel" id="chat-channel-${element.channel_id}">${element.name}</button>
                                    </span>
                                </li>`;
                        channel_list.insertAdjacentHTML('beforeend', html);
                    }
                    channel_list.querySelector(`#chat-channel-${element.channel_id}`).addEventListener('click', (e) => {
                        const id = e.target.id.substring(13);
                        getChat(id);
                    });
                });
            });
        }
        else {
            return response.json().then(data => {
                alert(data.error);
                const html = '<p>Please create a channel</p>';
                channel_list.insertAdjacentHTML('beforeend', html);
            });
        }
    });
}

function updateChannel(id) {
    const data = {
        name: document.getElementById('channel-name').value,
        description: document.getElementById('channel-description').value
    };
    fetch (`http://127.0.0.1:5000/channels/${id}`, {
        method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            credentials: 'include'
    }).then(response => {
        if (response.status === 200) {
            return response.json().then(() => {
                if(data.name){
                    document.getElementById(`chat-channel-${id}`).innerHTML = data.name;
                }
            });
        }
        else {
            return response.json().then(data => {
            alert(data.error);
            });
        }
    });
}

function deleteChannel(id) {
    fetch (`http://127.0.0.1:5000/channels/${id}`, {
        method: 'DELETE',
        credentials: 'include'
    }).then(response => {
        if (response.status === 204) {
            return response.json().then(data => {
                document.getElementById(`channel-${id}`).remove();
                //TODO: REMOVE ELEMENTS IN THE SERVER'S CHANNEL LIST
            });
        }
        else {
            return response.json().then(data => {
            alert(data.error);
            });
        }
    });
}

function showInfoChanel(id) {
    fetch (`http://127.0.0.1:5000/channels/${id}`, {
        method: 'GET',
        credentials: 'include'
    }).then(response => {
        if (response.status === 200) {
            return response.json().then(data => {
                let content = document.getElementById('form-container');
                content.innerHTML = `<span class="form-content">
                                        <h3>Channel info</h3>
                                        <h5>Name: ${data.name}</h5>
                                        <h5>Created: ${data.creation_date}</h5>
                                    </span>`
                const element = document.getElementById('modal');
                element.id = 'open-modal';
            });
        }
        else {
            return response.json().then(data => {
            alert(data.error);
            });
        }
    });
}

function openServerEditForm(id) {
    fetch(`http://127.0.0.1:5000/servers/${id}`, {
            method: 'GET',
            credentials: 'include'
    })
    .then(response => {
        if (response.status === 200) {
            return response.json().then(data => {
                let content = document.getElementById('form-container');
                content.innerHTML = `<span class="form-content">
                                        <h3>Edit Server Data</h3>
                                        <h5>Please insert the new data:</h5>
                                        <p><input class="input-server-name" type="text" id="server-name" placeholder="Server name" required></p>
                                        <p><textarea name="input-server-description" id="server-description" cols="30" rows="10"></textarea></p>
                                        <span>
                                            <p><input type="button" id="create-btn" value="Update"></p>
                                            <p><input type="reset" id="cancel-btn" value="Cancel"></p>
                                        </span>
                                    </span>`
                content.querySelector('#server-name').value = data.name;
                content.querySelector('#server-description').value = data.description;
                document.getElementById("create-btn").addEventListener("click", (event) => {
                    // event.preventDefault();
                    updateServer(id);
                });
                document.getElementById('cancel-btn').addEventListener('click', close_modal);
                const element = document.getElementById('modal');
                element.id = 'open-modal';
            });
        }
        else {
            return response.json().then(data => {
                alert(data.error);
            });
        }
    });
    
}

function openServerCreateForm() {
    let content = document.getElementById('form-container');
    content.innerHTML = `<span class="form-content">
                            <h3>New Server</h3>
                            <h5>Please insert the new server data:</h5>
                            <p><input class="input-server-name" type="text" id="server-name" placeholder="Server name" required></p>
                            <p><textarea name="input-server-description" id="server-description" cols="30" rows="10"></textarea></p>
                            <span>
                                <p><input type="button" id="create-btn" value="Create"></p>
                                <p><input type="reset" id="cancel-btn" value="Cancel"></p>
                            </span>
                        </span>`
    document.getElementById("create-btn").addEventListener("click", (event) => {
        // event.preventDefault();
        createServer();
    });
    document.getElementById('cancel-btn').addEventListener('click', close_modal);
    const element = document.getElementById('modal');
    element.id = 'open-modal';
}

function openChannelCreateForm(server_id) {
    let content = document.getElementById('form-container');
    content.innerHTML = `<span class="form-content">
                            <h3>New Channel</h3>
                            <h5>Please insert the new channel data:</h5>
                            <p><input class="input-name" type="text" id="channel-name" placeholder="Channel name" required></p>
                            <p><textarea name="input-description" id="channel-description" cols="30" rows="10"></textarea></p>
                            <span>
                                <p><input type="button" id="create-btn" value="Create"></p>
                                <p><input type="reset" id="cancel-btn" value="Cancel"></p>
                            </span>
                        </span>`
    document.getElementById("create-btn").addEventListener("click", (event) => {
        // event.preventDefault();

        createChannel(server_id);
    });
    document.getElementById('cancel-btn').addEventListener('click', close_modal);
    const element = document.getElementById('modal');
    element.id = 'open-modal';
}

function openChannelEditForm(id) {
    fetch(`http://127.0.0.1:5000/channels/${id}`, {
            method: 'GET',
            credentials: 'include'
    })
    .then(response => {
        if (response.status === 200) {
            return response.json().then(data => {
                content.innerHTML = `<span class="form-content">
                                        <h3>Edit Channel Data</h3>
                                        <h5>Please insert the new data:</h5>
                                        <p><input class="input-name" type="text" id="channel-name" placeholder="Channel name" required></p>
                                        <p><textarea name="input-description" id="channel-description" cols="30" rows="10"></textarea></p>
                                        <span>
                                            <p><input type="button" id="create-btn" value="Update"></p>
                                            <p><input type="reset" id="cancel-btn" value="Cancel"></p>
                                        </span>
                                    </span>`
                content.querySelector('#server-name').value = data.name;
                content.querySelector('#server-description').value = data.description;
                document.getElementById("create-btn").addEventListener("click", (event) => {
                    // event.preventDefault();
                    updateChannel(id);
                });
                document.getElementById('cancel-btn').addEventListener('click', close_modal);
                const element = document.getElementById('modal');
                element.id = 'open-modal';
            });
        }
        else {
            return response.json().then(data => {
                alert(data.error);
            });
        }
    });
}

function close_modal() {
    element = document.getElementById('open-modal');
    element.id = 'modal';
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

function showAllServersColumn() {
    const html = `<nav class="navbar server-nav">
                    <div class="menu" id="server-menu">
                        <span class="option-btn-container">
                            <button type="button" class="colapse-btn" onclick="animate_servers()" title="Colapse"></button>
                            <span>
                                <button type="button" class="option-btn-icon" id="search-server" title="Search"></button>
                            </span>
                        </span>
                    </div>
                </nav>`
    const content = document.querySelector('.menu-container');
    content.innerHTML = html;
    document.getElementById('search-server').addEventListener('click', (e) => {
        filterServers();
    })
}

function showUserServersColumn() {
    const html = `<nav class="navbar server-nav">
                    <div class="menu" id="server-menu">
                        <span class="option-btn-container">
                            <button type="button" class="colapse-btn" onclick="animate_servers()" title="Colapse"></button>
                            <span>
                                <button type="button" class="option-btn-icon" id="search-server" title="Search"></button>
                            </span>
                            <span>
                                <button type="button" class="option-btn-icon" id="new-server" onclick="openServerForm()" title="New"></button>
                            </span>
                        </span>
                    </div>
                </nav>`
    const content = document.querySelector('.menu-container');
    content.innerHTML = html;
    document.getElementById('search-server').addEventListener('click', (e) => {
        filterServers();
    })
}

function showChannelsColumn(server_id) {
    const html = `<nav class="navbar channel-nav">
                    <div class="menu" id="channel-menu">
                        <span class="option-btn-container">
                            <button type="button" class="colapse-btn" onclick="animate_channels()" title="Colapse"></button>
                            <span>
                                <button type="button" class="option-btn-icon" id="new-channel-${server_id}" title="New"></button>
                            </span>
                        </span>
                    </div>
                </nav>`
    const content = document.getElementsByClassName('server-nav')[0];
    content.insertAdjacentHTML('afterend', html);
    document.getElementById(`new-channel-${server_id}`).addEventListener('click', (e) => {
        const server_id = e.target.id.substring(12);
        createChannel(server_id);
    });
}

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

    document.getElementById('user-servers').addEventListener('click', getMyServers);
    document.getElementById('all-servers').addEventListener('click', getAllServers);
    // document.getElementById('user-servers').addEventListener('click', (e) => {
    //     getMyServers().then(() => {
    //         document.getElementsByClassName('colapse-btn')[0].click();
    //         document.getElementById('all-servers').disabled = false;
    //     });
        
    // });
    // document.getElementById('all-servers').addEventListener('click', (e) => {
    //     getAllServers().then(() => {
    //         document.getElementsByClassName('colapse-btn')[0].click();
    //         document.getElementById('user-servers').disabled = false;
    //     });
        
    // });
    // document.getElementById('user-servers').click();
    // getChat();
    // document.getElementById('send').addEventListener('click', sendMessage);
    // document.getElementById('message-input').addEventListener('keypress', (e) => {
    //     if (e.key == 'Enter') {
    //         e.preventDefault();
    //         document.getElementById("send").click();
    //         document.getElementById('message-input').value = ''
    //     }
    // });
});
