const USER1_JWT = '';
const USER2_JWT = '';
const CONVERSATION_ID = '';

const messageTextarea = document.getElementById('messageTextarea');
const messageFeed = document.getElementById('messageFeed');
const sendButton = document.getElementById('send');
const loginForm = document.getElementById('login');
const status = document.getElementById('status');

function authenticate(username) {
  if (username == "user1") {
    return USER1_JWT;
  }
  if (username == "user2") {
    return USER2_JWT;
  }
  alert("User not recognized");
}

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const userToken = authenticate(document.getElementById('username').value);
  if (userToken) {
    document.getElementById('messages').style.display = 'block';
    document.getElementById('login').style.display = 'none';
    run(userToken);
  }
});

async function run(userToken) {
  let client = new NexmoClient({ debug: true });
  let app = await client.login(userToken);
  let conversation = await app.getConversation(CONVERSATION_ID);

  // Update the UI to show which user we are
  document.getElementById('sessionName').innerHTML = conversation.me.user.name + "'s messages"

  // Load events that happened before the page loaded
  let events = await conversation.getEvents({ event_type: "text", page_size: 100 });
  events.items.forEach(event => {
    addMessage(conversation.members.get(event.from), event, conversation.me);
  });

  // Any time there's a new text event, add it as a message
  conversation.on('text', (sender, event) => {
    addMessage(sender, event, conversation.me);
  });

  // Listen for clicks on the submit button and send the existing text value
  sendButton.addEventListener('click', async () => {
    await conversation.sendText(messageTextarea.value);
    messageTextarea.value = '';
  });

  messageTextarea.addEventListener('keypress', (event) => {
    conversation.startTyping();
  });

  var timeout = null;
  messageTextarea.addEventListener('keyup', (event) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      conversation.stopTyping();
    }, 500);
  });

  conversation.on("text:typing:on", (data) => {
    if (data.user.id !== data.conversation.me.user.id) {
      status.innerHTML = data.user.name + " is typing...";
    }
  });

  conversation.on("text:typing:off", (data) => {
    status.innerHTML = "";
  });
}

function addMessage(sender, message, me) {
  const rawDate = new Date(Date.parse(message.timestamp))
  const formattedDate = moment(rawDate).calendar()

  let text = ''
  if (message.from !== me.id) {
    text = `<span style="color:red">${sender.user.name} <span style="color:red;">(${formattedDate}): <b>${message.body.text}</b></span>`
  } else {
    text = `me (${formattedDate}): <b>${message.body.text}</b>`
  }

  messageFeed.innerHTML = messageFeed.innerHTML + text + '<br />';
}