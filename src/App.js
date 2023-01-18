import logo from './logo.svg';
import './App.css';

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
    const response = await fetch("https://ofertadecursos.uniandes.edu.co/api/courses?term=&ptrm=&prefix=&attr=&nameInput=&campus=CAMPUS%20PRINCIPAL&attrs=&timeStart=&offset=0&limit=300")
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

          //TODO
          // let clasroom = pattern.clasroom
          // let building_name = clasroom.split(" ")[0]
          // let room_name = clasroom.split(" ")[1]
          let building_name = element.class
          let room_name = element.course.slice(0,2)

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
            if (pattern[this.days[day]] != null)
            {
              this.buildings[building_name].getRoom(room_name).addAvailability(day, [pattern.time_ini, pattern.time_fin])
            }
          }
          this.buildings[building_name].addRoom(room)
        }
      } 
    }
    console.log("All classes were loaded correctly")

    //TODO
    // console.log(this.getAvailableRooms(1, "06:30"))
    console.log(this.getAvailableRooms(0, "06:30","ADMI",3))
  }

  getAvailableRooms(day, hour, building=undefined, floor=undefined)
  {
    let available_rooms = {}
    var minimum_time = new Date("01/01/2022 23:59:59")
    for (let building_name in this.buildings)
    {
      //Revisa si el edificio es el correcto en caso dado que sea dado por parametro
      if(building !== undefined && building_name !== building){continue}
      
      for (let room_name in this.buildings[building_name].rooms)
      {
        //Revisar si el piso es el correcto en caso dado que haya piso
        if(floor !== undefined && room_name.slice(0,1) != floor){continue}
        const room = this.buildings[building_name].rooms[room_name]
        minimum_time = new Date("01/01/2022 23:59:59")
        let occupied = false
        for (let availability of room.availability[day])
        {
          const actual_time = new Date("01/01/2022 "+hour+":00")
          const class_time_ini = new Date("01/01/2022 "+availability[0]+":00")
          const class_time_fin = new Date("01/01/2022 "+availability[1]+":00")

          //Revisar si actualmente se esta dando clase en dicho salon
          if (actual_time >= class_time_ini && actual_time <=class_time_fin)
          {
            minimum_time =  class_time_fin
            occupied = true            
          }

          //Buscar cual es la clase mas cercana
          else if (actual_time < class_time_ini && class_time_ini <= minimum_time)
          {
            minimum_time = class_time_ini
          }
        }

        available_rooms["room"]=building_name+room_name
        available_rooms["time"]=minimum_time

        if (!occupied) {available_rooms["available"]=true}    
        else {available_rooms["available"]=false}
      }
    }
    return available_rooms

    //[{"ML001","5:30",1},{"ML002","4:30",2},{"ML002","5:30",3}]

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

}

function App() {
  const sobrecupo = new Sobrecupo();
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          {/* {sobrecupo.response[1]} */}
          Learn React bla bla
        </a>
      </header>
    </div>
  );
}

export default App;
