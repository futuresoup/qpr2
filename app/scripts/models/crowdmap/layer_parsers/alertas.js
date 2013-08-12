define( [ 
    'jquery' 
    ,'underscore'
    ,'backbone'
    ,'models/qpr/feature'
    ], 

function( $, _, Backbone, Feature ) 
{

'use strict';

function Alertas( opt ) 
{
  this.opt = opt;

  this.db = {
    task: 'incidents'
  };
}

Alertas.prototype.parse =
function( layer, data, sync_opt )
{
  var opt = this.opt;

  var _data = data;
  //var _data = JSON.parse(
    //decodeURIComponent( data.data ) );

  var reportes = _data.payload.incidents; 
  var i = reportes.length;
  var r;

  var date
    ,titulo
    ,resumen
    ,descripcion;

  while( i-- )
  {
    r = reportes[i].incident;

    if ( r.incidentverified === '0' )
      continue;

    resumen = r.incidentdescription.split(' ').slice(0,20).join(' ') + '...';

    titulo = r.incidenttitle;
    descripcion = r.incidentdescription;

    date = new Date( 
        r.incidentdate.replace(' ','T') )
      .toISOString();

    layer.add( new Feature({ 
      id: r.incidentid
      ,properties: {
        type: opt.name
        ,date: {
          iso: date
          ,src: r.incidentdate
        }
        ,titulo: titulo 
        ,resumen: resumen 
        ,descripcion: descripcion 
        ,icon: opt.icon
      }
      ,geometry: {
        type: 'Point'
        ,coordinates: [
          parseFloat( r.locationlatitude ) 
          ,parseFloat( r.locationlongitude )
        ]
      }
    }) );

  }
}

return Alertas;

});

