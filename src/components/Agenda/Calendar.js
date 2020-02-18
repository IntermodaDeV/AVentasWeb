import React, { Component } from 'react';
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


export default class Calendario extends Component {

    render() {
        return <div id="calendar" className="CalendarioAgenda"></div>;
    }


    getHeight = () => {
        var h = window.innerHeight - 90
        return h;
    }

    componentDidMount() {

        var calendarEl = document.getElementById('calendar');
        var eventos = this.props.asignaciones;

        var calendar = new Calendar(calendarEl, {
            plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
            defaultView: 'listDay',
            locale: esLocale,
            customButtons: {
                Asignacion: {
                    text: 'Asignación',
                    click: () => {
                        this.props.onClickAsignacion();
                    }
                }
            },
            dateClick: (info) => this.props.onClickAgenda(info),
            header: {
                right: 'prev,next today Asignacion',
                left: 'title',
                center: 'dayGridMonth,listWeek,listDay'
            },
            buttonText: {
                listWeek: 'Semana',
                listDay: 'Día',
            },
            editable: true,
            droppable: true,
            height: this.getHeight,
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
            eventClick: (info) => this.props.onClickEvento(info),

        });

        calendar.render();
    }
}