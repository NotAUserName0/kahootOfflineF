import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  //socket = io('http://localhost:3000')
  socket = io('http://192.168.100.155:3000')

  constructor(private http: HttpClient) {}

   connectSocket(){
    this.socket.on('connection',()=>{
      console.log('Connected to socket')
    })
   }

   disconnectSocket(){
    this.socket.on('disconnect',()=>{
      console.log('Disconnected from socket')
    })
   }

   /*requestUsers(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.socket.on('connectedUsers', data => {
        resolve(data);
      });
    });
  }*/

  joinRoom(data:any){
    this.socket.emit('joinRoom',data)
  }

   exitRoom(data:any){
    this.socket.emit('exitRoom',data)
   }

}
