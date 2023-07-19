
$(function(){

    var accuweatherAPIKey = 'HLG41cPz282XyjVhPoA0F4aIqrpXeAaU';
    var mapBoxToken = 'pk.eyJ1IjoiaGJlcm5hcmRlbGxpIiwiYSI6ImNsazh3c25zNTBoM3EzdWxjeDUzM2d5OXYifQ.KS1y7QhF1Zdb2UUpn0p0Qw';

    var weatherObject = {
        cidade: '',
        estado: '',
        pais: '',
        temperatura: '',
        texto_clima: '',
        icone_clima: '',

    };

    function preencherClimaAtual(cidade, estado, pais, temperatura, minima, maxima, texto_clima, icone_clima) {
        
        var texto_atual = cidade + ', ' + estado + '. ' + pais;
        $('#texto_local').html(texto_atual);
        $('#texto_clima').html(texto_clima);
        $('#texto_temperatura').html( String(temperatura) + "&deg;" );
        $('#icone_clima').css('background-image', 'url("' + weatherObject.icone_clima + '")');
        
    }
    
    function gerarGrafico(horas, temperaturas) {

        Highcharts.chart('hourly_chart', {
            chart: {
                type: 'line'
            },
            title: {
                text: 'Temperatura Hora a Hora'
            },
            
            xAxis: {
                categories: horas
            },
            yAxis: {
                title: {
                    text: 'Temperatura (°C)'
                }
            },
            plotOptions: {
                line: {
                    dataLabels: {
                        enabled: true
                    },
                    enableMouseTracking: false
                }
            },
            series: [{
                showInLegend: false,
                data: temperaturas
            }]
        });
        
    }

    gerarGrafico();

    function pegarPrevisaoHoraAHora(localCode) {

        $.ajax({
            url: "http://dataservice.accuweather.com/forecasts/v1/hourly/12hour/" + localCode + "?apikey=" + accuweatherAPIKey + "&language=pt-br&metric=true",
            type: 'GET',
            dataType: 'json',
            success: function(data){
                // console.log('hourly forecast: ', data);

                var horarios = [];
                var temperaturas = [];

                for(var a = 0; a < data.length; a++) {

                    var hora = new Date(data[a].DateTime).getHours();
                    horarios.push( String(hora) + 'h');
                    temperaturas.push( data[a].Temperature.Value);

                    gerarGrafico(horarios, temperaturas);

                    $('.refresh-loader').fadeOut();

                }

            },
            error: function(){
                console.log('Erro');
                gerarErro('Erro ao obter a previsão hora a hora');
            }
        });
        
    }
    
    function preencherPrevisao5Dias(previsoes) {
        
        $('#info_5dias').html('');

        var diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
        
        for (var a = 0; a < previsoes.length; a++) {
            
            var dataHoje = new Date(previsoes[a].Date);
            var dia_semana = diasSemana[ dataHoje.getDay() ];
            
            var iconNumber = previsoes[a].Day.Icon <= 9 ? '0' + String(previsoes[a].Day.Icon) : previsoes[a].Day.Icon;

            iconeClima = 'https://developer.accuweather.com/sites/default/files/' + iconNumber + '-s.png';
            maxima = String(previsoes[a].Temperature.Maximum.Value);
            minima = String(previsoes[a].Temperature.Minimum.Value);

            elementoHTMLDia = ' <div class="day col"> ';
            elementoHTMLDia += ' <div class="day_inner"> ';
            elementoHTMLDia +=     ' <div class="dayname"> ';
            elementoHTMLDia +=         dia_semana;
            elementoHTMLDia +=    ' </div>';
            elementoHTMLDia +=     ' <div style="background-image: url(\'' + iconeClima + '\')" class="daily_weather_icon"></div> ';
            elementoHTMLDia +=     ' <div class="max_min_temp"> ';
            elementoHTMLDia +=        minima + '&deg; /' + maxima + '&deg;';
            elementoHTMLDia +=    ' </div> ';
            elementoHTMLDia += ' </div> ';
            elementoHTMLDia += ' </div> ';

            $('#info_5dias').append(elementoHTMLDia);
            elementoHTMLDia = '';
            
        }
        
    }
    
    function pegarPrevisao5Dias(LocalCode) {
        
        $.ajax({
            url: "http://dataservice.accuweather.com/forecasts/v1/daily/5day/" + LocalCode + "?apikey=%09" + accuweatherAPIKey + "&language=pt-br&metric=true",
            type: 'GET',
            dataType: 'json',
            success: function(data){
                // console.log('5 days forecast: ', data);

                $('#texto_max_min').html( String(data.DailyForecasts[0].Temperature.Minimum.Value) + '&deg;' + ' / ' + String(data.DailyForecasts[0].Temperature.Maximum.Value) + '&deg;');

                preencherPrevisao5Dias(data.DailyForecasts);
            },
            error: function(){
                console.log('Erro');
                gerarErro('Erro ao obter a previsão de 5 dias');
            }
        });

    }
    
    function PegarTempoAtual(LocalCode){
        
        $.ajax({
            url: "http://dataservice.accuweather.com/currentconditions/v1/" + LocalCode + "?apikey=%09" + accuweatherAPIKey + "&language=pt-br",
            type: 'GET',
            dataType: 'json',
            success: function(data){
                // console.log('Current conditions: ', data);

                weatherObject.temperatura = data[0].Temperature.Metric.Value;
                weatherObject.texto_clima = data[0].WeatherText;

                var iconNumber = data[0].WeatherIcon <= 9 ? '0' + String(data[0].WeatherIcon) : data[0].WeatherIcon;

                weatherObject.icone_clima = 'https://developer.accuweather.com/sites/default/files/' + iconNumber + '-s.png';

                preencherClimaAtual(weatherObject.cidade, weatherObject.estado, weatherObject.pais, weatherObject.temperatura, weatherObject.minima, weatherObject.maxima, weatherObject.texto_clima, weatherObject.icone_clima);

            },
            error: function(){
                console.log('Erro');
                gerarErro('Erro ao obter clima atual');
            }
        });

    }

    function pegarLocalUser(lat, long){

        $.ajax({
            url: "http://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=" + accuweatherAPIKey + "&q=" + lat + "%2C" + long + "&language=pt-br",
            type: 'GET',
            dataType: 'json',
            success: function(data){
                // console.log('Geoposition: ', data);

                try{

                    weatherObject.cidade = data.ParentCity.LocalizedName;

                }
                catch{

                    weatherObject.cidade = data.LocalizedName;

                }

                weatherObject.estado = data.AdministrativeArea.LocalizedName;
                weatherObject.pais = data.Country.LocalizedName;
                
                var localCode = data.Key;
                PegarTempoAtual(localCode);
                pegarPrevisao5Dias(localCode);
                pegarPrevisaoHoraAHora(localCode);

            },
            error: function(){
                console.log('Erro');
                gerarErro('Erro no código do local');
            }
        });

    }

    function pegarCoordenadasDaPesquisa(input) {

        input = encodeURI(input);

        $.ajax({
            url: 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + input + '.json?access_token=' + mapBoxToken +'',
            type: 'GET',
            dataType: 'json',
            success: function(data){
                // console.log('Mapbox: ', data);

                try {
                    var long = data.features[0].geometry.coordinates[0];
                    var lat = data.features[0].geometry.coordinates[1];
    
                    pegarLocalUser(lat, long);

                } catch {
                    gerarErro('Erro na pesquisa de local');

                }

                

            },
            error: function(){
                console.log('Erro no mapbox');
                gerarErro('Erro na pesquisa de local');
            }
        });

    }

    
    
    function pegarCoordenadasdoIP(){

        var latPadrao = -21.174724129815928;
        var longPadrao = -48.15204651638009;
        
        $.ajax({
            url: "http://www.geoplugin.net/json.gp",
            type: 'GET',
            dataType: 'json',
            success: function(data){
                

                if(data.geoplugin_latitude && data.geoplugin_longitude){
                    pegarLocalUser(data.geoplugin_latitude && data,geoplugin_longitude)
                }else{
                    pegarLocalUser(latPadrao, longPadrao);
                }
            },
            error: function(){
                console.log('Erro');
                pegarLocalUser(latPadrao, longPadrao);
                
            }
        });
    }

    function gerarErro(mensagem) {

        if(!mensagem){
            mensagem = 'Erro na solicitação';
        }

        $('.refresh-loader').hide();
        $('#aviso-erro').text(mensagem);
        $('#aviso-erro').slideDown();

        window.setTimeout(function(){
            $('#aviso-erro').slideUp();
        }, 4000);

    }


   pegarCoordenadasdoIP();

   $('#search-button').click(function(){
       $('.refresh-loader').show();
       var local = $('input#local').val();
       if(local) {
            pegarCoordenadasDaPesquisa(local);
        }else {
            alert('Local Inválido');
        }

    });

   $('input#local').on('keypress', function(e){
       if(e.which == 13){
            $('.refresh-loader').show();
            var local = $('input#local').val();
            if(local) {
                pegarCoordenadasDaPesquisa(local);
            }else {
                alert('Local Inválido');
            }

        }

    });




    
});

