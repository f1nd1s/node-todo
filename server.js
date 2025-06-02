// set up ======================================================================
var express = require('express');
var app = express();                      // create our app w/ express
var mongoose = require('mongoose');      // mongoose for mongodb
var port = process.env.PORT || 8080;     // set the port
var database = require('./config/database'); // load the database config
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

// connect to database
mongoose.connect(database.localUrl);

// middleware ==================================================================
app.use(express.static('./public'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({'extended': 'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({type: 'application/vnd.api+json'}));
app.use(methodOverride('X-HTTP-Method-Override'));

// PROMETHEUS METRICS SETUP ---------------------------------------------------
const client = require('prom-client');

// Collect default system metrics (CPU, memory, etc)
client.collectDefaultMetrics();

// Custom Counter Metric
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

// Middleware to count requests
app.use((req, res, next) => {
  res.on('finish', () => {
    const route = req.route && req.route.path ? req.route.path : req.path;
    httpRequestCounter.inc({
      method: req.method,
      route: route,
      status_code: res.statusCode
    });
  });
  next();
});

// METRICS endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
});

// routes ======================================================================
require('./app/routes.js')(app);

// START SERVER ================================================================
app.listen(port);
console.log("App listening on port " + port);

