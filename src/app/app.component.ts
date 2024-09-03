import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GenerativeModel } from '@google/generative-ai';
import { GeminiService } from './services/gemini/gemini.service';
import { RECIPE } from './prompts/comida.prompt';
import { RecetaModel } from './models/receta.model';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, JsonPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'recetas-gemini';

  _geminiService = inject(GeminiService);

  model: GenerativeModel;
  receta = signal<RecetaModel | null>(null);
  imgTitle = signal<string>('');
  imgPreview = signal<string>('');

  constructor() {
    this.model = this._geminiService.crearModelo();
  }


  async getFile(event: Event) {
    const target = event.target as HTMLInputElement;
    const file:File = (target.files as FileList)[0];
    if(file) {

      this.receta.set(null);

      if(file.type.split("/")[0] != 'image') {
        alert("El archivo debe ser una imagen !!");
        file;
        return 
      }

      this.imgTitle.set(file.name);
      const data = await this.fileToGenerativePart(file);
      await this.generateReceta(data);
    }

  }

  async fileToGenerativePart(file: File) {
    const base64EncodedDataPromise = new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });
    const img = await base64EncodedDataPromise;
    this.imgPreview.set(`data:${file.type};base64, ${img}`);

    return {
      inlineData: { data: img, mimeType: file.type}
    }
  }

  async generateReceta(data: any) {
    try {
      const result = await this.model.generateContent([RECIPE, data]);
      const response = result.response;
      this.receta.set(this.parseResponse(response.text()));

    }catch(error) {
      alert(error)
    }
  }

  parseResponse(response: string) {
    try {
      return JSON.parse(response) as RecetaModel;
    } catch (error) {
      throw new Error("La imagen no puede procesarse como un plato de comida");
    }
  }
}
