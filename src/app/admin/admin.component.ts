import { Component, SimpleChange, SimpleChanges } from '@angular/core';
import { io } from 'socket.io-client';
import { DataService } from '../data.service';
import { map } from 'rxjs';
import { User } from './user.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {

  //variable socket
  socket: any

  users: User[] = [];
  cuestionarios;
  block: boolean = false; //false
  serverStatus = false; //false
  selector: string = "";
  IDformulario: string = "";
  init: boolean = true; //true
  numeroPreguntas = 0
  preguntaActual = 0
  finalizado = false //false
  contador = 0
  ///
  ip: string = ""
  initDone = false //inicia lo demas ya con ip, false
  respuestaCorrecta = ""
  loading:boolean = false
  juegoStatus = false
  usersAux: User[] = []

  constructor(private dataService: DataService,
    private router: Router) {
      //this.users.sort((a, b) => b.puntaje - a.puntaje);
    }

  //obtener ip
  enterIP() {
    if (this.ip != "") {
      try {
        this.initDone = true
        this.socket = io(`http://${this.ip}:3000`) //se incia el io en el socket seleccionado
        this.socketServices()
        this.juegoStatus = true
      } catch (e) {
        alert("No se pudo conectar con el servidor")
      }
    }

  }

  socketServices() {
    this.obtenerCuestionarios()
    this.socket.on('updateList', () => {
      this.getUsers();
    })

    this.socket.on('respuesta', (data) => {
      this.respuestaCorrecta = "Inciso: " + data
    })

    this.socket.on('contador', (data) => {
      this.contador = data
      console.log(this.contador)
    })

    this.socket.on('juegoTerminado', (data) => {
      //alert("Juego terminado")
      //aqui hago un manejo para mostrar a el top 3
      //oculto in game y muestro game finished

      this.getUsers()

      setTimeout(()=>{
        this.juegoStatus = false
      },1000)

    })
  }

  ///peticiones sin socket
  getUsers() { //obtiene los usuarios

    this.dataService.getUsers(this.ip).subscribe((data: User[]) => {
      data.sort((a, b) => b.puntaje - a.puntaje);
      this.users = data;
      console.log(this.users)
    });
  }

  obtenerCuestionarios() {  //obtiene los cuestionarios
    this.loading = true
    this.dataService.obtenerFormularios(this.ip).subscribe((data: any) => {
      this.cuestionarios = data.cuestionario;
      this.loading = false
    })
  }

  seleccion(event: Event) { //selecciona el cuestionario
    this.IDformulario = (event.target as HTMLSelectElement).value;

    if (this.IDformulario) {
      this.block = true;
      console.log("La opción seleccionada es: " + this.IDformulario);
    }
  }

  cambiar() { //cambia el cuestionario
    alert("Si cambias esto el servidor y el juego termina")
    this.selector = ""
    this.block = false;
    this.serverStatus = false;
    this.numeroPreguntas = 0
    this.preguntaActual = 0
    this.juegoStatus = true
    this.socket.emit('terminar')
  }

  crearServidor() { //crea el servidor SOCKET
    this.serverStatus = true;
    this.joinRoom()
  }

  iniciarJuego() { //inicia el juego SOCKET
    this.init = false;
    this.socket.emit('iniciarJuego', this.IDformulario)
  }

  terminar() { //termina el juego SOCKET
    this.users = []
    this.numeroPreguntas = 0
    this.preguntaActual = 0
    this.init = true;
    this.selector = ""
    this.serverStatus = false;
    this.block = false;
    this.juegoStatus = true;
    this.socket.emit('terminar')
  }

  joinRoom() {  //se une al servidor
    //this.socketService.joinRoom({ username: "admin" })
    this.socket.emit('joinRoom', { username: "admin" })
  }

  exitRoom() { //sale del servidor
    //this.socketService.exitRoom({ username: "admin" })
    this.socket.emit('exitRoom', { username: "admin" })
  }

  goTo(direccion) {
    //this.router.navigate(['/'+direccion])
    this.router.navigate(['/dashboard'])
  }

  ngOnDestroy() { //desconecta el socket
    if (this.socket) {
      this.serverStatus = false;
      this.exitRoom()
      //this.socketService.disconnectSocket();
      this.socket.disconnect()
    }
  }

}

