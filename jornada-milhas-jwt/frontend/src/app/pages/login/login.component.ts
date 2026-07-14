import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AutenticacaoService } from 'src/app/core/services/autenticacao.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit{
  loginForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AutenticacaoService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, Validators.required]
    });
  }


  login(){
    const email = this.loginForm.value.email;
    const senha = this.loginForm.value.password;

    this.authService.autenticar(email, senha).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        this.router.navigateByUrl('/');
      },
      error: (error) => {
        console.error('Login failed:', error);
      }
    });  
    console.log(this.loginForm.value);


  }

}
