import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DynatraceLoggerService {

  constructor(private http: HttpClient) {}
  url = environment.dynatrace.url;
  token = environment.dynatrace.token;

  logger(tipoLog:string, mensagem: string, origem: string) {
    const requestBody = this.getBody(tipoLog, mensagem, origem)
    const requestHeaders = this.getHeaders()
    this.ingestLog(requestBody, requestHeaders)
  }

  private getBody(tipoLog: string, mensagem: string, origem: string) {
    const body = {
      'severity': tipoLog,
      'content': mensagem,
      'log.source': origem
    };
    return body
  }

  private getHeaders(){
    const headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': `Api-Token ${this.token}`,
    });
    return headers
  }

  private ingestLog(body: object, headers: HttpHeaders){
    this.http.post(this.url, body, {headers: headers} )
    .subscribe({
      next: (success) => {
        console.log(success);
      },
      error: (error: HttpErrorResponse) => {
        console.log(error);
      },
      complete: () => {
        console.log('completo')
      },
    });
  }
  
}
