import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { io } from 'socket.io-client';
import { Pregunta } from '../pregunta.model';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent {
  form: FormGroup;
  joined: boolean = true; //true
  auxName: string = '';
  pregunta: Pregunta;
  socket: any;
  initDone = false; //false
  ip: string = "localhost"
  preguntaContestada: any
  opc = ['a) ', 'b) ', 'c) ', 'd) ']
  juegoStatus: boolean = false

  //reproductores
  @ViewChild('videoPlayer') videoPlayerRef: ElementRef;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      username: ['']
    });

  }

  enterIP() {
    if (this.ip != "") {
      try {
        this.initDone = true
        this.socket = io(`http://${this.ip}:3000`) //se incia el io en el socket seleccionado
        this.socketServices()
      } catch (e) {
        alert("No se pudo conectar con el servidor")
      }
    }
  }

  socketServices() {
    this.socket.on('iniciarJuego', (data) => { //recibe la primer pregunta
      this.preguntaContestada = false
      console.log("Juego Iniciado")
      console.log(data)
      this.pregunta = this.makeObject(data)
      this.preguntaContestada = new Array(this.pregunta.opciones.length).fill(false)
      this.juegoStatus = false
      console.log(this.pregunta)
    })

    this.socket.on('siguientePregunta', (data) => {
      this.preguntaContestada = false
      console.log("Siguiente Pregunta")

      this.pregunta = this.makeObject(data)
      this.preguntaContestada = new Array(this.pregunta.opciones.length).fill(false)
      console.log(this.pregunta)

    })

    this.socket.on('terminarJuego', (data) => {
      this.juegoStatus = false
      this.exitRoom()
      alert("Juego Terminado")
      this.pregunta = null
      this.joined = true;
    })

    this.socket.on('finalizando', (data) => {
      //alert("Juego terminado")
      //aqui hago un manejo para mostrar a el top 3
      //oculto in game y muestro game finished

      this.juegoStatus = true;
    });

    this.socket.on('tuPuntaje', (data) => {
      console.log("Tu Puntaje")
    })

    this.socket.on('gameState', (data) => {
      if (data == "on") {
        this.joined = true;
        alert("El juego ya ha comenzado no te puedes unir")
      } else if (data == "off") {
        this.joined = true;
        alert("No hay servidor o el juego esta terminado")
      }
    })
  }

  makeObject(data) {
    switch (data.multimedia) {
      case "image":
        const Iblob = new Blob([data.file], { type: 'image/*' });
        data.file = URL.createObjectURL(Iblob)
        break;
      case "audio":
        const Ablob = new Blob([data.file], { type: 'audio/*' });
        data.file = URL.createObjectURL(Ablob)
        break;
      case "video":
        const Vblob = new Blob([data.file], { type: 'video/*' });
        data.file = URL.createObjectURL(Vblob)
        break;
    }

    return data
  }

  responder(respuesta, puntaje) {
    this.preguntaContestada.fill(true)
    //falta agregar que se pausen los elementos multimedia
    if (this.pregunta.multimedia == "audio") {
      (document.getElementById("audio") as HTMLAudioElement).pause();
    } else if (this.pregunta.multimedia == "video") {
      (document.getElementById("video") as HTMLVideoElement).pause();
    }

    if (respuesta == this.pregunta.respuesta) {
      //alert("Respuesta Correcta")
      this.socket.emit('actualizarPuntaje', { username: this.auxName, puntaje: puntaje })
    } else {
      //alert("Respuesta Incorrecta")
      this.socket.emit('actualizarPuntaje', { username: this.auxName, puntaje: puntaje })
    }
  }

  joinRoom() {
    this.joined = false;
    this.auxName = this.form.value.username;
    console.log(this.form.value.username)
    //this.socketService.joinRoom({ username: this.form.value.username })
    this.socket.emit('joinRoom', { username: this.form.value.username })
  }

  exitRoom() {
    this.pregunta = null
    //this.socketService.exitRoom({ username: this.auxName })
    this.socket.emit('exitRoom', { username: this.auxName })
    this.joined = true;
    this.auxName = '';
  }

  ngOnDestroy() {
    this.exitRoom()
    //this.socketService.disconnectSocket();
    this.socket.disconnect()
  }
}
