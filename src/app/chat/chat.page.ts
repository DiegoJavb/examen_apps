import { Component, OnInit } from '@angular/core';
import {CrudService} from '../services/crud.service';
import {LoadingController, ToastController} from '@ionic/angular';
import {Router} from '@angular/router';
import {UsuarioInterface} from '../interfaces/usuario';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MessageInterface} from '../interfaces/messages';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  toast: any;
  loading: any;
  msgs: MessageInterface[];

  constructor(
    private crudService: CrudService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private router: Router,
    private formBuilder: FormBuilder
  ) {
    this.crudService.stateAuth().subscribe(res => {
      if(res !== null) {
        this.uid = res.uid;
        this.getUsrInf(this.uid);
      }
    });
  }
  
  msg: MessageInterface = {
    id: this.crudService.newId(),
    username: '',
    message: '',
  };

  user: UsuarioInterface = {
    id: '',
    name: '',
    email: '',
    password: '',
  };

  uid = '';

  validationsForm: FormGroup;

  validationmessages = {
    message: [
      { type: 'required', message: 'Ingrese un mensaje.' },
    ],
  };

  

  ngOnInit() {
    this.cargarMsgs();
    this.credencialesUsr();
    this.validationsForm = this.formBuilder.group({
      message: new FormControl('', Validators.compose([
        Validators.required,
      ])),
    });
  }


  async createMsg() {
    this.msg.username = this.user.name;
    const loading = await this.loadingCtrl.create({
      message: 'Guardando...'
    });
    await loading.present();
    // Guardamos el usuario
    this.crudService.createUsr(this.msg, 'mensajes', this.msg.id).then(() => {
      loading.dismiss();
      this.presentarToast('Guardado con exito');
      this.router.navigate(['/chat']);
      location.reload();
    });
  }

  async presentarToast(msg: string) {
    this.toast = await this.toastCtrl.create({
      message: msg,
      duration: 5000,
      cssClass: 'toast'
    });
    this.toast.present();
  }

  cargarMsgs() {
    this.presentarLoading();
    this.crudService.getMsgs<MessageInterface>('mensajes').subscribe( res => {
        this.msgs = res;
        this.loading.dismiss();
        this.msg.message = '';
      }
    );
  }

  async credencialesUsr() {
    const uid = await this.crudService.getUid();
    this.user.id = uid;
    console.log(uid);
  }

  async presentarLoading() {
    this.loading = await this.loadingCtrl.create({
      cssClass: 'normal',
      message: 'Cargando...!'
    });
    await this.loading.present();
  }

  salir() {
    this.crudService.logout().then( () => {
      this.router.navigate(['/login']);
    });
  }

  getUsrInf( uid: string){
    this.crudService.getUsr('usuarios', uid).subscribe(res => {
      this.user = res as UsuarioInterface;
    });
  }

  onSubmit(values) {
    console.log(values);
  }

}

