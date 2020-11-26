import React, { useEffect } from 'react';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import esLocale from '@fullcalendar/core/locales/es';
import 'containers/Agenda/Agenda.css';

import '@fullcalendar/core/main.css';
import '@fullcalendar/daygrid/main.css';
import '@fullcalendar/timegrid/main.css';
import '@fullcalendar/list/main.css';

const Calendario = props => {

    const getHeight = () => {
        let h = window.innerHeight - 130;
        return h;
    }

    useEffect(()=>{
        var calendarEl = document.getElementById('calendar');
        var eventos = props.asignaciones;

        var calendar = new Calendar(calendarEl, {
            plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
            defaultView: 'listDay',
            locale: esLocale,
            customButtons: {
                Asignacion: {
                    text: 'Asignación',
                    click: () => {
                        props.onClickAsignacion();
                    }
                },
                Asesores: {
                    text: props.AsesorSelected,
                    click: () => {
                        props.onClickAsesores();
                    }
                }
                
            },
            dateClick: (info) => props.onClickAgenda(info),
            header: {
                right: 'prev,next today Asignacion, Asesores',
                left: 'title',
                center: 'dayGridMonth,listWeek,listDay'
            },
            buttonText: {
                listWeek: 'Semana',
                listDay: 'Día',
            },
            editable: true,
            droppable: true,
            height: getHeight(),
            eventLimit: true,
            eventSources: [
                {
                    // events: [{
                    //     extendedProps
                    // }]
                    events: eventos
                }
            ],
            eventTimeFormat: {
                hour: 'numeric',
                minute: '2-digit',
                meridiem: 'short'
            },
            eventClick: (info) => props.onClickEvento(info),

        });

        calendar.render();

        return ()=>{
            calendar.destroy();
        }
    },[props.asignaciones])


    return <div id="calendar" className="CalendarioAgenda"></div>;
}

export default Calendario;