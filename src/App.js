import './App.css';
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Context from './Context';
import Welcome from './Welcome/Welcome';
import Header from './Header/Header';
import Footer from './Footer/Footer';
import Buildings from './Buildings/Buildings';
import Classrooms from './Classrooms/Classrooms';

class Sobrecupo
{
  buildings = {}
  response
  loaded = false
  days = ['l', 'm', 'i', 'j', 'v', 's', 'd']
  constructor()
  {
    console.log("Extracting info from the api ")
    try
    {
    this.initalize()
    }
    catch (error)
    {
      console.log("There was an error and the courses were not loaded")
    }
  }

  async initalize()
  {
    // const response = await fetch("https://ofertadecursos.uniandes.edu.co/api/courses?term=&ptrm=&prefix=&attr=&nameInput=&campus=CAMPUS%20PRINCIPAL&attrs=&timeStart=&offset=&limit=1")
    const response = await fetch("https://ofertadecursos.uniandes.edu.co/api/courses?term=&ptrm=&prefix=&attr=&nameInput=&campus=CAMPUS%20PRINCIPAL&attrs=&timeStart=&offset=0&limit=1000")
    this.response = await response.json()
    this.loaded = true;
    //TODO
    let actual_date = new Date("2023-03-03")
    for (let element of this.response )
    {
      for (let pattern of element.schedules)
      {
        let date_ini = new Date(pattern.date_ini)
        let date_fin = new Date(pattern.date_fin)
        if (date_ini <= actual_date && date_fin >= actual_date)
        {

          let classroom = pattern.classroom
          let building_name = (classroom.split("_")[0]).slice(1,)
          let room_name = classroom.split("_")[1]


          if (this.buildings[building_name] == null)
          {
            this.buildings[building_name] = new Building(building_name)
          }
          let room = new Room(room_name)
          if (this.buildings[building_name].getRoom(room_name) == null)
          {
            this.buildings[building_name].addRoom(room)
          }
          for (let day=0; day<=6; day++)
          {
            if (pattern[this.days[day]] !== null)
            {
              this.buildings[building_name].getRoom(room_name).addAvailability(day, [pattern.time_ini, pattern.time_fin])
            }
          }
          this.buildings[building_name].addRoom(room)
        }
      } 
    }
    console.log("All classes were loaded correctly")
    console.log(this.buildings)
    //TODO
    // console.log(this.getAvailableRooms(1, "06:30"))
    console.log(this.getAvailableRooms(0, "12:30","RGD","0"))
    //console.log(this.buildings["ADMI"].getRoom("11").isAvailable(0, "11:00"))
  }

  getAvailableRooms(day, hour, building=undefined, floor=undefined)
  {
    let available_rooms = []
    for (let building_name in this.buildings)
    {
      //Revisa si el edificio es el correcto en caso dado que sea dado por parametro
      if(building !== undefined && building_name !== building){continue}
      
      for (let room_name in this.buildings[building_name].rooms)
      {
        //Revisar si el piso es el correcto en caso dado que haya piso
        if(floor !== undefined && room_name.slice(0,1) !== floor){continue}
        const room = this.buildings[building_name].rooms[room_name]
        let room_availability = room.isAvailable(day, hour)
        room_availability["room"] = building_name+" "+room_availability["room"]
        available_rooms.push(room_availability)
      }
    }
    return available_rooms

    //[{"ML001","5:30",1},{"ML002","4:30",2},{"ML002","5:30",3}]
    //[{"ML001", "True", "5:30"}, {"ML002", False, "5:30", 10}]
    // [[],[],[]]
    //1:Disponible mas de x tiempo ->verde 
    //2:Disponible menos de x tiempo ->naranja
    //3:No disponible -> rojo

  }
}

class Building
{
  constructor(name)
  {
    this.name = name
    this.rooms = {}
  }
  addRoom(room)
  {
    if (this.rooms[room.name] == null)
    {
      this.rooms[room.name] = room
    }
  }
  getRoom(room_name)
  {
    return this.rooms[room_name]
  }
}

class Room
{
  constructor(name)
  {
    this.name = name
    this.availability = Array(7)
    for (let i=0; i<=6; i++)
    {
      this.availability[i] = []
    }
  }

  addAvailability(day, availability) 
  {
    let auxAvailability = [availability[0].slice(0, 2) + ":" + availability[0].slice(2) , availability[1].slice(0, 2) + ":" + availability[1].slice(2)]
    this.availability[day].push(auxAvailability);
  }

  isAvailable(day, hour){
    let todayAvailability = this.availability[day]
    let isBusy = false
    let minDifference = null
    let nextTime = "23:59"
    let stopBusy = null
    for (let availability of todayAvailability){
      let difference = this.differenceHours(availability[0], hour)
      if(difference>0 && (minDifference === null || difference < minDifference)){
        minDifference = difference
        nextTime = availability[0]
      }
      if(hour>=availability[0] && hour<=availability[1]){
        stopBusy = availability[1]
        isBusy = true
      }
    }
    if (isBusy){return {"room":this.name, "available":!isBusy, "time":stopBusy, "after":nextTime}}
    else {return {"room":this.name, "available":!isBusy, "time":nextTime, "after": undefined}} 
  }

  differenceHours(hour_a, hour_b){
    var dot = (a, b) => a.map((x, i) => a[i] * b[i]).reduce((m, n) => m + n);
    return dot(hour_a.split(":").map(Number), [60,1])-dot(hour_b.split(":").map(Number), [60,1])
  }

}

const App = () => {
  const sobrecupo = new Sobrecupo();
  return (
    <div className="App">
      <Context.Provider 
        value={sobrecupo}
      >
        <Header/>
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Welcome/>}/>
            <Route path="/buildings" element={<Buildings/>}/>
            <Route path="/classrooms" element={<Classrooms/>}/>
          </Routes>
          </BrowserRouter>
        <Footer/>
      </Context.Provider>
    </div>
  );
}

export default App;
