import { ServerDuplexStream, ServerWritableStream } from "@grpc/grpc-js";
import { IChatServiceServer } from "../gen/proto/chat_grpc_pb";
import { ChatMessage, User } from "../gen/proto/chat_pb";

export class ChatServer implements IChatServiceServer
{
    [name: string]: import("@grpc/grpc-js").UntypedHandleCall;

    static users:ServerWritableStream<User, User>[] = [];
    static chat:ServerDuplexStream<ChatMessage, ChatMessage>[] = [];

    in(call: ServerWritableStream<User, User>) {
        const name = call.request.getName()
        const joinedUser = new User()
        joinedUser.setName(name)

        ChatServer.users.forEach(user => user.write(joinedUser))
        ChatServer.users.push(call)
    }

    send(call: ServerDuplexStream<ChatMessage, ChatMessage>): void {
        ChatServer.chat.push(call)
        call.on('data', function(req: ChatMessage) {
            console.log(`${req.getUser()?.getName()}: ${req.getMessage()}`)

            ChatServer.chat.forEach(chat => {
                const response = new ChatMessage()
                const user = new User()
    
                const userName = req.getUser()?.getName()
                if (userName) {
                    user.setName(userName)
                    response.setUser(user)
                }
                response.setMessage(req.getMessage())
                chat.write(response)
            })

        }).on('end', function(req: ChatMessage) {
            call.end()
        })
    }
}