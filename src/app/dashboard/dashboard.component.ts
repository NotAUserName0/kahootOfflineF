import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormArray } from '@angular/forms';
import { DataService } from '../data.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  crear: boolean = false;
  mostrar: boolean = false;
  formulario: FormGroup
  maxOpciones: number = 4;
  contadores: number[] = [];
  preguntas: any
  opc = ['a) ', 'b) ', 'c) ', 'd) ']
  archivos: File[] = []
  loading: boolean = false
  ip:string = ""
  formularios: any

  constructor(private fb: FormBuilder, private dataService: DataService, private router:Router) {
    this.crear = true;

    this.formulario = this.fb.group({
      titulo: ['', Validators.required],
      preguntas: this.fb.array([]),
    })

    /*if(this.ip === ""){
      this.obtenerFormularios()
    }*/
  }

  obtenerFormularios(){
    this.dataService.obtenerFormularios(this.ip).subscribe((res)=>{
      //console.log(res)
      this.formularios = res
    }, err =>{
      alert("Por favor introduce una IP valida, revisa el manual")
    })
  }

  agregarPregunta() {
    const pregunta = this.fb.group({
      pregunta: ['', Validators.required],
      multimedia: ['', Validators.required],
      file: ['', Validators.required],
      opciones: this.fb.array([]),
      respuesta: ['', Validators.required],
    });

    this.contadores.push(0);

    (<FormArray>this.formulario.get('preguntas')).push(pregunta);
  }

  eliminarPregunta(indice: number) {
    alert('Eliminado');
    (<FormArray>this.formulario.get('preguntas')).removeAt(indice)
    this.archivos.splice(indice, 1)
  }

  openA() {
    if (!this.crear) {
      this.crear = true;
      this.mostrar = false;
      this.formulario.reset();
      (<FormArray>this.formulario.get('preguntas')).clear()
      this.contadores = [];
      this.archivos = []
      this.obtenerFormularios()
    }
  }

  openB() {
    if (!this.mostrar) {
      this.mostrar = true;
      this.crear = false;
      this.formulario.reset();
      (<FormArray>this.formulario.get('preguntas')).clear()
      this.contadores = [];
      this.archivos = []
      this.obtenerFormularios()
    }
  }

  reiniciarForm() {
    this.formulario.reset();
    (<FormArray>this.formulario.get('preguntas')).clear()
    this.contadores = [];
    this.archivos = []
  }

  setIP(){
    let dato = (<HTMLInputElement>document.getElementById('ip')).value;
    this.ip = dato
    //(<HTMLInputElement>document.getElementById('ip')) ;
    document.getElementById('ip').setAttribute('disabled', 'true');
  }

  leaveIP(){
    this.ip = '';
    (<HTMLInputElement>document.getElementById('ip')).value = '';
    document.getElementById('ip').removeAttribute('disabled');
    this.reiniciarForm()
    this.formularios = []
  }

  obtenerPreguntas(): FormGroup[] {
    return (<FormArray>this.formulario.get('preguntas')).controls as FormGroup[];
  }

  agregarOpcion(indice: number) {
    const preguntasArray = this.formulario.get('preguntas') as FormArray;
    const opcionesArray = preguntasArray.at(indice).get('opciones') as FormArray;

    if (opcionesArray.length < this.maxOpciones) {
      const control = this.fb.group({
        opcion: ['', Validators.required],
        valor: [0, Validators.required],
      });
      opcionesArray.push(control);
      this.contadores[indice]++;
    }
  }

  obtenerOpciones(indice: number): FormGroup[] {
    const preguntasArray = this.formulario.get('preguntas') as FormArray;
    const opcionesArray = preguntasArray.at(indice).get('opciones') as FormArray;
    return opcionesArray ? opcionesArray.controls as FormGroup[] : [];
  }

  onFileChange(event, index) {
    this.archivos[index] = event.target.files[0]
  }

  del(titulo){
    this.dataService.delFormulario(titulo, this.ip).subscribe((res)=>{
      alert("Eliminado!")
      this.obtenerFormularios()
    }, err =>{
      alert("Por favor introduce una IP valida, revisa el manual")
    })
  }

  obtenerValor() {
    //console.log(this.formulario.value)
    this.loading = true
    //console.log(this.archivos)

    const obj = Object.assign({}, this.formulario.value);

    if (obj.preguntas.length > 0 && obj.titulo !== '') { //se envia
      for (let i = 0; i < obj.preguntas.length; i++) {
        if (this.archivos[i]) obj.preguntas[i].file = i
        //console.log(this.archivos[i]?.name)
      }

      // Crear un nuevo FormData
      const formData = new FormData();

      // Iterar sobre las preguntas del objeto
      obj.preguntas.forEach((pregunta, index) => {
        // Crear un objeto para almacenar los datos de la pregunta
        const preguntaData = {
          pregunta: pregunta.pregunta,
          multimedia: pregunta.multimedia,
          file: pregunta.file,
          opciones: pregunta.opciones,
          respuesta: pregunta.respuesta,
        };

        // Si hay un archivo asociado a la pregunta, agregarlo al FormData
        if (pregunta.file !== null && pregunta.file !== undefined && this.archivos[pregunta.file] !== null && this.archivos[pregunta.file] !== undefined) {
          const archivo = this?.archivos[pregunta.file]; // Suponiendo que tienes un array de archivos llamado 'archivos'
          formData.append(`archivo[${index}]`, archivo, archivo?.name);
          //preguntaData.file = index; // Cambiar el índice por el valor correspondiente
          //console.log(archivo?.name)
          preguntaData.file = archivo?.name
        }

        // Agregar los datos de la pregunta al FormData como JSON
        formData.append(`preguntas[${index}]`, JSON.stringify(preguntaData));

      });

      // Agregar otros campos al FormData si es necesario
      formData.append('titulo', obj.titulo);

      this.dataService.crearCuestionario(formData, this.ip).subscribe((res: any) => {
        //console.log(res)
        this.loading = false
        this.reiniciarForm()
      }, err =>{
        alert("Por favor introduce una IP valida, revisa el manual")
      })

      alert('Cuestionario creado con éxito')
    } else {
      this.loading = false
      alert('Faltan campos por llenar')
    }

  }

  goTo(){
    this.router.navigate(['/admin'])
  }

}
