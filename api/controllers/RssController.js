/**
 * RssController
 *
 * @description :: Server-side logic for managing rsses
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var Feed = require('rss-to-json');
var _ = require('lodash');

module.exports = {
	rss:function(req,res){
        sails.log(req.query.url);
        if(_.isUndefined( req.query.url) )
            return res.badRequest('you must provide an rss url');
            //req.params.url='http://www.eurosport.fr/football/rss.xml';
        Feed.load(req.query.url, function(err, rss){
            sails.log(rss);
            return res.json(rss);
        });
        
    }
};

