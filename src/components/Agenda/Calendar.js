import React, { useEffect, useRef } from 'react';
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

    const calendarRef = useRef(null);

    useEffect(()=>{
        var calendarEl = document.getElementById('calendar');

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
                    // Se piden al API solo las visitas del rango visible
                    events: (info, successCallback, failureCallback) => {
                        props.obtenerEventos(info.start, info.end)
                            .then(successCallback)
                            .catch(failureCallback);
                    }
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
        calendarRef.current = calendar;

        return ()=>{
            calendar.destroy();
            calendarRef.current = null;
        }
        // eslint-disable-next-line
    },[props.AsesorSelected])

    useEffect(()=>{
        if (props.versionEventos > 0 && calendarRef.current) {
            calendarRef.current.refetchEvents();
        }
    },[props.versionEventos])


    return <div id="calendar" className="CalendarioAgenda"></div>;
}

export default Calendario;