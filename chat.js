const ADAM_JWT = ''
const BARBARA_JWT = ''
const CONVERSATION_ID = '';

let conversation = null;
let timeout = null;
const messageTextarea = document.getElementById('messageTextarea')
const messageFeed = document.getElementById('messageFeed')
const sendButton = document.getElementById('send')
const loginForm = document.getElementById('login')
const status = document.getElementById('status')

setupUserEvents()

function eventLogger(event) {
  return () => { console.log("'%s' event was sent", event) }
}

function authenticate(username) {
  if (username == "adam") {
    return ADAM_JWT
  }
  if (username == "barbara") {
    return BARBARA_JWT
  }
  alert("User not recognized")
}

function setupShowMessages(conv) {
  conversation = conv
  document.getElementById('sessionName').innerHTML = conversation.me.user.name + "'s messages"

  // Bind to events on the conversation
  conversation.on('text', (sender, message) => {
    const rawDate = new Date(Date.parse(message.timestamp))

    const formattedDate = moment(rawDate).calendar()

    let text = ''
    if (message.from !== conversation.me.id) {
      text = `<span style="color:red">${sender.user.name} <span style="color:red">(${formattedDate}): <b>${message.body.text}</b></span><br>`
    } else {
      text = `me (${formattedDate}): <b>${message.body.text}</b><br>`
    }

    messageFeed.innerHTML = messageFeed.innerHTML + text

  })

  conversation.on("text:typing:on", (data) => {
    console.log(data)
    if (data.user.id !== data.conversation.me.user.id) {
      status.innerHTML = data.name + " is typing..."
    }
  });

  conversation.on("text:typing:off", (data) => {
    status.innerHTML = ""
  });
}

function joinConversation(userToken) {
  new ConversationClient({
    debug: false
  })
    .login(userToken)
    .then(app => {
      return app.getConversation(CONVERSATION_ID)
    })
    .then(setupShowMessages.bind(this))
}

function setupUserEvents() {
  sendButton.addEventListener('click', () => {
    conversation.sendText(messageTextarea.value).then(() => {
      eventLogger('text')()
      messageTextarea.value = ''
    }).catch((error) => {
      console.log(error)
    })
  })

  loginForm.addEventListener('submit', (event) => {
    event.preventDefault()
    const userToken = authenticate(document.getElementById('username').value)
    if (userToken) {
      document.getElementById('messages').style.display = 'block'
      document.getElementById('login').style.display = 'none'
      joinConversation(userToken)
    }
  })

  messageTextarea.addEventListener('keypress', (event) => {
    conversation.startTyping()
  })

  messageTextarea.addEventListener('keyup', (event) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      conversation.stopTyping()
    }, 500);
  })
}