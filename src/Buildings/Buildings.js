import './Buildings.css';
import React, { useContext, useState, useEffect } from 'react';
import Context from '../Context';
import Header from '../Header/Header';

const Buildings = () => {
    const ctx = useContext(Context);

    const [day, setDay] = useState('L');
    const [time, setTime] = useState('--:--');

    const [buildings, setBuildings] = useState({
        'TODOS':0
    });

    useEffect(() => {
        const d = sessionStorage.getItem('selected-day');
        const t = sessionStorage.getItem('selected-time');

        if (d && t) updatePage(d,t);
        else now();
        // eslint-disable-next-line
    }, [ctx.data]);

    const updatePage = async (d,t, set=false) => {
        if (d) setDay(d);
        else d = day;
        if (t) setTime(t);
        else t = time;

        if (set) {
            sessionStorage.setItem('selected-day', d);
            sessionStorage.setItem('selected-time', t);
        }

        const response = ctx.getAvailableRooms(ctx.days.indexOf(d.toLowerCase()),t);

        let bd = {}
        let all = 0;
        for (const room of response) {
            if (room.available) {
                const b = room.room.split(' ')[0];
                bd[b] = bd[b] ? bd[b]+1 : 1;
                all++;
            }
        }

        bd = Object.keys(bd).sort().reduce(
          (obj, key) => { 
            obj[key] = bd[key]; 
            return obj;
          }, {}
        );

        setBuildings({'TODOS':all, ...bd});
    }

    const now = () => {
        const today = new Date();

        let day = today.getDay();
        day = day ? day-1 : 6;
        const hour = today.getHours();
        const minute = today.getMinutes();

        const d = ctx.days[day].toUpperCase();
        const t = `${hour < 10 ? '0'+hour : hour}:${minute < 10 ? '0'+minute : minute}`;

        sessionStorage.removeItem('selected-day');
        sessionStorage.removeItem('selected-time');

        updatePage(d, t);
    }

    return (
      <React.Fragment>
        <Header backhref='/'/>
        <main>
          <section className="select-time">
              <select name="select-day" id="select-day" 
                value={day}
                onChange={e => updatePage(e.target.value, null, true)}
                >
                  <option value="L">L</option>
                  <option value="M">M</option>
                  <option value="I">I</option>
                  <option value="J">J</option>
                  <option value="V">V</option>
                  <option value="S">S</option>
                  <option value="D">D</option>
              </select>
        
              <input type="time" name="select-hour" id="select-hour" 
                value={time}
                onChange={e => updatePage(null, e.target.value, true)}
                />
        
              <button type="button" id="btn-update-time" onClick={now}>
                  Ahora
              </button>
          </section>

          <section className="cards-container">
            {
                Object.entries(buildings).map(([bName, available]) => {
                return (
                <a className="avoid-underline" href={'/classrooms/'+bName} key={bName}>
                    <article className={`building-card available-lvl${available ? Math.min(3,Math.ceil((available+1)/10)) : 0}`} >
                        <h2>{bName}</h2>
                        <p><span>{available}</span> {available === 1 ? 'salón disponible' : 'salones disponibles'}</p>
                    </article>
                </a>
                )})
            }
          </section>

      </main>
      </React.Fragment>
    )
}

export default Buildings;