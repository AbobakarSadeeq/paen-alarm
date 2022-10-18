import { Component, DebugEventListener, OnInit, ViewChild } from '@angular/core';
import { interval, Observable, Subscription, timer } from 'rxjs';
import { delay } from 'rxjs/operators';
@Component({
  selector: 'app-alarm',
  templateUrl: './alarm.component.html',
  styleUrls: ['./alarm.component.css']
})
export class AlarmComponent implements OnInit {

  // needed in ts file
  stateInterval$: any;
  getIndexForRingingAlarm: number;

  // Template Page
  selectedData: string = null;
  currentTime: string;
  displayModal: boolean = false;
  timeUpAlarmModel: boolean = false;


  // functionallity for audio properties
  ringToneList: { ringName: string, ringUrl: string }[];
  audioObjState: any;
  changeRing: boolean = null;


  // Setting alarm
  alarmUsed: { alarmTime: string, alarmTone: string, setAlarm: boolean; }[] = [];
  alarmOnFilterArr: { alarmTime: string, alarmTone: string, setAlarm: boolean; }[] = [];

  constructor() {

  }

  ngOnInit(): void {

    // when application intiailize then it will add the data in the filterArray.
    let convertToJSObjArr = JSON.parse(localStorage.getItem("setAlarms"));
    if (convertToJSObjArr) {
      this.alarmUsed = convertToJSObjArr;
      this.alarmOnFilterArr = convertToJSObjArr.filter((a: any) => a.setAlarm == true);
    }

    this.ringToneList = [
      { ringName: 'Pirates ring', ringUrl: '../../assets/ringtones/Pirates of the Caribbean - Hes a Pirate (DJ AG Remix).mp3' },
      { ringName: '91 Days', ringUrl: '../../assets/ringtones/91 days.mp3' },
      { ringName: 'Haloo', ringUrl: '../../assets/ringtones/halo.mp3' }

    ]

    // Main Clock timing
    setInterval(() => {
      this.currentTime = (new Date()).toLocaleTimeString('en-US');
    }, 1000)





    this.stateInterval$ = interval(1000);
    this.stateInterval$.subscribe((intervalCount: number) => {
      const findingMatchedData = this.alarmOnFilterArr.find(a => a.alarmTime == (new Date()).toLocaleTimeString('en-US'));
      if (findingMatchedData) {
        this.getIndexForRingingAlarm = this.alarmUsed.indexOf(findingMatchedData);
        const findingAudioUrl = this.ringToneList.find(a => a.ringName == findingMatchedData.alarmTone);
        this.timeUpAlarmModel = true;
        this.audioObjState = new Audio(findingAudioUrl.ringUrl);
        this.audioObjState.play();
        this.audioObjState.loop = true;
      }
    });

  }







  showDialog() {
    this.displayModal = true;
  }

  closeModel() {
    if (this.audioObjState == undefined) {
      this.displayModal = false;
      this.selectedData = null;
    } else {
      this.audioObjState.pause();
      this.displayModal = false;
      this.selectedData = null;
    }

  }



  saveAlarm() {

    localStorage.setItem("setAlarms", JSON.stringify(this.pusingDataToSetAlarm()));
    this.audioObjState.pause();
    this.displayModal = false;
    this.selectedData = null;

  }

  deleteAlarm(index: number) {
    this.alarmUsed.splice(index, 1);
    localStorage.setItem("setAlarms", JSON.stringify(this.alarmUsed));
    this.alarmOnFilterArr = this.alarmUsed.filter(a => a.setAlarm == true);
    if (this.alarmUsed.length == 0) {
      localStorage.removeItem("setAlarms");
      this.alarmOnFilterArr = [];
    }
  }

  adjustRingtone(event: Event) {

    let gettingValue = (event.target as HTMLInputElement).value;
    let audioObj;
    if (this.changeRing) {
      this.audioObjState.pause();
      audioObj = new Audio(gettingValue);
      audioObj.play();
    } else {
      audioObj = new Audio(gettingValue);
      audioObj.play();
    }
    this.audioObjState = audioObj;
    this.changeRing = true;
  }

  // changing alarm On and off
  onChangedAlarm(changedIndex: number) {
    let gettingValue = this.alarmUsed[changedIndex];
    const findingFilterArrAlarmDisable = this.alarmOnFilterArr.indexOf(gettingValue);
    if (gettingValue.setAlarm == false) {
      gettingValue.setAlarm = true;
      localStorage.setItem("setAlarms", JSON.stringify(this.alarmUsed));
      this.alarmOnFilterArr.push(gettingValue);
    } else {
      gettingValue.setAlarm = false;
      localStorage.setItem("setAlarms", JSON.stringify(this.alarmUsed));
      this.alarmOnFilterArr.splice(findingFilterArrAlarmDisable, 1);

    }
  }

  turnOffAlarm() {
    this.timeUpAlarmModel = false;
    this.audioObjState.pause();
    let gettingValue = this.alarmUsed[this.getIndexForRingingAlarm];
    const findingFilterArrAlarmDisable = this.alarmOnFilterArr.indexOf(gettingValue);
    gettingValue.setAlarm = false;
    localStorage.setItem("setAlarms", JSON.stringify(this.alarmUsed));
    this.alarmOnFilterArr.splice(findingFilterArrAlarmDisable, 1);

  }

  // Accessing Input Data of Alarm
  @ViewChild("hourInput") hourSelected: any;
  @ViewChild("minuteInput") mintueSelected: any;
  @ViewChild("dayOrNightInput") dayOrNightSelected: any;
  @ViewChild("ringSelected") ringToneSelected: any;

  pusingDataToSetAlarm() {
    let getHour = this.hourSelected.nativeElement.value;
    let minute = this.mintueSelected.nativeElement.value;
    let dayOrNight = this.dayOrNightSelected.nativeElement.value;
    let alarmRingToneUrl = this.ringToneSelected.nativeElement.value;

    let findIndexRingTone = this.ringToneList.findIndex(a => a.ringUrl == alarmRingToneUrl);

    debugger;
    this.alarmUsed.push({
      alarmTime: getHour + ":" + (minute.length == 1 ? "0" + minute : minute) + ":" + "00 " + dayOrNight,
      alarmTone: this.ringToneList[findIndexRingTone].ringName,
      setAlarm: true
    });
    this.alarmOnFilterArr = this.alarmUsed.filter(a => a.setAlarm == true);
    return this.alarmUsed;
  }



}
