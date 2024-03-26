import { Component, HostListener } from '@angular/core';
import { SocketService } from './socket.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DataService } from './data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  title = 'appCuestionario';

}

