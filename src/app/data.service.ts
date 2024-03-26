import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from './admin/user.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http:HttpClient) { }

  httpOptions = { //al enviar usar
    headers : new HttpHeaders({
      'Content-Type':'application/json'
    })
  };

  URL = 'http://localhost:3000'
  //server = 'http://192.168.100.155:3000'

  getUsers(ip:string):Observable<User[]>{
    //return this.http.get('http://localhost:3000/connectedUsers')
    return this.http.get<User[]>(`http://${ip}:3000/connectedUsers`)
  }

  getCuestionarios(ip:string){
    //return this.http.get('http://localhost:3000/cuestionarios')
    return this.http.get(`http://${ip}:3000/cuestionarios`)
  }

  getServerResponse(ip:string){
    return this.http.get(`http://${ip}:3000/`)
  }

  crearCuestionario(data:any,ip:string){ //cambiar a ip
    //return this.http.post(`${this.URL}/crearCuestionario`, data)
    return this.http.post(`http://${ip}:3000/crearCuestionario`, data)
  }

  obtenerFormularios(ip){
    //return this.http.get(`${this.URL}/cuestionarios`)
    return this.http.get(`http://${ip}:3000/cuestionarios`)
  }

  delFormulario(titulo,ip){
    //return this.http.delete(`${this.URL}/eliminarCuestionario/${titulo}`)
    return this.http.delete(`http://${ip}:3000/eliminarCuestionario/${titulo}`)
  }
}
