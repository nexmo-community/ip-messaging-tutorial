const USER1_JWT = '';
const USER2_JWT = '';
const CONVERSATION_ID = '';

const messageTextarea = document.getElementById('messageTextarea');
const messageFeed = document.getElementById('messageFeed');
const sendButton = document.getElementById('send');
const loginForm = document.getElementById('login');
const status = document.getElementById('status');

const loadMessagesButton = document.getElementById('loadMessages');
const messagesCountSpan = document.getElementById('messagesCount');
const messageDateSpan = document.getElementById('messageDate');

let conversation;
let listedEvents;
let messagesCount = 0;
let messageDate;

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

loadMessagesButton.addEventListener('click', async (event) => {
  // Get next page of events
  let nextEvents = await listedEvents.getNext();
  await listMessages(nextEvents);
});

async function listMessages(events) {
  let messages = '';

  // If there is a next page, display the Load Previous Messages button
  if (events.hasNext()){
    loadMessagesButton.style.display = "block";
  } else {
    loadMessagesButton.style.display = "none";
  }

  // Replace current with new page of events
  listedEvents = events;

  events.items.forEach(event => {
    const formattedMessage = formatMessage(conversation.members.get(event.from), event, conversation.me);
    messages = formattedMessage + messages;
  });

  // Update UI
  messageFeed.innerHTML = messages + messageFeed.innerHTML;
  messagesCountSpan.textContent = `${messagesCount}`;
  messageDateSpan.textContent = messageDate;
};

async function run(userToken) {
  let client = new NexmoClient({ debug: true });
  let app = await client.login(userToken);
  conversation = await app.getConversation(CONVERSATION_ID);

  // Update the UI to show which user we are
  document.getElementById('sessionName').innerHTML = conversation.me.user.name + "'s messages";

  // Load events that happened before the page loaded
  let initialEvents = await conversation.getEvents({ event_type: "text", page_size: 10, order:"desc" });

  await listMessages(initialEvents);

  // Any time there's a new text event, add it as a message
  conversation.on('text', (sender, event) => {
    const formattedMessage = formatMessage(sender, event, conversation.me);
    messageFeed.innerHTML = messageFeed.innerHTML +  formattedMessage;
    messagesCountSpan.textContent = `${messagesCount}`;
  });

  // Listen for clicks on the submit button and send the existing text value
  sendButton.addEventListener('click', async () => {
    await conversation.sendText(messageTextarea.value);
    messageTextarea.value = '';
  });

  // Listen for key presses and send start typing event
  messageTextarea.addEventListener('keypress', (event) => {
    conversation.startTyping();
  });

  // Listen for when typing stops and send an event
  let timeout = null;
  messageTextarea.addEventListener('keyup', (event) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      conversation.stopTyping();
    }, 500);
  });

  // When there is a typing event, display an indicator
  conversation.on("text:typing:on", (data) => {
    if (data.user.id !== data.conversation.me.user.id) {
      status.innerHTML = data.user.name + " is typing...";
    }
  });

  // When typing stops, clear typing indicator
  conversation.on("text:typing:off", (data) => {
    status.innerHTML = "";
  });
}

function formatMessage(sender, message, me) {
  const rawDate = new Date(Date.parse(message.timestamp));
  const formattedDate = moment(rawDate).calendar();
  let text = '';
  messagesCount++;
  messageDate = formattedDate;

  if (message.from !== me.id) {
    text = `<span style="color:red">${sender.user.name} (${formattedDate}): <b>${message.body.text}</b></span>`;
  } else {
    text = `me (${formattedDate}): <b>${message.body.text}</b>`;
  }

  return text + '<br />';

}
