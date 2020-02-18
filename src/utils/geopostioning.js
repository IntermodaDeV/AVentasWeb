import store from '../store/store'
const saveGeolocation = (position) => {
    fetch("https://aventas.devcit.com:3044/api/Geoposicion" , {
            headers: {
                'Content-Type': 'application/json',
                'Authorization':
                    'Bearer ' + localStorage.getItem('token')
            },
            method: 'POST',
            body: JSON.stringify({CodigoAsesor:store.getState().AsesorId,Latitude:position.coords.latitude,Longitude:position.coords.longitude})
        }).then((res) => {
            if (res.status === 200) {
            } else {
            }
        })
}
export const getGeopostion = (asignacionID, asesorId) => {
    navigator.geolocation.getCurrentPosition(saveGeolocation    , (err)=>{console.log('Error',err)}, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    });
};