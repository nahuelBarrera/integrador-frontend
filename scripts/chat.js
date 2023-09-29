function sendMessage(id){
    const input = document.getElementById('message-input');
    let data = {
        channel_id: id,
        content: input.value,
        //user_id and channel_id are both them added on the backend by fetching them from sessions
        //creation_date is autogerated on database by CURRRENT_TIMESTAMP()
        // TODO: GET THE CHANNEL ID FROM THE HTML ELEMENTS IN THE CHAT ARTICLE (BIND SEND BUTTON)
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
                            let chat = document.getElementById('msg-list');
                            let html;
                            if(!chat) {
                                html = `<ul class="list" id="msg-list"></ul>`
                                document.getElementById('chat-frame').innerHTML = html;
                                chat = document.getElementById('msg-list');
                            }    
                            html = `<li class="msg-bubble owner-bubble" id="bubble-${dat.message_id}">
                                        <span class="msg-head">
                                            <h4 class="user"><strong>${dat.username}</strong></h4>
                                            <span>
                                                <a type="button" tabindex="0" class="edit-msg" id="edit-${dat.message_id}" title="Edit"></a>
                                                <a type="button" tabindex="0" class="delete-msg" id="delete-${dat.message_id}" title="Delete"></a>
                                            </span> 
                                        </span>
                                        <p class="content">${dat.content}</p>
                                        <span class="sub-info">
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


function getChat(channel_id, server_name, channel_name) {
    fetch(`http://127.0.0.1:5000/messages/channel/${channel_id}`, {
        method: 'GET',
        credentials: 'include'
        //CREATE A BODY JSON REQUEST WITH CHANNEL_ID
    })
    .then(response => {
        showChatContainer(channel_id, server_name, channel_name);
        if (response.status === 200) {
            return response.json().then(data => {
                const chat = document.getElementById('msg-list');
                Array.from(data).forEach(msg => {
                    if (msg.owner) {
                        const html = `<li class="msg-bubble owner-bubble" id="bubble-${msg.message_id}">
                                        <span class="msg-head">
                                            <h4 class="user"><strong>${msg.username}</strong></h4>
                                            <span>
                                            <a type="button" tabindex="0" class="edit-msg" id=edit-msg-${msg.message_id} title="Edit"></a>
                                            <a type="button" tabindex="0" class="delete-msg" id=delete-msg-${msg.message_id} title="Delete"></a>
                                            </span>
                                        </span>
                                        <p class="content">${msg.content}</p>
                                        <span class="sub-info">
                                            ${msg.edited ? "<p class='edited-label'>(Edited)</p>" : ''}
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
                                        <span class="msg-head">
                                            <h4 class="user"><strong>${msg.username}</strong></h4>
                                        </span>
                                        <p class="content">${msg.content}</p>
                                        <span class="sub-info">
                                            ${msg.edited ? "<p>Edited</p>" : ''}
                                            <p class="time">${msg.creation_date.substring(17, 22)}</p>
                                        </span>
                                    </li>`;
                        chat.insertAdjacentHTML('afterbegin', html);
                    }
                });
            });
        } 
        else {
            return response.json().then(data => {
                document.getElementById('chat-frame').innerHTML = `<h4 class="message-info">This chat is empty</h4>`;
            });
        }
    });
    // .catch(error => {
    //     alert("An error happened");
    // });
}

