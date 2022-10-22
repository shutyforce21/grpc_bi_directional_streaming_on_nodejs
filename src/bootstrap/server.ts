var grpc = require('@grpc/grpc-js');
import { ChatServer } from "../application/Chat";
import { ChatServiceService } from "../gen/proto/chat_grpc_pb";

(() => {
    const portNumber = '5000'
    const server = new grpc.Server();
    server.addService(ChatServiceService, new ChatServer());
    server.bindAsync(`localhost:${portNumber}`, grpc.ServerCredentials.createInsecure(), (error: Error | null, port: number) => {
        if(error) {
            throw error
        }

        server.start();
        console.log(`Listening on ${port}`);
    })
})()