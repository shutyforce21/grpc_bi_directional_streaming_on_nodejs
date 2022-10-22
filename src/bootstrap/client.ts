import { ChatServiceClient } from "../gen/proto/chat_grpc_pb";
import { User } from "../gen/proto/chat_pb";
var grpc = require('@grpc/grpc-js');


import * as readline from 'readline'
import { ChatMessage } from "../gen/proto/chat_pb";

const host = `localhost:5000`

const chatClient = new ChatServiceClient(host, grpc.credentials.createInsecure())

const r = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

r.question('your name ?', (name: string) => {

    const user = new User()
    user.setName(name)

    chatClient.in(user).on('data', (req: User) => {
        console.log(`${req.getName()} joined ...`)
    })
    
    const chatStream = chatClient.send()

    chatStream.on('data', (req: ChatMessage) => {
        if (req.getUser()?.getName() !== name) {
            console.log(`${req.getUser()?.getName()}: ${req.getMessage()}`)
        }
    })
    
    r.on('line', (line) => {
        const chat = new ChatMessage()
        const user = new User()
        user.setName(name)
        chat.setMessage(line)
        chat.setUser(user)
    
        chatStream.write(chat)
    })
})

