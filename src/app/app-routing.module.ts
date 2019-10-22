import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AwaitingComponent } from './pages/awaiting/awaiting.component';
import { GameComponent } from './pages/game/game.component';
import { JoinComponent } from './pages/join/join.component';
import { NewComponent } from './pages/new/new.component';
import { ScoresComponent } from './pages/scores/scores.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';

import { AngularFireAuthGuard, redirectUnauthorizedTo } from '@angular/fire/auth-guard';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(["/"]);

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'awaiting', component: AwaitingComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin } },
  { path: 'game', component: GameComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin } },
  { path: 'join', component: JoinComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin } },
  { path: 'new', component: NewComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin } },
  { path: 'scores', component: ScoresComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin } },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
