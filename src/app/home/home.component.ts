import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  pass:string = "admin"; //admin

  constructor(private router: Router) { }

  goToLobby() {
    this.router.navigate(['/lobby']);
  }

  goToAdmin() {

    var respuesta = prompt("¿Ingresa tu contraseña?");

    if (respuesta !== null) {
      if(respuesta === this.pass){
        alert("Hola, " + respuesta + ". ¡Bienvenido!");
        this.router.navigate(['/admin']);
      }else{
        alert("Contraseña incorrecta.");
      }
    } else {
      alert("Has cancelado la operación.");
    }

  }

}