function updateMessage(message_id, channel_id){
    const input = document.getElementById('message-input');
    const bubble = document.getElementById(`bubble-${message_id}`);
    const data = {
        content: input.value
    };
    fetch(`http://127.0.0.1:5000/messages/${message_id}`, {
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
                if(!bubble.querySelector('.edited-label')){
                    bubble.querySelector('.time').insertAdjacentHTML('beforebegin', `<p id='edited-label'>(Edited)</p>`);
                } 
                document.getElementById('cancel-update').remove();
                document.getElementById('update').remove();
                input.value = '';
                const html = `<input type="submit" id="send" name="send" value=""></input>`
                input.insertAdjacentHTML('afterend', html)
                document.getElementById('send').addEventListener('click', (e) => {
                    sendMessage(channel_id);
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

function editMessage(message_id, channel_id) {
    const input = document.getElementById('message-input');
    const parent = document.getElementById(`bubble-${message_id}`);
    const content = parent.querySelector('.content')
    input.value = content.innerText;
    let send_btn = document.getElementById('send');
    send_btn.remove();
    let html = `
        <input type="reset" id="cancel-update" name="cancel" value="">
        <input type="submit" id="update" name="send" value="">
                `
    input.insertAdjacentHTML('afterend', html);
    send_btn = document.getElementById('update');
    send_btn.addEventListener('click', () => {
        updateMessage(message_id,channel_id)
    });
    document.getElementById('cancel-update').addEventListener('click', (e) => {
        e.target.remove();
        input.value = '';
        send_btn.remove();
        html = `<input type="submit" id="send" name="send" value=""></input>`
        input.insertAdjacentHTML('afterend', html)
        document.getElementById('send').addEventListener('click', (e) => {
            sendMessage(channel_id);
        });
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
                let server_list = document.getElementById(`server-list`);
                let html;
                if(!server_list){
                    html = `<ul id="server-list"></ul>`;
                    document.getElementById('server-menu').insertAdjacentHTML('beforeend',html);
                    server_list = document.getElementById('server-list');
                }
                html = `<li id="server-${data.server_id}">
                        <span class="option-btn-container server-list-buttons">
                            <a class="channels-server menu-a" tabindex="0" id="channels-server-${data.server_id}"><span title="${server.name}"></span><p class="p-title" id="server-name-${data.server_id}">${server.name}</p></a>
                            <button class="option-btn-icon small-btn edit-server" id="edit-server-${data.server_id}" title="Edit"></button>
                            <button class="option-btn-icon small-btn delete-server" id="delete-server-${data.server_id}" title="Delete"></button>
                        </span>
                    </li>`;
                server_list.insertAdjacentHTML('beforeend', html);
                server_list.querySelector(`#delete-server-${data.server_id}`).addEventListener('click', (e) => {
                    const id = e.target.id.substring(14);
                    deleteServer(id);
                });
                server_list.querySelector(`#edit-server-${data.server_id}`).addEventListener('click', (e) => {
                    const id = e.target.id.substring(12);
                    openServerEditForm(id);
                });
                close_modal();
            });
        }
        else {
            return response.json().then(data => {
                alert(data.error);
                close_modal();
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
                    document.getElementById(`server-name-${id}`).innerText = data.name;
                }
                close_modal();
            });
        }
        else {
            return response.json().then(data => {
                alert(data.error);
                close_modal();
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
                console.log(data);
                console.log(data.user_id);
                fetch(`http://127.0.0.1:5000/users/${data.user_id}`, {
                    method: 'GET',
                    credentials: 'include'
                })
                .then(response => {
                    if (response.status === 200) {
                        return response.json().then(user => {
                            let content = document.getElementById('form-container');
                            content.innerHTML = `<span class="form-content">
                                                    <h3>Server info</h3>
                                                    <h5>Name:  ${data.name}</h5>
                                                    <h5>Owner:  ${user.first_name ? user.first_name : ''} ${user.last_name ? user.last_name : ''} (${user.username})</h5>
                                                    <h5>Members:  ${data.members}</h5>
                                                    <h5>Created:  ${data.creation_date}</h5>
                                                    <h5>Description:</h5>
                                                    <p>${data.description ? data.description : ''}</p>
                                                </span>`
                            const element = document.getElementById('modal');
                            element.id = 'open-modal';
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

function joinServer(id) {
    const data = {
        server_id: id
    };
    fetch (`http://127.0.0.1:5000/servers/user`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include'
    }).then(response => {
        if (response.status === 201) {
            return response.json().then(data => {
                const server = document.getElementById(`server-${id}`);
                const btn = server.querySelector(`#join-server-${id}`);
                btn.id = `left-server-${id}`;
                btn.classList.replace('join-server', 'left-server');
                btn.addEventListener('click', (e) => {
                    const id = e.target.id.substring(12);
                    leftServer(id);
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

function leftServer(id) {
    fetch (`http://127.0.0.1:5000/servers/user/${id}`, {
        method: 'DELETE',
        credentials: 'include'
    }).then(response => {
        if (response.status === 204) {
            let column = document.querySelector('.user-servers');
            const elem = document.getElementById(`server-${id}`);
            if(column) {
                column = document.querySelector(`#channel-list-${id}`);
                if(column){
                    document.querySelector('.channel-nav').remove();
                }
                elem.remove();
            }
            else {
                console.log(false);
                column = elem.querySelector(`#left-server-${id}`);
                column.id = `join-server-${id}`;
                column.classList.replace('left-server', 'join-server');
                column.addEventListener('click', (e) => {
                    const id = e.target.id.substring(12);
                    joinServer(id);
                });
            }
            //TODO: IN THE BACKEND ADD THE USER ID FROM SESSION TO LINK WITH THE SERVER ID
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
        mode: "cors",
        credentials: 'include'
    }).then(response => {
        if (response.status === 204) {
            const column = document.querySelector(`#channel-list-${id}`);
            if(column) {
                document.querySelector('.channel-nav').remove();
            }
            document.getElementById(`server-${id}`).remove();
            
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
        let server_list = document.querySelector('.list-container');
        if (response.status === 200) {
            return response.json().then(data => {
                let html = `<ul id="server-list"></ul>`;
                server_list.innerHTML = html;
                server_list = document.getElementById('server-list');
                data.forEach(element => {
                    if (element.role_id) {
                        if(element.role_id == 1){
                            html = `<li id="server-${element.server_id}">
                                        <span class="option-btn-container server-list-buttons">
                                            <a class="info-server menu-a" tabindex="0" id="info-server-${element.server_id}"><span title="${element.name}"></span><p class="p-title" id="server-name-${element.server_id}">${element.name}</p></a>
                                            <button class="option-btn-icon small-btn edit-server" id="edit-server-${element.server_id}" title="Edit"></button>
                                            <button class="option-btn-icon small-btn delete-server" id="delete-server-${element.server_id}" title="Delete"></button>
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
                        }
                        else {
                            html = `<li id="server-${element.server_id}">
                                        <span class="option-btn-container server-list-buttons">
                                            <a class="info-server menu-a" tabindex="0" id="info-server-${element.server_id}"><span title="${element.name}"></span><p class="p-title" id="server-name-${element.server_id}">${element.name}</p></a>
                                            <button class="option-btn-icon small-btn left-server" id="left-server-${element.server_id}" title="Left"></button>
                                        </span>
                                    </li>`;
                            server_list.insertAdjacentHTML('beforeend', html);
                            server_list.querySelector(`#left-server-${element.server_id}`).addEventListener('click', (e) => {
                                const id = e.target.id.substring(12);
                                leftServer(id);
                            });
                        }
                        
                    }
                    else {
                        html = `<li id="server-${element.server_id}">
                                    <span class="option-btn-container server-list-buttons">
                                        <a class="info-server menu-a" tabindex="0" id="info-server-${element.server_id}"><span></span><p class="p-title" id="server-name-${element.server_id}">${element.name}</p></a>
                                        <button class="option-btn-icon small-btn join-server" id="join-server-${element.server_id}" title="Join"></button>
                                    </span>
                                </li>`;
                        server_list.insertAdjacentHTML('beforeend', html);
                        server_list.querySelector(`#join-server-${element.server_id}`).addEventListener('click', (e) => {
                            const id = e.target.id.substring(12);
                            joinServer(id);
                        });
                    }
                    server_list.querySelector(`#info-server-${element.server_id}`).addEventListener('click', (e) => {
                        const id = e.target.id.substring(12);
                        showInfoServer(id);
                    });
                });
            });
        }
        else {
            return response.json().then(data => {
                const html = `<h4>There is no any server</h4>
                                <p>Please create or join a server</p>`;
                server_list.innerHTML = html;
            });
        }
    });
}

function getMyServers() {
    fetch (`http://127.0.0.1:5000/servers/user`, {
        method: 'GET',
        credentials: 'include'
    }).then(response => {
        showUserServersColumn();
        if (response.status === 200) {
            //DISABLES THIS BUTTON TO AVOID OVERWRITING THE ALREADY FETCHED USER SERVERS LIST
            // document.getElementById('user-servers').disabled = true;
            return response.json().then(data => {
                let server_list = document.querySelector('.list-container');
                let html = `<ul id="server-list"></ul>`;
                server_list.innerHTML = html;
                server_list = document.getElementById('server-list');
                data.forEach(element => {
                    if (element.owner) {
                        html = `<li id="server-${element.server.server_id}">
                                    <span class="option-btn-container server-list-buttons">
                                        <a class="channels-server menu-a" tabindex="0" id="channels-server-${element.server.server_id}"><span id="icon-server-${element.server.server_id}" title="${element.server.name}"></span><p class="p-title" id="server-name-${element.server.server_id}">${element.server.name}</p></a>
                                        <button class="option-btn-icon small-btn edit-server" id="edit-server-${element.server.server_id}" title="Edit"></button>
                                        <button class="option-btn-icon small-btn delete-server" id="delete-server-${element.server.server_id}" title="Delete"></button>
                                    </span>
                                </li>`;
                        server_list.insertAdjacentHTML('beforeend', html);
                        server_list.querySelector(`#delete-server-${element.server.server_id}`).addEventListener('click', (e) => {
                            const id = e.target.id.substring(14);
                            deleteServer(id);
                        });
                        server_list.querySelector(`#edit-server-${element.server.server_id}`).addEventListener('click', (e) => {
                            const id = e.target.id.substring(12);
                            openServerEditForm(id);
                        });
                    }
                    else {
                        html = `<li id="server-${element.server.server_id}">
                                    <span class="option-btn-container server-list-buttons">
                                        <a class="channels-server menu-a" tabindex="0" id="channels-server-${element.server.server_id}"><span class="icon-server-span" id="icon-server-${element.server.server_id}" title="${element.server.name}"></span><p class="p-title" id="server-name-${element.server.server_id}">${element.server.name}</p></a>
                                        <button class="option-btn-icon small-btn left-server" id="left-server-${element.server.server_id}" title="Left"></button>
                                    </span>
                                </li>`;
                        server_list.insertAdjacentHTML('beforeend', html);
                        server_list.querySelector(`#left-server-${element.server.server_id}`).addEventListener('click', (e) => {
                            const id = e.target.id.substring(12);
                            leftServer(id);
                        });
                    }
                    server_list.querySelector(`#channels-server-${element.server.server_id}`).addEventListener('click', (e) => {
                        console.log(e.target);
                        let id;
                        if(e.target.classList.contains('menu-a')){
                            id = e.target.id.substring(16);
                        }
                        else {
                            id = e.target.id.substring(12);
                        }
                        const buttons = document.getElementsByClassName('channels-server');
                        // Array.from(buttons).forEach(btn => {    //ENABLE ALL DISABLED SERVER BUTTONS TO SHOW THEIR CHANNELS
                        //     btn.disabled = false;                
                        // });
                        const server_name = document.getElementById(`server-name-${id}`).innerText;
                        getChannels(id, server_name);
                        
                    });
                });
            });
        }
        else {
            return response.json().then(data => {
                const server_list = document.querySelector('.list-container');
                const html = `<h4>There is no any server</h4>
                            <p>Please create or join a server</p>`;
                server_list.innerHTML = html;
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

function createChannel(id, server_name) {
    channel = {
        server_id: id,
        name: document.getElementById('channel-name').value,
        description: document.getElementById('channel-description').value,
    };
    fetch ('http://127.0.0.1:5000/channels', {
        method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(channel),
            credentials: 'include'
    })
    .then(response => {
        if (response.status === 201) {
            return response.json().then(data => {
                close_modal();
                getChannels(id, server_name);

            });
        }
        else {
            return response.json().then(data => {
                alert(data.error);
            });
        }
    });
    
}

function getChannels(server_id, server_name) {
    fetch (`http://127.0.0.1:5000/channels/server/${server_id}`, {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => {
        console.log(server_id);
        showChannelsColumn(server_id, server_name);
        //DISABLE THE CURRENT SERVER BUTTON TO AVOID OVERWRITING THEIR CHANNELS LIST
        // document.getElementById(`channels-server-${server_id}`).disabled = true;
        let channel_list = document.getElementsByClassName('list-container')[1];
        if (response.status === 200) {
            return response.json().then(data => {
                let html = `<ul id="channel-list-${server_id}"></ul>`;
                channel_list.innerHTML = html;
                channel_list = channel_list.querySelector(`#channel-list-${server_id}`);
                data.forEach(element => {
                    if (element.owner) {
                        html = `<li id="channel-${element.channel.channel_id}">
                                    <span class="option-btn-container channel-list-buttons">
                                        <a class="chat-channel menu-a" tabindex="0" id="chat-channel-${element.channel.channel_id}"><span class="channel-icon" id="channel-icon-${element.channel.channel_id}" title="${element.channel.name}"></span><p class="p-title" id="channel-name-${element.channel.channel_id}">${element.channel.name}</p></a>
                                        <button class="option-btn-icon small-btn edit-channel" id="edit-channel-${element.channel.channel_id}" title="Edit"></button>
                                        <button class="option-btn-icon small-btn delete-channel" id="delete-channel-${element.channel.channel_id}" title="Delete"></button>
                                    </span>
                                </li>`;
                        channel_list.insertAdjacentHTML('beforeend', html);
                        channel_list.querySelector(`#delete-channel-${element.channel.channel_id}`).addEventListener('click', (e) => {
                            const id = e.target.id.substring(15);
                            deleteChannel(id);
                        });
                        channel_list.querySelector(`#edit-channel-${element.channel.channel_id}`).addEventListener('click', (e) => {
                            const id = e.target.id.substring(13);
                            openChannelEditForm(id);
                        });
                    }
                    else {
                        html = `<li id="server-${element.channel.channel_id}">
                                    <span class="option-btn-container channel-list-buttons">
                                    <a class="chat-channel menu-a" tabindex="0" id="chat-channel-${element.channel.channel_id}"><span class="channel-icon" id="channel-icon-${element.channel.channel_id}" title="${element.channel.name}"></span><p class="p-title" id="channel-name-${element.channel.channel_id}">${element.channel.name}</p></a>
                                    </span>
                                </li>`;
                        channel_list.insertAdjacentHTML('beforeend', html);
                    }
                    channel_list.querySelector(`#chat-channel-${element.channel.channel_id}`).addEventListener('click', (e) => {
                        const id = e.target.id.substring(13);
                        const channel_name = document.getElementById(`channel-name-${id}`).innerText;
                        getChat(id, server_name, channel_name);
                    });
                });
            });
        }
        else {
            return response.json().then(data => {
                const html = `<h4>There is no any channel</h4>
                            <p>Please create a channel</p>`;
                channel_list.innerHTML = html;
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
                    document.getElementById(`channel-name-${id}`).innerText = data.name;
                }
                close_modal();
            });
        }
        else {
            return response.json().then(data => {
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
            document.getElementById(`channel-${id}`).remove();
            const chat = document.querySelector('.chat');
            if(chat){
                chat.remove();
            }
            //TODO: REMOVE ELEMENTS IN THE SERVER'S CHANNEL LIST
        }
        else {
            return response.json().then(data => {
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
                                        <h5>Description:</h5>
                                        <p>${data.description ? data.description : ''}</p>
                                    </span>`
                const element = document.getElementById('modal');
                element.id = 'open-modal';
            });
        }
        else {
            return response.json().then(data => {
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

function openChannelCreateForm(server_id, server_name) {
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
        console.log(server_id);
        createChannel(server_id, server_name);
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
                const content = document.getElementById('form-container');
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
                content.querySelector('#channel-name').value = data.name;
                content.querySelector('#channel-description').value = data.description;
                content.querySelector("#create-btn").addEventListener("click", (event) => {
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
    document.querySelector('.app').innerHTML = '<div class="menu-container">';
    let content = document.querySelector('.chat')
    if(content) {
        content.remove();
    }
    const html = `<nav class="navbar server-nav all-servers">
                    <div class="menu" id="server-menu">
                        <span class="option-btn-container">
                            <button type="button" class="colapse-btn" onclick="animate_servers()" title="Colapse"></button>
                            <span>
                                <button type="button" class="option-btn-icon" id="search-server" title="Search"></button>
                            </span>
                        </span>
                        <div class="list-container"></div>
                    </div>
                </nav>`
    content = document.querySelector('.menu-container');
    content.innerHTML = html;
    document.getElementById('search-server').addEventListener('click', (e) => {
        filterServers();
    });
    document.getElementById('server-menu').querySelector('.colapse-btn').click();
}

function showUserServersColumn() {
    document.querySelector('.app').innerHTML = '<div class="menu-container">';
    let content = document.querySelector('.chat')
    if(content) {
        content.remove();
    }
    const html = `<nav class="navbar server-nav user-servers">
                    <div class="menu" id="server-menu">
                        <span class="option-btn-container">
                            <button type="button" class="colapse-btn" onclick="animate_servers()" title="Colapse"></button>
                            <span>
                                <button type="button" class="option-btn-icon" id="search-server" title="Search"></button>
                            </span>
                            <span>
                                <button type="button" class="option-btn-icon" id="new-server" onclick="openServerCreateForm()" title="New"></button>
                            </span>
                        </span>
                        <div class="list-container"></div>
                    </div>
                </nav>`
    content = document.querySelector('.menu-container');
    content.innerHTML = html;
    document.getElementById('search-server').addEventListener('click', (e) => {
        filterServers();
    });
    document.getElementById('server-menu').querySelector('.colapse-btn').click();
}

function showChannelsColumn(server_id, server_name) {
    let content = document.querySelector('.chat')
    if(content) {
        content.remove();
    }
    content = document.querySelector('.channel-nav')
    if(content) {
        content.remove();
    }
    const html = `<nav class="navbar channel-nav">
                    <div class="menu" id="channel-menu">
                        <span class="option-btn-container">
                            <button type="button" class="colapse-btn" onclick="animate_channels()" title="Colapse"></button>
                            <span>
                                <button type="button" class="option-btn-icon add-channel-btn" id="new-channel-${server_id}" title="New channel"></button>
                            </span>
                        </span>
                        <div class="list-container"></div>
                    </div>
                </nav>`
    content = document.getElementsByClassName('server-nav')[0];
    content.insertAdjacentHTML('afterend', html);
    document.getElementById(`new-channel-${server_id}`).addEventListener('click', (e) => {
        console.log(e.target.id)
        const server_id = e.target.id.substring(12);
        openChannelCreateForm(server_id, server_name);
    });
    document.getElementById('channel-menu').querySelector('.colapse-btn').click();
}

function showChatContainer(channel_id, server_name, channel_name) {
    let content = document.querySelector('.chat')
    if(content) {
        content.remove();
    }
    const html = `<article class="chat" id="chat-channel-${channel_id}">
                    <div id="chat-header"><a class="info-channel menu-a" tabindex="0" id="info-channel-${channel_id}">Info</a><h3>${server_name} - ${channel_name}</3></div>
                    <div id="chat-frame">
                        <ul class="list" id="msg-list">
                        </ul>
                    </div>
                    <div id="typing-bar">
                        <input type="text" id="message-input">
                        <input type="submit" id="send" name="send" value="">
                    </div>
                </article>`
    content = document.querySelector('.app');
    content.insertAdjacentHTML('beforeend', html);
    document.getElementById('send').addEventListener('click', (e) => {
        sendMessage(channel_id);
    });
    content.querySelector('.info-channel').addEventListener('click', (e) => {
        const id = e.target.id.substring(13);
        showInfoChanel(id);
    });
    document.getElementById('message-input').addEventListener('keypress', (e) => {
        if (e.key == 'Enter') {
            e.preventDefault();
            document.getElementById("send").click();
            document.getElementById('message-input').value = ''
        }
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
    getMyServers()
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
});
