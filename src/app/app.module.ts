import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AngularFireModule, FirebaseOptionsToken } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { environment } from '../environments/environment';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClipboardModule } from 'ngx-clipboard';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NewComponent } from './pages/new/new.component';
import { HomeComponent } from './pages/home/home.component';
import { AwaitingComponent } from './pages/awaiting/awaiting.component';
import { GameComponent } from './pages/game/game.component';
import { JoinComponent } from './pages/join/join.component';
import { ScoresComponent } from './pages/scores/scores.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';

import { FbService } from './services/fb.service';
import { AngularFireAuthGuard } from '@angular/fire/auth-guard';
import { AfterIfDirective } from './directives/after-if.directive';

@NgModule({
  declarations: [
    AppComponent,
    NewComponent,
    HomeComponent,
    AwaitingComponent,
    GameComponent,
    JoinComponent,
    ScoresComponent,
    PageNotFoundComponent,
    AfterIfDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireStorageModule,
    FormsModule,
    ReactiveFormsModule,
    ClipboardModule,
    HttpClientModule
  ],
  providers: [
    FbService,
    AngularFireAuthGuard,
    { provide: FirebaseOptionsToken, useValue: environment.firebase }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
