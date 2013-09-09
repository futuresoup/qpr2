define( [ 
    'jquery' 
    ,'underscore'
    ,'backbone'
    ,'models/qpr/Feature'
    ,'utils'
    ], 

function( $, _, Backbone, Feature, utils ) 
{

'use strict';

function Asentamientos( opt ) 
{
  _.extend( this, Backbone.Events );

  this.opt = opt;

  this.db = function()
  {
    return _.values( _db );
  }

  var _db = {
    name: 'BARRIO'
    ,geom: 'Poligono'
    ,partido: 'PARTIDO'
    ,localidad: 'LOCALIDAD'
    ,flias: '\'NRO DE FLIAS\''
    ,inicio: '\'AÑO DE CONFORMACIÓN DEL BARRIO\''
    //,loc: 'center' 
  };

  this.dbi = {};
  var i = 0;
  for ( var k in _db )
    this.dbi[k] = i++;

}

Asentamientos.prototype.parse =
function( data, sync_opt )
{
  //console.log('asentamientos.parse',arguments)

  var opt = this.opt;

  var coordarr
    ,polyarr
    ,geom
    ,name;

  var descripcion
    ,flias
    ,inicio;

  var locacion
    ,localidad
    ,partido;

  var rows = data.rows;
  //var row, i = rows.length;

  //while( i-- )
  function parse( row )
  {
    //row = rows[i];

    //coordarr=(row[this.dbi.loc]).split(' '); 
    geom = row[ this.dbi.geom ].geometry;
    name = row[ this.dbi.name ]; 

    localidad = row[ this.dbi.localidad ]; 
    partido = row[ this.dbi.partido ]; 

    flias = row[ this.dbi.flias ];
    inicio = row[ this.dbi.inicio ];

    //console.log(name,row)

    if ( _.isEmpty(geom) 
        || geom.type !== 'Polygon' )
      //continue;
      return;

    descripcion = [
      'Cantidad de Familias ' + flias
      ,'Año de inicio ' + inicio
    ]
    .join(' / ');

    locacion = localidad + ', ' + partido;

    polyarr = utils
      .reverse_polygon( 
          geom.coordinates[0] );

    var id = name + _.uniqueId(' polygon ');
    this.trigger('add:feature', new Feature({ 
      id: id
      ,properties: {
        id: id
        ,type: opt.name
        ,titulo: name
        ,resumen: descripcion
        ,descripcion: descripcion
        ,icon: opt.icon
        ,locacion: locacion
      }
      ,geometry: {
        type: 'Polygon'
        ,coordinates: polyarr
      }
    }) );

    coordarr = utils
      .get_polygon_center( 
          polyarr );

    this.trigger('add:feature', new Feature({ 
      id: name
      ,properties: {
        id: name
        ,type: opt.name
        ,titulo: name
        ,resumen: descripcion
        ,descripcion: descripcion
        ,icon: opt.icon
        ,locacion: locacion
      }
      ,geometry: {
        type: 'Point'
        ,coordinates: coordarr 
      }
    }) );

  }

  utils.process( {
    list: rows
    ,iterator: parse
    ,context: this
    ,callback: function()
    {
      this.trigger( 'complete' );
    }
  });

};

return Asentamientos;

});

