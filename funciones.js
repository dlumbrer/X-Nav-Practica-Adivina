juego = undefined
dificultad = undefined
juego_en_curso = false

fotos_vistas = 1

marcadores = []
tag = undefined
coor_solucion = undefined
solucion = undefined
situacion_ahora = 0
num_jugados = 0

voy_principio = false;

$(document).ready(function() {
    map = L.map('map').setView([0, 0], 2);
    L.tileLayer('http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png', { //para mapquest-openstreetmap: http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png -- http://{s}.tile.osm.org/{z}/{x}/{y}.png
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    
    //Añadir marcador cuando pulsas
    map.on('click', function(e) {
        if(juego_en_curso){
            ////////////////MARCADORES Y LINEA QUE LOS UNE////////////////////7
            var marker = L.marker(e.latlng).addTo(map);
            marker.bindPopup("<b>¿Aquí está?</b><br>" + e.latlng)
            var marker_solucion = L.marker(coor_solucion).addTo(map);
            marker_solucion.bindPopup("<b>SOLUCION</b><br>" + coor_solucion).openPopup()
            
                    ////////LINEA///////
            var latlngs = Array();
            latlngs.push(marker.getLatLng());
            latlngs.push(marker_solucion.getLatLng());
            var polyline = L.polyline(latlngs, {color: 'green'}).addTo(map);
            map.fitBounds(polyline.getBounds());
                    
                    ////////METO LOS MARCADORES Y LA LINEA PARA LUEGO BORRARLAS//////////
            marcadores.push(marker)
            marcadores.push(marker_solucion)
            marcadores.push(polyline)
            
            //////////////DISTANCIA Y PUNTUACION/////////////////
            distancia = Math.floor(e.latlng.distanceTo(coor_solucion)/1000);
            puntos = distancia*fotos_vistas;
            
            $("#puntuacion").html("<h2>Te has quedado a: " + distancia + " Km</h2>" + "<h2>Puntuacion: " + puntos + " pts</h2>")
            $("#fotos").html("<h1><strong>JUEGO TERMINADO</strong></h1><h2>Solución: " + solucion + "</h2>")
            
            ///////TERMINO JUEGO////////
            ////////////HISTORIAL (DEBO IR AL PRINCIPIO PARA NO ESTROPEARLO) ///////////////////////
            if(situacion_ahora != num_jugados){
                principio = num_jugados-situacion_ahora;
                situacion_ahora = num_jugados;
                //alert("Vas a volver al principio")
                voy_principio = true;
                history.go(principio) // para ir al principio
            }
            history.pushState({juego: juego, dificultad: dificultad, puntos: puntos}, "", "?juego="+juego+"&dificultad="+dificultad+"&puntos="+puntos);
            var fecha = new Date().toJSON().slice(0,19)
            situacion_ahora++;
            $("#history").append("<li><a href=javascript:vueltahistorial(" + situacion_ahora + ")>Juego: " + juego + ", dificultad: " + dificultad + "ms, puntuacion: " + puntos + ", fecha: " + fecha + "</a></li>")
            num_jugados++;
            /////////////////////////////////////////////////////////////////////7
            
            $("#start").fadeIn()
            $("#stop").fadeOut()
            juego = undefined
            dificultad = undefined
            juego_en_curso = false;
            fotos_vistas = 1;
        }else{
            return false;
        }
    });

    $("#start").click(comenzarJuego);
    $("#stop").click(pararjuego);
    $("#stop").hide();
    $("#capitales").click(function(){ juego="capitales"});
    $("#equipos").click(function(){ juego="equipos"});
    $("#monumentos").click(function(){ juego="monumentos"});
    $("#facil").click(function(){ dificultad=10000});
    $("#normal").click(function(){ dificultad=5000});
    $("#dificil").click(function(){ dificultad=2500});
    $("#dios").click(function(){ dificultad=800});

    window.onpopstate = function(event) {
        if(!voy_principio){
            alert("Usted jugó " + event.state.juego + " en modo " + event.state.dificultad + "ms obteniendo "  + event.state.puntos + " puntos.\nJuegue otra vez para superarse!!!!")
            pararjuego();
            juego = event.state.juego;
            dificultad = event.state.dificultad;
            comenzarJuego();
        }else{ // si he vuelto al principio
            //alert("HAS VUELTO AL PRINCIPIO")
            voy_principio = false;
        }
        //alert("location: " + document.location + ", state: " + JSON.stringify(event.state));
        //$("#history").html($("#history").html() + "tete")
    };
});

function vueltahistorial(lugar){
    ////////////PARA PODER IR CORRECTAMENTE A UN PASADO TENGO QUE HACER LA RESTA DE MI SITUACION DE AHORA Y EL LUGAR AL QUE VOY (LUGAR -MI SITUACION ACTUAL)//////////////
    //alert("quieres volver al historial")
    destino = lugar - situacion_ahora
    //alert(lugar + "-" + situacion_ahora)
    situacion_ahora = lugar
    //console.log(history.state);
    if (destino == 0){
        alert("Usted jugó " + history.state.juego + " en modo " + history.state.dificultad + "ms obteniendo "  + history.state.puntos + " puntos.\nJuegue otra vez para superarse!!!!")
        //alert("Ya se encuentra en ese juego");
        juego = history.state.juego;
        dificultad = history.state.dificultad;
        comenzarJuego();
    }else{
        //alert("Te vas al " + destino);
        history.go(destino);
        //console.log(history.state);
    }
}

function pararjuego(){
    $("#start").fadeIn()
    $("#stop").fadeOut()
    dificultad=undefined; 
    juego=undefined; 
    $("#fotos").empty(); 
    juego_en_curso = false;
    fotos_vistas = 1;
    
    tag = undefined;
    coor_solucion = undefined
    solucion = undefined
    $("#fotos").html("<h1>Acabas de abortar el juego</h1><h2>Seleccione tipo de juego y dificultad para volver a jugar</h2>")
    $("#puntuacion").html("<h2>Aqui se mostrará su puntuación y distancia a la solución</h2>")
    var historyObj = window.history;
    console.log(historyObj)
}

/////////////////////////////////////MOSTRAR CARRUSEL////////////////////////////
function inicioCarrusel(items){
    salida = '<div id="myCarousel" class="carousel slide" data-ride="carousel">' +
              '<div class="carousel-inner" role="listbox">' +
                rellenarCarrusel(items) +
              '</div>' +
            '</div>'
    return salida
}

function rellenarCarrusel(items){
    salida = ""
    $.each (items, function(i, item){
        if(i==0){
            salida +=    '<div class="item active">' +
                          '<img src="'+ item.media.m + '" class="img">' +
                        '</div>'
        }else if(i==5){
            return false;
        }else{
            salida +=    '<div class="item">' +
                          '<img src="'+ item.media.m + '" class="img">' +
                        '</div>'            
        }
    })
    return salida
    
}
////////////////////////////////////////////////////////////////////////////////////////

function borrarMarcadores(){
    $.each (marcadores, function(i, marker){
        console.log(marker)
        map.removeLayer(marker)
        
    });
    marcadores = []
    map.setView([0, 0], 2);
}


function llamadaFlickr(){
    var flickerAPI = "http://api.flickr.com/services/feeds/photos_public.gne?&tagmode=any&format=json&jsoncallback=?";
    $.getJSON(flickerAPI, {
        tags: tag,//$('#tags').val(),
      }).done(function( data ) {
          $("#fotos").append(inicioCarrusel(data.items))
          $('#myCarousel').carousel({
              interval: dificultad,
              pause: "false"
          });
          $('#myCarousel').bind('slide.bs.carousel', function (e) {
                fotos_vistas += 1
          });          
      });
    
}


function comenzarJuego(){
    if(!juego_en_curso){
        if(!juego || !dificultad){
            alert("Debes seleccionar juego y dificultad"); 
        }else{
            alert("Va a jugar a " + juego + " en modo " + dificultad + "ms");
                        
            url = "geoJSON/" + juego + ".json"
            $.getJSON(url).done(function( data ) {
                console.log("RECIBIDO GEOJSON")
                
                ///// DATOS DE LA PARTIDA ///////
                var aleatorio = Math.floor(Math.random()*(data.features.length))
                console.log(aleatorio)
                tag = data.features[aleatorio].properties.tag
                coor_solucion = data.features[aleatorio].geometry.coordinates
                solucion = data.features[aleatorio].properties.solucion
                

                borrarMarcadores();

                juego_en_curso = true;
                $("#start").fadeOut()
                $("#stop").fadeIn()
                $("#fotos").empty();
                $("#puntuacion").html("<h2>Aqui se mostrará su puntuación y distancia a la solución</h2>")
                llamadaFlickr()  
            });
            
                   
        }
    }
    
}
