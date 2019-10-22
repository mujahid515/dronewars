import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NewComponent } from './pages/new/new.component';
import { HomeComponent } from './pages/home/home.component';
import { AddComponent } from './pages/add/add.component';
import { AwaitingComponent } from './pages/awaiting/awaiting.component';
import { GameComponent } from './pages/game/game.component';
import { JoinComponent } from './pages/join/join.component';
import { ScoresComponent } from './pages/scores/scores.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';

import { FbService } from './services/fb.service';

@NgModule({
  declarations: [
    AppComponent,
    NewComponent,
    HomeComponent,
    AddComponent,
    AwaitingComponent,
    GameComponent,
    JoinComponent,
    ScoresComponent,
    PageNotFoundComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [FbService],
  bootstrap: [AppComponent]
})
export class AppModule { }
