/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      var project = req.params.project;
      var searchQuery = req.query;
    
    
      if(searchQuery._id){
        searchQuery._id = new ObjectId(searchQuery._id)
      }
    if (searchQuery.open){
      searchQuery.open = String(searchQuery.open) == 'true';
    }
    
   MongoClient.connect(CONNECTION_STRING,  { useNewUrlParser: true }, function(err, client){
        if (err) throw err;    
        var myDB = client.db(project);
        var collection = myDB.collection(project);
     
         collection.find(searchQuery).toArray(function(err,docs){
           res.json(docs);
         });
   });
    
    })
    
    .post(function (req, res){
      var project = req.params.project;
    
      var issue ={
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_on: new Date(),
        updated_on: new Date(),
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || '',
        status_text: req.body.status_text || '',
        open: true
      };
    console.log(issue);  
    if (!issue.issue_title || !issue.issue_text || !issue.created_by)
    {
      console.log('missing input');
      res.send('missing inputs');
    }
    else
    {
      MongoClient.connect(CONNECTION_STRING, { useNewUrlParser: true }, function(err, client){
        if (err) throw err;
        
        /*var database = db.db(project);
        database.collection(project).insertOne(issue, function(err, doc){*/
        var database = client.db(project);
        database.collection(project).insertOne(issue, function(err, doc){
          if (err){console.log('err')}
          
          console.log(doc);
          issue._id = doc.insertedId;
          res.json(issue);
        });
      });
    }
    })
    
    .put(function (req, res){
      var project = req.params.project;
    
    var issue = req.body._id;
    delete req.body._id;
    var updates = req.body;
    for (var ele in updates){
      if(!updates[ele]){
        delete updates[ele];
      }
    }
    if (updates.open)
    {
      updates.open = String(updates.open) == 'true'
    }
    if (Object.keys(updates).length === 0){
      res.send('no update field sent');
    } else{
      updates.updated_on = new Date();
      MongoClient.connect(CONNECTION_STRING, { useNewUrlParser: true }, function(err, client){
        if (err)
        {
          console.log('error :' + err); 
          throw err;
        }
        else {
        var myDB = client.db(project);
        var collection = myDB.collection(project);
        collection.findAndModify({_id: new ObjectId(issue)}, [['id',1]], {$set: updates}, {new: true}, function(err, doc){
          if(!err){
            res.send('successfully updated');
          } else{
          res.send('could not update ' + issue + ' ' + err);
          }
          
        });
      }
      });
    }
      
    })
    
    .delete(function (req, res){
      var project = req.params.project;
      var issue = req.body._id;
    
      if(!issue){
        res.send('_id error');
      }
    
      else{
        MongoClient.connect(CONNECTION_STRING,  { useNewUrlParser: true }, function(err, client){
          if (err) throw err;
          
        var myDB = client.db(project);
        var collection = myDB.collection(project);
        collection.findOneAndDelete({_id: new ObjectId(issue)},function(err, doc){
          if(!err){
            res.send('deleted ' + issue);
            console.log('deleted ');
          } else{
            res.send('could not delete ' + issue + ' ' + err);
          }
        });
          
        });
      }
    });
    
};
