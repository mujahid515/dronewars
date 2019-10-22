import { Component, OnInit } from '@angular/core';
import { FbService } from '../../services/fb.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  constructor(private fb: FbService) { }

  ngOnInit() {
    console.log(this.fb.getGameObj());
  }

}
