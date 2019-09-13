const ADAM_JWT = '';
const BARBARA_JWT = ''
const CONVERSATION_ID = '';

class Chat {
  constructor() {
    this.messageTextarea = document.getElementById('messageTextarea')
    this.messageFeed = document.getElementById('messageFeed')
    this.sendButton = document.getElementById('send')
    this.loginForm = document.getElementById('login')
    this.status = document.getElementById('status')
    this.setupUserEvents()
  }

  errorLogger(error) {
    console.log(error)
  }

  eventLogger(event) {
    return () => { console.log("'%s' event was sent", event) }
  }

  authenticate(username) {
    if (username == "adam") {
      return ADAM_JWT
    }
    if (username == "barbara") {
      return BARBARA_JWT
    }
    alert("User not recognized")
  }

  setupShowMessages(conversation) {
    this.conversation = conversation
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

      this.messageFeed.innerHTML = this.messageFeed.innerHTML + text

    })

    conversation.on("text:typing:on", (data) => {
      this.status.innerHTML = data.name + " is typing..."
    });

    conversation.on("text:typing:off", (data) => {
      this.status.innerHTML = ""
    });
  }

  joinConversation(userToken) {
    new ConversationClient({
      debug: false
    })
      .login(userToken)
      .then(app => {
        return app.getConversation(CONVERSATION_ID)
      })
      .then(this.setupShowMessages.bind(this))
      .catch(this.errorLogger)
  }

  setupUserEvents() {
    this.sendButton.addEventListener('click', () => {
      this.conversation.sendText(this.messageTextarea.value).then(() => {
        this.eventLogger('text')()
        this.messageTextarea.value = ''
      }).catch(this.errorLogger)

    })

    this.loginForm.addEventListener('submit', (event) => {
      event.preventDefault()
      const userToken = this.authenticate(document.getElementById('username').value)
      if (userToken) {
        document.getElementById('messages').style.display = 'block'
        document.getElementById('login').style.display = 'none'
        this.joinConversation(userToken)
      }
    })
  }
}

new Chat()