import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from "rxjs";
import { map, catchError } from 'rxjs/operators';
import { Subject } from 'rxjs/internal/Subject';
import { FormControl } from '@angular/forms';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  public cards$: Observable<any[]>;
  public searchField = new FormControl();
  public subscription$ = new Subject();

  public list = [];

  constructor(private _http: HttpClient) { }

  ngOnDestroy() {
    this.subscription$.next();
    this.subscription$.complete();
  }

  ngOnInit(): void {
    this.searchField.valueChanges
      .pipe(takeUntil(this.subscription$), debounceTime(500))
      .subscribe(text => {
        console.log(text);

        if (typeof text === "string") {
          this.getCard(text);
        }

        if (typeof text === 'object') {
          // add to list
          this.list.push(text);
          this.searchField.setValue("", { emitEvent: false });
        }
      });
  }

  public getCard(name: string): void {
    const url = `https://api.magicthegathering.io/v1/cards?name=${name}&page=1&pageSize=5`;
    this.cards$ = this._http.get<any>(url)
      .pipe(
        map((res) => {
          const { cards } = res;
          return cards;
        }),
        catchError(res => {
          return throwError(res);
        }));
  }

  public selected(event: any): void {
    console.log("selected", event);
  }

  public displayFn(card: any): string {
    return card && card.name ? card.name : '';
  }
}
