define( [ 
    'jquery' 
    ,'underscore'
    ,'backbone'
    ,'models/qpr/feature'
    ,'utils'
    ],  

function( $, _, Backbone, Feature, utils ) 
{

'use strict';

function Basurales( opt ) 
{
  _.extend( this, Backbone.Events );

  this.opt = opt;

  this.db = [
    'name'
    ,'geometry'
  ];
}

Basurales.prototype.parse =
function( data, sync_opt )
{
  //console.log( 'basurales.parse', arguments )

  var opt = this.opt;

  var name
    ,geom
    ,coordarr
    ,polyarr
    ,descripcion;

  var idx = {
    name: this.db.indexOf('name'),
    geom: this.db.indexOf('geometry')
  } 

  var rows = data.rows;
  //var row, i = rows.length;

  //while( i-- )
  function parse( row )
  {
    //row = rows[i];

    name = row[ idx.name ];
    geom = row[ idx.geom ].geometry;

    descripcion = 'basural ' + name;

    switch ( geom.type )
    {
      case 'Point':

        coordarr = utils
          .reverse_point(
              geom.coordinates) 

        this.trigger('add:feature',new Feature({ 
          id: name
          ,properties: {
            type: opt.name
            ,titulo: name
            ,resumen: descripcion
            ,descripcion: descripcion
            ,icon: opt.icon
          }
          ,geometry: {
            type: 'Point'
            ,coordinates: coordarr 
          }
        }) );

        break;

      case 'Polygon':

        polyarr = utils
          .reverse_polygon(
              geom.coordinates[0] );

        this.trigger('add:feature',new Feature({ 
          id: name + _.uniqueId(' polygon ')
          ,properties: {
            type: opt.name
            ,titulo: name
            ,resumen: descripcion
            ,descripcion: descripcion
            ,icon: opt.icon
          }
          ,geometry: {
            type: 'Polygon'
            ,coordinates: polyarr
          }
        }) );

        break;

    }
  }

  utils.process( rows, parse, null, this );

};

return Basurales;

});

