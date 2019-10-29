import { Component, OnInit } from '@angular/core';
import { FbService } from '../../services/fb.service';
import { Lists } from '../../lists/lists';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { take } from 'rxjs/operators';
import { GameDB, PlayersObj, PeerObj } from '../../classes/game/game';
import { User } from '../../classes/player/player';
import * as SimplePeer from 'simple-peer';

@Component({
  selector: 'app-new',
  templateUrl: './new.component.html',
  styleUrls: ['./new.component.css']
})
export class NewComponent implements OnInit {
  newGameForm: FormGroup;
  submitted = false;
  listsObj = new Lists();
  droneColorList = this.listsObj.droneColorList;
  mazeDifficultyList = this.listsObj.mazeDifficultyList;
  mazeLocationList = this.listsObj.mazeLocationList;
  openToList = this.listsObj.openToList;
  currentUser: User;

  constructor(private fb: FbService, private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.newGameForm = this.formBuilder.group({
      droneColor: ['', [Validators.required]],
      mazeDifficulty: ['', Validators.required],
      mazeLocation: ['', Validators.required],
      openTo: ['', Validators.required]
    });  
  }

  // convenience getter for easy access to form fields
  get f() { return this.newGameForm.controls; }

  createGame() {
    this.submitted = true;
    if(this.newGameForm.valid) {
      var prom = new Promise((resolve, reject) => {
        this.fb.isUserLoggedIn().then((resp) => {
          if(resp) {
            this.fb.getUser(resp);
            this.fb.user.pipe(take(1)).subscribe((userData: User) => {
                this.currentUser = userData;
                var obj: GameDB = {
                active: false,
                droneColor: this.f.droneColor.value,
                mazeDifficulty: this.f.mazeDifficulty.value,
                mazeLocation: this.f.mazeLocation.value,
                gid: '',
                openTo: this.f.openTo.value,
                players: [<PlayersObj>{ active: true, uid: userData.uid, firstName: userData.firstName, lastName: userData.lastName, bladeID: 'A' }],
                host: userData.uid,
                peer1: <PeerObj>{ uid: userData.uid, signal: '' },
                peer2: <PeerObj>{ uid: '', signal: '' },
                peer3: <PeerObj>{ uid: '', signal: '' },
                peer4: <PeerObj>{ uid: '', signal: '' }
                }
                resolve(obj);
            });
          } else {
            resolve(false);
          }
        });
      });
      prom.then((promObj: GameDB) => {
        this.fb.addDoc('games', promObj).then((docID: string) => {
          if(docID) {
            promObj.gid = docID;
            //this needs to be done on server
            location.hash = '#'+docID;
            this.fb.cfCreateHostPeer(docID, this.currentUser.uid).then((resp: any) => {
                if(resp.ok) {
                    this.fb.getGame(docID, 'gameBS');
                    this.fb.fireSwal('Success!', 'Your game has been created.', 'success');
                    this.fb.goToPage('awaiting');
                } else {
                    this.fb.fireSwal('Error!', resp.message, 'error');
                    console.error('Game was not created: ', resp);
                }
            })
          } else {
            console.error('Game was not created: ', docID);
          }
        })
      })
    }
  }
}
