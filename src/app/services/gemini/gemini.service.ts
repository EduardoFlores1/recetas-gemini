import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {

  private readonly API = environment.API;

  constructor() { }

  crearModelo() {
    const generativeAPI = new GoogleGenerativeAI(this.API);
    return generativeAPI.getGenerativeModel(
      {model: 'gemini-1.5-flash'}
    );
  }
}
