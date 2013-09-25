define( [ 
  'jquery'
  ,'underscore'
  ,'backbone'
  ,'d3'
  ,'text!tpl/detalles/timeline.html'
  ,'qtip2'
  ], 

function( $, _, Backbone, d3, tpl ) 
{

'use strict';

var TimelineView = Backbone.View.extend({ 

  initialize: function() 
  { 
    //var opt = this.options;
    this.$el.addClass('timeline-view');
  }

  ,tpl: _.template( tpl )

  ,render: function()
  {
    this.$el.html( this.tpl({}) );
    this.init_vis();
    return this;
  }

  ,dispose: function()
  {
    this.vis = null;
    this.remove();
  }

  ,init_vis: function()
  { 

    var layout = {
      width: 1000
      ,height: 500
      ,margin: { x: 20 }
      ,icons_offset: { bottom: 40, top: 0 }
    };

    function make_format( formats ) 
    {
      return function( date ) 
      {
        var i = formats.length - 1;
        var f = formats[i];
        while ( ! f[1]( date ) ) 
          f = formats[--i];
        return f[0]( date );
      };
    }

    function domain( _domain )
    {
      xscale
        .domain( _domain )
        .range([ 
          0 + layout.margin.x, 
          layout.width - layout.margin.x 
        ]);

      xaxis
        .scale( xscale )
        .ticks( d3.time.months, 12 )
        .tickSize( 4 )
        .tickPadding( 6 )
        .tickFormat( format );

      svg.select('.x.axis')
        .call( xaxis );
    }

    this._top = layout.icons_offset.top;
    this._bottom = layout.icons_offset.bottom;

    var tipformat = d3.time.format("%d/%m/%Y");

    var format = d3.time.format("%Y");
    //var format = make_format([
      //[ 
        //d3.time.format("%Y"), 
        //function() { return true; }
      //]
      //,[
        //d3.time.format("%m/%y"), 
        //function(d) { return d.getMonth(); }
      //]
    //]); 

    var xscale = d3.time.scale().clamp(true); 
    var xaxis = d3.svg.axis(); 

    var svg = d3
      .select( 
        this.$el.find('.svg-container')[0] )
      .append( 'svg' )
        .attr( 'width', layout.width )
        .attr( 'height', layout.height )
      .append( 'g' )
        .attr( 'class', 'svg-canvas' )

    svg
      .append( 'g' )
      .attr( 'class', 'x axis' )
      //.attr( 'transform',
          //'translate('+
            //layout.timeline.x +','+
            //layout.timeline.y +')')
      //.call( xaxis );

    domain([
      new Date( 2003, 0, 1 )
      ,new Date( 2016, 0, 1 )
    ]); 

    // acceso publico para updatear
    this.vis = {
      data: []
      ,svg: svg
      ,format: format
      ,xscale: xscale
      ,tipformat: tipformat
      ,layout: layout
      //,domain: domain
    };

  }

  /*
   *  date: {
   *    //ISO-8601 2013-07-31T19:28:10.444Z
   *    iso: 'YYYY-MM-DDTHH:mm:ss.sssZ'
   *    ,src: ''
   *  }
   */
  ,add: function( feature, date )
  {
    var self = this;

    //var id = feature.get('id');
    var props = feature.get('properties');

    var _advocacy = props.type === 'acciones' || props.type === 'respuestas';

    var vis = this.vis; 
    var icon_off = vis.layout.icons_offset;
    var icon_h = props.icon.height + 10;

    vis.data.push({
      feature: feature
      ,date: date
    });

    //vis.domain( 
      //d3.extent( vis.data, function( d )
      //{ 
        //var props=d.feature.get('properties');
        //return new Date( date.iso ); 
      //}) );

    var img = vis.svg
      .selectAll( 'image' );

    var clas = 'timeline-icon';

    img
      .data( vis.data )
      .enter()
    .append( 'image' )
      .attr( 'class', clas )
      .attr( 'xlink:href', props.icon.url )
      .attr( 'width', props.icon.width )
      .attr( 'height', props.icon.height )

      .attr( 'x', function( d ) 
      { 
        //var props = d.feature
          //.get('properties');
        return vis.xscale( 
          new Date( date.iso ) );
      })

      .attr( 'y', function( d ) 
      { 
        var x = parseFloat(
          this.getAttribute('x') );

        var _top = icon_off.top - icon_h;
        var _bottom = icon_off.bottom;

        img.each( function( d_img, i )
        {
          var props = d_img.feature
            .get('properties');

          var el = img[0][i];

          var ox =  parseFloat(
            el.getAttribute('x') );

          var ow = parseFloat(
            el.getAttribute('width') );

          //ow /= 2;
          if ( x > ox-ow && x < ox+ow )
          {
            _top -= icon_h;
            _bottom += icon_h;
          }

        });

        return _advocacy ? _top : _bottom;
        //return _bottom;
      })


    /*
     * update bottom/top
     */

    self._top = icon_off.top - icon_h;
    self._bottom = icon_off.bottom + icon_h;

    var $imgs = $('image.'+clas);

    _.each( $imgs, function( el )
    {
      var y = parseFloat( el.getAttribute('y') );
      self._top = Math.min(
        y - icon_h, self._top );
      self._bottom = Math.max( 
        y + icon_h, self._bottom );
    });

    var _top_offset = Math.abs( self._top );

    //var $clock = this.add_clock(); 
    //if ( $clock ) 
      //_top_offset += $clock.height();

    vis.svg.attr( 'transform',
        'translate( 0, '+
          _top_offset+')')

    /*
     * add tooltip
     */

    _.each( $imgs, function( el )
    {
      var d = el.__data__;
      var props = d.feature.get('properties');

      var _date = vis.tipformat( 
        new Date( d.date.iso ) );

      $(el).qtip({

        position: { 
          my: 'bottom right'
          ,adjust: { 
            x: -props.icon.width
            ,y: -props.icon.height
          }
          //,target: 'mouse'
        }
        ,style: { 
          classes: 'qtip-tipsy' 
          //,tip: {
            //corner: true
          //}
        }

        ,content: {
          title: _date,
          text: [
            '<div style="'
              ,'font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif;'
              ,'font-size: 15px;'
              ,'font-weight: 200;'
              ,'padding: 10px;'
            ,'">'
            ,props.titulo
            ,'</div>'
          ]
          .join('')
        }

        ,show: { 
          effect: false
          ,event: 'click mouseenter'
          ,delay: 50
        }   

        ,hide: { 
          effect: false
          ,delay: 50
          ,fixed: true
        }
      });
    });

    //.tipsy({ 
      //gravity: 's', 
      //html: true, 
      //title: function() 
      //{
        //var d = el.__data__;
        //var date = vis.tipformat( d.date );
        //return [
          //'<div style="'
            //,'font-size: 15px;'
            //,'padding: 10px;'
          //,'">'
          //,date
          //,' '
          //,d.titulo
          //,'</div>'
        //]
        //.join(''); 
      //}
    //});

  } 

  //,add_clock: function()
  //{
    //if ( this._$clock )
      //return this._$clock;

    //_.each( $('image.'+clas), function( el )
    //{
      //var d = el.__data__;
      //var props = d.feature.get('properties');

      //var _advocacy = props.type === 'acciones' || props.type === 'respuestas';
      //if ( !_advocacy )
        //return false;
    //});
        
    //var x = vis.xscale(
      //new Date( props.date.iso ) );

  //}

  ,bottom: function()
  {
    return this._bottom + Math.abs(this._top); 
  }

});

return TimelineView;

});
